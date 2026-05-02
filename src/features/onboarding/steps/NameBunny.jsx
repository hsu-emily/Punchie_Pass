/**
 * NameBunny — second onboarding screen. Captures the bunny's name.
 *
 * @param {string} props.value
 * @param {(name: string) => void} props.onChange
 * @param {() => void} props.onContinue
 *
 * Cycles a placeholder through suggestions every 1.8s and offers a few
 * one-tap chip suggestions. Disables continue until the field has text.
 */
import React, { useEffect, useState } from 'react';
import HatchedBunny from '@/features/bunny/HatchedBunny.jsx';

const SUGGESTIONS = ['Mochi', 'Biscuit', 'Dumpling', 'Peach', 'Marshmallow', 'Pudding'];

export default function NameBunny({ value, onChange, onContinue, kind = 'bun' }) {
  const [placeholder, setPlaceholder] = useState(SUGGESTIONS[0]);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % SUGGESTIONS.length;
      setPlaceholder(SUGGESTIONS[i]);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const trimmed = value.trim();

  return (
    <div className="pp-stage">
      <HatchedBunny kind={kind} size={140} />

      <h1 className="pp-h1">What should we call them?</h1>
      <p className="pp-lede">A good name is the start of a good friendship.</p>

      <div className="pp-name-input-wrap">
        <input
          autoFocus
          maxLength={14}
          placeholder={placeholder}
          className="pp-name-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && trimmed) onContinue();
          }}
        />
        <div className="pp-chips">
          {SUGGESTIONS.slice(0, 4).map((n) => (
            <button key={n} className="pp-chip" onClick={() => onChange(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        className="pp-btn pp-btn-primary"
        disabled={!trimmed}
        style={!trimmed ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
        onClick={onContinue}
      >
        Nice to meet you ▸
      </button>
    </div>
  );
}
