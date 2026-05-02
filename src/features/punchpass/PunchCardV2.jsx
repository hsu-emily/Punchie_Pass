/**
 * PunchCard — the central interactive component.
 *
 * Click anywhere on the card to "punch" the next slot. Each slot animates
 * filling in. Once `punches >= total` the onComplete callback fires.
 *
 * @param {Object} props
 * @param {string} props.title       — e.g. "Drink Water"
 * @param {string} props.subtitle    — e.g. "8 glasses a day"
 * @param {number} props.punches     — punches made so far (controlled)
 * @param {number} props.total       — defaults to 10
 * @param {string} [props.iconUrl]   — small icon shown inside filled slots
 * @param {'lacy'|'plain'|'mint'} [props.variant]
 * @param {boolean} [props.canPunchToday] — disables click & dims the next slot
 * @param {() => void} [props.onPunch]
 * @param {() => void} [props.onComplete]
 *
 * Pair with utils/useCanPunchToday for the gating logic, and with
 * utils/unlockRules to decide what to award when onComplete fires.
 */
import React, { useEffect, useRef } from 'react';

export default function PunchCard({
  title,
  subtitle,
  punches = 0,
  total = 10,
  iconUrl,
  variant = 'lacy',
  canPunchToday = true,
  onPunch,
  onComplete,
}) {
  const wasComplete = useRef(false);
  useEffect(() => {
    if (punches >= total && !wasComplete.current) {
      wasComplete.current = true;
      onComplete?.();
    }
    if (punches < total) wasComplete.current = false;
  }, [punches, total, onComplete]);

  const handleClick = () => {
    if (!canPunchToday) return;
    if (punches >= total) return;
    onPunch?.();
  };

  return (
    <div
      className={`pp-punch-card pp-pc-${variant} ${!canPunchToday ? 'pp-pc-locked' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      <div className="pp-pc-bg" />
      <div className="pp-pc-title">{title}</div>
      <div className="pp-pc-sub">{subtitle}</div>
      <div className="pp-pc-grid" data-cols={Math.ceil(total / 2)}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < punches;
          const next   = i === punches && canPunchToday;
          return (
            <div
              key={i}
              className={`pp-pc-slot ${filled ? 'is-filled' : ''} ${next ? 'is-next' : ''}`}
              aria-label={filled ? 'punched' : 'empty'}
            >
              {filled && iconUrl && (
                <img src={iconUrl} alt="" style={{ imageRendering: 'pixelated' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
