import { useMemo, useRef, useState } from 'react';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import PunchCardPreview from '@/features/punchpass/PunchCardPreview';
import { getCardLayout } from '@/features/punchpass/cardLayouts.config';
import { storage } from '@/services/firebase';
import { AiTitleSuggest, AiRewardSuggest } from './AiSuggest';
import defaultPunchIcon from '@/assets/icons/punch.png';
import './CreatePunchCard.css';

const cardModules = import.meta.glob('@/assets/punch_cards/*.png', { eager: true });
const iconModules = import.meta.glob('@/assets/icons/*/*.png', { eager: true });

const CARD_MAP = {};
for (const path in cardModules) {
  const filename = path.split('/').pop();
  CARD_MAP[filename] = cardModules[path].default;
}

// Bucketed icons: id = "bucket/number" (e.g. "pink/4")
const ICONS_BY_BUCKET = {};
const ICON_URL_BY_ID = {};
for (const path in iconModules) {
  const parts = path.split('/');
  const filename = parts.pop();
  const bucket = parts.pop();
  const num = filename.replace('.png', '');
  const id = `${bucket}/${num}`;
  if (!ICONS_BY_BUCKET[bucket]) ICONS_BY_BUCKET[bucket] = [];
  ICONS_BY_BUCKET[bucket].push({ id, num, url: iconModules[path].default });
  ICON_URL_BY_ID[id] = iconModules[path].default;
}
for (const bucket in ICONS_BY_BUCKET) {
  ICONS_BY_BUCKET[bucket].sort((a, b) => Number(a.num) - Number(b.num));
}

// Default punch icon as a virtual entry in its own bucket so it can be picked.
const DEFAULT_ICON_ID = 'default/punch';
ICON_URL_BY_ID[DEFAULT_ICON_ID] = defaultPunchIcon;
ICONS_BY_BUCKET['default'] = [{ id: DEFAULT_ICON_ID, num: 'punch', url: defaultPunchIcon }];

const ICON_BUCKETS = ['default', ...Object.keys(ICONS_BY_BUCKET).filter((b) => b !== 'default').sort()];

export const FIRST_ICON_ID = DEFAULT_ICON_ID;
export const iconUrlForId = (id) => ICON_URL_BY_ID[id];

const COLOR_THEMES = [
  { id: 'pink',     label: 'PINK',     swatch: '#F9A8D4', cardImage: 'WindowsPink.png' },
  { id: 'mint',     label: 'MINT',     swatch: '#A8E6C0', cardImage: 'WindowsGreen.png' },
  { id: 'blue',     label: 'BLUE',     swatch: '#A8C8E8', cardImage: 'PlaidBlue.png' },
  { id: 'honey',    label: 'HONEY',    swatch: '#F3D279', cardImage: 'FilmCam.png' },
  { id: 'lavender', label: 'LAVENDER', swatch: '#C5B8FF', cardImage: 'WindowsPurple.png' },
  { id: 'peach',    label: 'PEACH',    swatch: '#FFB59E', cardImage: 'LacePink.png' },
];

const themeForCard = (cardImage) =>
  COLOR_THEMES.find((t) => t.cardImage === cardImage) || COLOR_THEMES[0];

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function CreatePunchCard({
  pass,
  onChange,
  onSubmit,
  onCancel,
  user,
  bunnyName,
  submitLabel = 'Create Punch Card',
  headerEyebrow = 'NEW PUNCH CARD',
  headerTitle = 'Create a Punch Card',
}) {
  const set = (k, v) => onChange((p) => ({ ...p, [k]: v }));
  const cardImage = pass.cardImage || COLOR_THEMES[0].cardImage;
  const theme = themeForCard(cardImage);

  // Backwards compatible: fall back to legacy iconId for slot 1.
  const icon1Id = pass.icon1Id || pass.iconId || DEFAULT_ICON_ID;
  const icon2Id = pass.icon2Id || DEFAULT_ICON_ID;

  // Custom uploaded icons (data URLs), stored in pass so they survive submit.
  const customIcons = pass.customIcons || [];
  const customIconMap = useMemo(() => {
    const m = {};
    customIcons.forEach((c) => { m[c.id] = c.url; });
    return m;
  }, [customIcons]);

  const resolveIconUrl = (id) => ICON_URL_BY_ID[id] || customIconMap[id];
  const icon1Url = resolveIconUrl(icon1Id);
  const icon2Url = resolveIconUrl(icon2Id);

  const [activeSlot, setActiveSlot] = useState(1);
  const activeIconId = activeSlot === 1 ? icon1Id : icon2Id;

  const initialBucket = activeIconId?.split('/')[0] || ICON_BUCKETS[0];
  const [activeBucket, setActiveBucket] = useState(initialBucket);

  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const setSlotIcon = (id) => {
    if (activeSlot === 1) onChange((p) => ({ ...p, icon1Id: id, iconId: id }));
    else onChange((p) => ({ ...p, icon2Id: id }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (!user?.uid) {
      setUploadError('Sign in to upload custom icons.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file, i) => {
        const safeName = file.name.replace(/[^\w.\-]+/g, '_');
        const path = `user-icons/${user.uid}/${Date.now()}-${i}-${safeName}`;
        const sref = storageRef(storage, path);
        await uploadBytes(sref, file, { contentType: file.type });
        const url = await getDownloadURL(sref);
        return { id: `yours/${path}`, url, path };
      }));
      onChange((p) => {
        const next = [...(p.customIcons || []), ...uploaded];
        const lastId = uploaded[uploaded.length - 1].id;
        const updated = { ...p, customIcons: next };
        if (activeSlot === 1) { updated.icon1Id = lastId; updated.iconId = lastId; }
        else { updated.icon2Id = lastId; }
        return updated;
      });
      setActiveBucket('yours');
    } catch (err) {
      console.error('Icon upload failed:', err);
      setUploadError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const cycleCard = (dir) => {
    const idx = COLOR_THEMES.findIndex((t) => t.cardImage === cardImage);
    const nextIdx = (idx + dir + COLOR_THEMES.length) % COLOR_THEMES.length;
    set('cardImage', COLOR_THEMES[nextIdx].cardImage);
  };

  const trimmedTitle = (pass.title || '').trim();
  const canSubmit = trimmedTitle.length > 0;

  const layout = useMemo(() => getCardLayout(cardImage), [cardImage]);

  const yoursIcons = customIcons.map((c) => ({ id: c.id, url: c.url, num: '' }));
  const iconsForBucket = activeBucket === 'yours' ? yoursIcons : (ICONS_BY_BUCKET[activeBucket] || []);
  const allBuckets = [...ICON_BUCKETS, 'yours'];

  return (
    <div className="cpc-page">
      {/* Header */}
      <div className="cpc-header">
        <div>
          <div className="cpc-eyebrow">★ {headerEyebrow}</div>
          <h1 className="cpc-title">{headerTitle}</h1>
        </div>
        <div className="cpc-header-right">
          {bunnyName && (
            <div className="cpc-user-pill">
              <span>{bunnyName.toUpperCase()}</span>
              <span className="cpc-user-icon">🐰</span>
            </div>
          )}
          {onCancel && (
            <button className="cpc-x" onClick={onCancel} aria-label="Close">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Preview — sits on the page background, no white panel */}
      <section className="cpc-preview">
        <div className="cpc-preview-header">
          ★ LIVE PREVIEW · <span className="cpc-preview-theme">{theme.label}</span>
        </div>
        <div className="cpc-preview-stage-wrap">
          <button
            type="button"
            className="cpc-nav-arrow cpc-nav-arrow-left"
            onClick={() => cycleCard(-1)}
            aria-label="Previous card"
          >
            ‹
          </button>
          <div className="cpc-preview-card">
            <PunchCardPreview
              name={pass.title || 'Your Card'}
              description={pass.description || 'your description appears here'}
              cardImage={CARD_MAP[cardImage]}
              icon1={icon1Url}
              icon2={icon2Url}
              titlePlacement={layout.title}
              descriptionPlacement={layout.description}
              punchGridPlacement={layout.punchGrid}
              currentPunches={0}
              targetPunches={10}
            />
          </div>
          <button
            type="button"
            className="cpc-nav-arrow cpc-nav-arrow-right"
            onClick={() => cycleCard(1)}
            aria-label="Next card"
          >
            ›
          </button>
        </div>
      </section>

      <div className="cpc-grid">
        {/* Editing controls */}
        <section className="cpc-controls">
          <div className="cpc-controls-col">
            <Field
              label="Title"
              required
              counter={`${(pass.title || '').length}/28`}
              hint="Give your habit a name"
              action={
                <AiTitleSuggest
                  currentDescription={pass.description}
                  onApply={({ title, description, frequency }) =>
                    onChange((p) => ({
                      ...p,
                      title: (title || '').slice(0, 28),
                      description: description
                        ? description.slice(0, 50)
                        : p.description,
                      frequency: frequency || p.frequency,
                    }))
                  }
                />
              }
            >
              <input
                type="text"
                value={pass.title || ''}
                onChange={(e) => set('title', e.target.value.slice(0, 28))}
                placeholder="e.g. Drink water"
                className="cpc-input"
                maxLength={28}
              />
            </Field>

            <Field
              label="Description"
              counter={`${(pass.description || '').length}/50`}
            >
              <textarea
                value={pass.description || ''}
                onChange={(e) => set('description', e.target.value.slice(0, 50))}
                placeholder="What does one punch mean?"
                className="cpc-textarea"
                maxLength={50}
                rows={2}
              />
            </Field>

            <Field label="How often?">
              <div className="cpc-segmented">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`cpc-segment ${pass.frequency === f ? 'is-active' : ''}`}
                    onClick={() => set('frequency', f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Reward when complete"
              action={
                <AiRewardSuggest
                  habitTitle={pass.title}
                  onApply={(reward) => set('reward', reward)}
                />
              }
            >
              <input
                type="text"
                value={pass.reward || ''}
                onChange={(e) => set('reward', e.target.value)}
                placeholder="Bubble tea 🧋"
                className="cpc-input"
              />
            </Field>
          </div>

          <div className="cpc-controls-col">
            <Field label="Card color">
              <div className="cpc-swatch-row">
                {COLOR_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`cpc-swatch ${cardImage === t.cardImage ? 'is-active' : ''}`}
                    style={{ background: t.swatch }}
                    onClick={() => set('cardImage', t.cardImage)}
                    aria-label={t.label}
                    title={t.label}
                  />
                ))}
              </div>
            </Field>

            <div className="cpc-icon-section">
              <div className="cpc-icon-section-label">PUNCH ICONS</div>

              {/* Two slot picker — choose which slot to edit */}
              <div className="cpc-slot-row">
                <button
                  type="button"
                  className={`cpc-slot ${activeSlot === 1 ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveSlot(1);
                    setActiveBucket(icon1Id?.split('/')[0] || ICON_BUCKETS[0]);
                  }}
                >
                  <span className="cpc-slot-label">Punch 1</span>
                  <span className="cpc-slot-icon">
                    <img src={icon1Url} alt="" />
                  </span>
                </button>
                <button
                  type="button"
                  className={`cpc-slot ${activeSlot === 2 ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveSlot(2);
                    setActiveBucket(icon2Id?.split('/')[0] || ICON_BUCKETS[0]);
                  }}
                >
                  <span className="cpc-slot-label">Punch 2</span>
                  <span className="cpc-slot-icon">
                    <img src={icon2Url} alt="" />
                  </span>
                </button>
              </div>

              <div className="cpc-bucket-tabs">
                {allBuckets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`cpc-bucket-tab ${activeBucket === b ? 'is-active' : ''}`}
                    onClick={() => setActiveBucket(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="cpc-icon-strip">
                {iconsForBucket.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    className={`cpc-icon-tile ${activeIconId === ic.id ? 'is-active' : ''}`}
                    onClick={() => setSlotIcon(ic.id)}
                  >
                    <img src={ic.url} alt="" />
                  </button>
                ))}
                {activeBucket === 'yours' && (
                  <button
                    type="button"
                    className="cpc-icon-tile cpc-icon-upload"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload image"
                    title="Upload image"
                    disabled={uploading}
                  >
                    {uploading ? '…' : '+'}
                  </button>
                )}
              </div>
              {uploadError && <div className="cpc-upload-error">{uploadError}</div>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="cpc-footer">
        <div className="cpc-footer-hint">
          {canSubmit ? '' : 'Pick a title to get started'}
        </div>
        <div className="cpc-footer-actions">
          {onCancel && (
            <button className="cpc-btn cpc-btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className="cpc-btn cpc-btn-primary"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, counter, hint, action, children }) {
  return (
    <label className="cpc-field">
      <div className="cpc-field-head">
        <span className="cpc-field-label">
          {label}
          {required && <span className="cpc-field-required">*</span>}
        </span>
        {action}
      </div>
      {children}
      <div className="cpc-field-foot">
        {hint && <span className="cpc-field-hint">{hint}</span>}
        {counter && <span className="cpc-field-counter">{counter}</span>}
      </div>
    </label>
  );
}
