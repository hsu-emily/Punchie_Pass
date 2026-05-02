import { useMemo } from 'react';
import PunchCardPreview from '@/features/punchpass/PunchCardPreview';
import { getCardLayout } from '@/features/punchpass/cardLayouts.config';
import './CreatePunchCard.css';

const cardModules = import.meta.glob('@/assets/punch_cards/*.png', { eager: true });
const iconModules = import.meta.glob('@/assets/icons/*.png', { eager: true });

const CARD_MAP = {};
for (const path in cardModules) {
  const filename = path.split('/').pop();
  CARD_MAP[filename] = cardModules[path].default;
}

const ICONS = Object.entries(iconModules)
  .map(([path, mod]) => {
    const filename = path.split('/').pop();
    const id = filename.replace('.png', '');
    return { id, url: mod.default };
  })
  .filter((i) => /^\d+$/.test(i.id))
  .sort((a, b) => Number(a.id) - Number(b.id));

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
  const iconId = pass.iconId || ICONS[0]?.id;
  const iconObj = ICONS.find((i) => i.id === iconId);

  const trimmedTitle = (pass.title || '').trim();
  const canSubmit = trimmedTitle.length > 0;

  const layout = useMemo(() => getCardLayout(cardImage), [cardImage]);

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

      <div className="cpc-grid">
        {/* Left: form */}
        <div className="cpc-form">
          <Field
            label="Title"
            required
            counter={`${(pass.title || '').length}/28`}
            hint="Give your habit a name"
            action={<AiSuggestPill onClick={() => alert('AI Suggest coming soon')} />}
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
            action={<AiSuggestPill onClick={() => alert('AI Suggest coming soon')} />}
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

        {/* Right: preview */}
        <div className="cpc-preview">
          <div className="cpc-preview-header">
            ★ LIVE PREVIEW · <span className="cpc-preview-theme">{theme.label}</span>
          </div>
          <div className="cpc-preview-card">
            <PunchCardPreview
              name={pass.title || 'Your Card'}
              description={pass.description || 'your description appears here'}
              cardImage={CARD_MAP[cardImage]}
              icon1={iconObj?.url}
              titlePlacement={layout.title}
              descriptionPlacement={layout.description}
              punchGridPlacement={layout.punchGrid}
              currentPunches={0}
              targetPunches={10}
            />
          </div>

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

          <div className="cpc-icon-section">
            <div className="cpc-icon-section-label">PUNCH ICON</div>
            <div className="cpc-icon-strip">
              {ICONS.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  className={`cpc-icon-tile ${iconId === ic.id ? 'is-active' : ''}`}
                  onClick={() => set('iconId', ic.id)}
                >
                  <img src={ic.url} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
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

function AiSuggestPill({ onClick }) {
  return (
    <button type="button" className="cpc-ai-pill" onClick={onClick}>
      ★ AI SUGGEST
    </button>
  );
}
