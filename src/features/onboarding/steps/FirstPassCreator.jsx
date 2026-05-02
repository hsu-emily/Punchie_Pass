/**
 * FirstPassCreator — the form for a user's first punch pass, with a live
 * MiniCard preview to the right. Reusable as `<PassEditor>` for editing
 * existing passes too.
 *
 * @param {Object} props.pass     — { title, subtitle, frequency, iconId, reward }
 * @param {(updater: Function | Object) => void} props.onChange
 * @param {() => void} props.onContinue
 * @param {Array<{id:string, url:string}>} props.icons
 * @param {(iconId: string) => string} props.iconUrl  — resolver
 */
import React from 'react';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function FirstPassCreator({
  pass,
  onChange,
  onContinue,
  icons,
  iconUrl,
}) {
  const set = (k, v) => onChange((p) => ({ ...p, [k]: v }));

  return (
    <div className="pp-stage pp-stage-tight">
      <h1 className="pp-h1">Your first punch pass</h1>
      <p className="pp-lede">10 punches gets you a reward. Make it small and steady.</p>

      <div className="pp-creator">
        <div className="pp-creator-form">
          <Field label="Title">
            <input
              maxLength={28}
              value={pass.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Drink water"
            />
          </Field>
          <Field label="Subtitle">
            <input
              maxLength={36}
              value={pass.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder="8 glasses a day"
            />
          </Field>
          <Field label="How often?">
            <div className="pp-row pp-gap-sm">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  className={`pp-freq-pill ${pass.frequency === f ? 'is-active' : ''}`}
                  onClick={() => set('frequency', f)}
                >{f}</button>
              ))}
            </div>
          </Field>
          <Field label="Punch icon">
            <div className="pp-icon-strip">
              {icons.slice(0, 8).map((ic) => (
                <button
                  key={ic.id}
                  className={`pp-icon-tile ${pass.iconId === ic.id ? 'is-active' : ''}`}
                  onClick={() => set('iconId', ic.id)}
                >
                  <img src={ic.url} alt="" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Reward when complete">
            <input
              maxLength={40}
              value={pass.reward}
              onChange={(e) => set('reward', e.target.value)}
              placeholder="Bubble tea 🧋"
            />
          </Field>
        </div>

        <div className="pp-creator-preview">
          <div className="pp-pixel-label">PREVIEW</div>
          <MiniPassCard pass={pass} iconUrl={pass.iconId ? iconUrl(pass.iconId) : null} />
        </div>
      </div>

      <button className="pp-btn pp-btn-primary" onClick={onContinue}>
        Start punching ▸
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="pp-field">
      <span className="pp-field-label">{label}</span>
      {children}
    </label>
  );
}

/** A tiny static preview card. Exported separately for reuse in lists. */
export function MiniPassCard({ pass, punches = 0, iconUrl }) {
  return (
    <div className="pp-mini-card">
      <div className="pp-mini-title">{pass.title || 'Daily Check-in'}</div>
      <div className="pp-mini-sub">{pass.subtitle || '10 punches → reward'}</div>
      <div className="pp-mini-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`pp-mini-slot ${i < punches ? 'is-filled' : ''}`}>
            {i < punches && iconUrl && <img src={iconUrl} alt="" />}
          </div>
        ))}
      </div>
    </div>
  );
}
