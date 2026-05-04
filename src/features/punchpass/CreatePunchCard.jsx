import { useEffect, useMemo, useRef, useState } from 'react';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import PunchCard from '@/features/punchpass/PunchCard';
import { getCardLayout } from '@/features/punchpass/cardLayouts.config';
import { storage } from '@/services/firebase';
// AI features disabled for debugging — AiSuggest components return null.
// import { AiTitleSuggest, AiRewardSuggest } from './AiSuggest';
import defaultPunchIcon from '@/assets/icons/punch.webp';
import { CURSOR_LIST, DEFAULT_PUNCH_CURSOR_ID } from '@/assets/cursors/cursors';
import useGacha from '@/features/gacha/useGacha';
import useUploadSlots from '@/features/gacha/useUploadSlots';
import ShardIcon from '@/features/gacha/ShardIcon';
import './CreatePunchCard.css';

const iconModules = import.meta.glob('@/assets/icons/*/*.webp', { eager: true });
const cardImageModules = import.meta.glob('@/assets/punch_cards/*.webp', { eager: true });
// Assets are .webp on disk; user data and the gacha catalog still reference
// them by their original `.png` filename (e.g. `'WindowsPink.png'`).
const toPngKey = (filename) => filename.replace(/\.webp$/i, '.png');

const CARD_IMAGE_URLS = {};
for (const path in cardImageModules) {
  const filename = path.split('/').pop();
  CARD_IMAGE_URLS[toPngKey(filename)] = cardImageModules[path].default;
}

// Bucketed icons: id = "bucket/number" (e.g. "pink/4")
const ICONS_BY_BUCKET = {};
const ICON_URL_BY_ID = {};
for (const path in iconModules) {
  const parts = path.split('/');
  const filename = parts.pop();
  const bucket = parts.pop();
  const num = filename.replace(/\.webp$/i, '');
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

/**
 * Templates: only `pink` is free. Everything else is unlocked via the
 * Punchie Machine — `gacha: true` entries show as locked swatches until
 * the user owns a `pass-template` capsule with that `cardImage` ref.
 */
const COLOR_THEMES = [
  { id: 'pink',       label: 'PINK',       swatch: '#F9A8D4', cardImage: 'WindowsPink.png',   gacha: false },
  { id: 'mint',       label: 'MINT',       swatch: '#A8E6C0', cardImage: 'WindowsGreen.png',  gacha: true  },
  { id: 'lavender',   label: 'LAVENDER',   swatch: '#C5B8FF', cardImage: 'WindowsPurple.png', gacha: true  },
  { id: 'blue',       label: 'BLUE',       swatch: '#A8C8E8', cardImage: 'PlaidBlue.png',     gacha: true  },
  { id: 'sage',       label: 'SAGE',       swatch: '#B8E0B0', cardImage: 'PlaidGreen.png',    gacha: true  },
  { id: 'peach',      label: 'PEACH',      swatch: '#FFB59E', cardImage: 'LacePink.png',      gacha: true  },
  { id: 'coral',      label: 'CORAL',      swatch: '#F4A6A6', cardImage: 'LaceRed.png',       gacha: true  },
  { id: 'orchid',     label: 'ORCHID',     swatch: '#E8C9F4', cardImage: 'DigiCam.png',       gacha: true  },
  { id: 'honey',      label: 'HONEY',      swatch: '#F3D279', cardImage: 'FilmCam.png',       gacha: true  },
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

  // Owned items from the Punchie Machine — used to filter pickers down to
  // "free defaults + everything you've pulled". Anything you don't yet own
  // is hidden from the pickers entirely (templates show as locked instead).
  const { inventoryList } = useGacha();
  const ownedTemplateRefs = useMemo(
    () => new Set(
      inventoryList
        .filter((it) => it.kind === 'pass-template')
        .map((it) => it.ref)
    ),
    [inventoryList]
  );
  const ownedCursorRefs = useMemo(
    () => new Set(
      inventoryList.filter((it) => it.kind === 'cursor').map((it) => it.ref)
    ),
    [inventoryList]
  );
  const ownedIconRefs = useMemo(
    () => new Set(
      inventoryList.filter((it) => it.kind === 'icon').map((it) => it.ref)
    ),
    [inventoryList]
  );
  const isThemeUnlocked = (t) => !t.gacha || ownedTemplateRefs.has(t.cardImage);

  // Cursors: keep the two free defaults always available; otherwise only
  // show cursors the user has pulled.
  const FREE_CURSOR_IDS = new Set(['pointer', 'holepuncher']);
  const visibleCursors = useMemo(
    () => CURSOR_LIST.filter((c) => FREE_CURSOR_IDS.has(c.id) || ownedCursorRefs.has(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownedCursorRefs]
  );

  // Icons: keep the three free defaults always available, plus any custom
  // uploads under "yours". Other bucket entries are filtered to owned-only.
  const FREE_ICON_REFS = new Set([DEFAULT_ICON_ID, 'pixle/19', 'pixle/20', 'pixle/17']);
  const filterIcons = (list) =>
    (list || []).filter((ic) => FREE_ICON_REFS.has(ic.id) || ownedIconRefs.has(ic.id));

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

  useEffect(() => {
    if (!uploadError) return;
    const t = setTimeout(() => setUploadError(''), 4000);
    return () => clearTimeout(t);
  }, [uploadError]);
  const { slotsUnlocked, nextSlotCost, canUnlockNext } = useUploadSlots();

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
    const remaining = Math.max(0, slotsUnlocked - (pass.customIcons?.length || 0));
    if (remaining <= 0) {
      setUploadError(
        canUnlockNext
          ? `All ${slotsUnlocked} upload slots used. Unlock another in your inventory.`
          : `All ${slotsUnlocked} upload slots used. Recycle ${nextSlotCost} shards to unlock another.`
      );
      return;
    }
    if (files.length > remaining) {
      setUploadError(`Only ${remaining} slot${remaining === 1 ? '' : 's'} left — extras skipped.`);
    }
    const accepted = files.slice(0, remaining);
    setUploading(true);
    try {
      const uploaded = await Promise.all(accepted.map(async (file, i) => {
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

  const unlockedThemes = useMemo(
    () => COLOR_THEMES.filter(isThemeUnlocked),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownedTemplateRefs]
  );

  const cycleCard = (dir) => {
    if (unlockedThemes.length === 0) return;
    const idx = unlockedThemes.findIndex((t) => t.cardImage === cardImage);
    const base = idx === -1 ? 0 : idx;
    const nextIdx = (base + dir + unlockedThemes.length) % unlockedThemes.length;
    set('cardImage', unlockedThemes[nextIdx].cardImage);
  };

  const trimmedTitle = (pass.title || '').trim();
  const canSubmit = trimmedTitle.length > 0;

  const layout = useMemo(() => getCardLayout(cardImage), [cardImage]);

  const cursorId = pass.cursorId || DEFAULT_PUNCH_CURSOR_ID;

  const yoursIcons = customIcons.map((c) => ({ id: c.id, url: c.url, num: '' }));
  const iconsForBucket = activeBucket === 'yours'
    ? yoursIcons
    : filterIcons(ICONS_BY_BUCKET[activeBucket] || []);
  // Hide buckets that have no visible icons (other than "default" + "yours"
  // which always have content). Keeps the tab row from showing dead tabs.
  const visibleBuckets = ICON_BUCKETS.filter((b) => {
    if (b === 'default') return true;
    return filterIcons(ICONS_BY_BUCKET[b] || []).length > 0;
  });
  const allBuckets = [...visibleBuckets, 'yours'];

  return (
    <div className="cpc-page">
      {/* Header */}
      <div className="cpc-header">
        <div>
          <div className="cpc-eyebrow">★ {headerEyebrow}</div>
          <h1 className="cpc-title">{headerTitle}</h1>
        </div>
        <div className="cpc-header-actions">
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

      {/* Preview — sits on the page background, no white panel */}
      <section className="cpc-preview">
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
            <PunchCard
              habit={pass}
              name={pass.title || 'Your Card'}
              description={pass.description || 'your description appears here'}
              currentPunches={0}
              targetPunches={10}
              cursorId={cursorId}
              editMode
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
              // AI features disabled for debugging
              // action={
              //   <AiTitleSuggest
              //     currentDescription={pass.description}
              //     onApply={({ title, description, frequency }) =>
              //       onChange((p) => ({
              //         ...p,
              //         title: (title || '').slice(0, 28),
              //         description: description
              //           ? description.slice(0, 50)
              //           : p.description,
              //         frequency: frequency || p.frequency,
              //       }))
              //     }
              //   />
              // }
            >
              <input
                type="text"
                value={pass.title || ''}
                onChange={(e) => set('title', e.target.value.slice(0, 28))}
                placeholder="e.g. Drink water"
                className="cpc-input"
                style={{ fontFamily: layout.title?.fontFamily }}
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
                style={{ fontFamily: layout.description?.fontFamily }}
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
              // AI features disabled for debugging
              // action={
              //   <AiRewardSuggest
              //     habitTitle={pass.title}
              //     onApply={(reward) => set('reward', reward)}
              //   />
              // }
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
            <Field label="Card style">
              <div className="cpc-card-thumb-row">
                {COLOR_THEMES.filter(isThemeUnlocked).map((t) => {
                  const active = cardImage === t.cardImage;
                  const url = CARD_IMAGE_URLS[t.cardImage];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`cpc-card-thumb ${active ? 'is-active' : ''}`}
                      onClick={() => set('cardImage', t.cardImage)}
                      aria-label={t.label}
                      title={t.label}
                    >
                      <img src={url} alt="" />
                    </button>
                  );
                })}
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
                {activeBucket === 'yours' && (() => {
                  const used = customIcons.length;
                  const slotsFull = used >= slotsUnlocked;
                  return (
                    <button
                      type="button"
                      className="cpc-icon-tile cpc-icon-upload"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload image"
                      title={slotsFull
                        ? `All ${slotsUnlocked} slots used — recycle shards in inventory to unlock more`
                        : `Upload image (${used}/${slotsUnlocked} slots used)`}
                      disabled={uploading || slotsFull}
                    >
                      {uploading ? '…' : '+'}
                    </button>
                  );
                })()}
              </div>
              {activeBucket === 'yours' && (
                <div className="cpc-upload-meta">
                  {customIcons.length}/{slotsUnlocked} upload slot{slotsUnlocked === 1 ? '' : 's'} used
                  {customIcons.length >= slotsUnlocked && (
                    <> · need <ShardIcon size={12} /> {nextSlotCost} shards for next slot</>
                  )}
                </div>
              )}
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

            <Field label="Punch cursor" hint="Used when tapping the card to punch">
              <div className="cpc-cursor-row">
                {visibleCursors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`cpc-cursor-tile ${cursorId === c.id ? 'is-active' : ''}`}
                    onClick={() => set('cursorId', c.id)}
                    title={c.label}
                    aria-label={c.label}
                  >
                    <img src={c.cursor} alt="" />
                    <span className="cpc-cursor-label">{c.label}</span>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </section>
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
