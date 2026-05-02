/**
 * BorderPicker — pick the lacy frame for the Student ID card.
 *
 * Borders are passed in as data so unlock state is owned upstream
 * (e.g. derived from `useUnlockedRewards()`).
 *
 * @param {Object} props
 * @param {Array<{id:string, name:string, url:string, unlocked:boolean, lockedHint?:string}>} props.borders
 * @param {string} props.value
 * @param {(id: string) => void} props.onChange
 * @param {() => void} props.onContinue
 * @param {() => void} [props.onSkip]
 */
import React from 'react';

export default function BorderPicker({
  borders,
  value,
  onChange,
  onContinue,
  onSkip,
}) {
  return (
    <div className="pp-stage">
      <h1 className="pp-h1">Pick your Student ID border</h1>
      <p className="pp-lede">You can swap this anytime — and unlock more as you go.</p>

      <div className="pp-border-grid">
        {borders.map((b) => (
          <button
            key={b.id}
            className={`pp-border-tile ${value === b.id ? 'is-active' : ''} ${!b.unlocked ? 'is-locked' : ''}`}
            onClick={() => b.unlocked && onChange(b.id)}
            title={!b.unlocked ? b.lockedHint : b.name}
            aria-disabled={!b.unlocked}
          >
            <img src={b.url} alt={b.name} />
            {!b.unlocked && <span className="pp-lock-pip">🔒</span>}
          </button>
        ))}
      </div>

      <div className="pp-row pp-gap-md">
        {onSkip && <button className="pp-btn pp-btn-ghost" onClick={onSkip}>Skip</button>}
        <button className="pp-btn pp-btn-primary" onClick={onContinue}>Looks good ▸</button>
      </div>
    </div>
  );
}
