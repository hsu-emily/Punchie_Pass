/**
 * HatchScene — the "egg → cracking → bunny appears" intro animation.
 *
 * Drives a 3-phase animation: shaking → cracking → hatched. When hatched,
 * shows confetti + the new bunny + a button that calls onContinue.
 *
 * Drop in your onboarding route as the second screen (after a Landing).
 * Keep it short — the goal is delight, not interrupt.
 *
 * @param {() => void} props.onContinue
 */
import React, { useEffect, useState } from 'react';
import Bunny from '@/features/bunny/Bunny.jsx';

const SHARDS = [
  { x: -40, y: -30, rot: -25, delay: 0.10 },
  { x:  40, y: -30, rot:  25, delay: 0.15 },
  { x: -30, y:  40, rot:  45, delay: 0.20 },
  { x:  30, y:  40, rot: -45, delay: 0.18 },
];

const CONFETTI_COLORS = ['#EC4899', '#F472B6', '#FBCFE8', '#C5B8FF', '#F3D279', '#B6E2C9'];

export default function HatchScene({ onContinue }) {
  const [phase, setPhase] = useState('shaking');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('cracking'), 1800);
    const t2 = setTimeout(() => setPhase('hatched'),  2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="pp-stage">
      <h1 className="pp-h1-script">Something's hatching…</h1>
      <p className="pp-lede">Hold on a sec.</p>

      <div className="pp-nest">
        {phase !== 'hatched' && (
          <div className={`pp-egg ${phase}`} />
        )}

        {phase === 'cracking' && SHARDS.map((s, i) => (
          <div
            key={i}
            className="pp-egg-shard"
            style={{
              left: `calc(50% + ${s.x}px)`,
              top:  `calc(50% + ${s.y}px)`,
              transform: `rotate(${s.rot}deg)`,
              animation: `pp-crack-burst 0.8s ${s.delay}s forwards`,
            }}
          />
        ))}

        {phase === 'hatched' && <>
          <Confetti />
          <Bunny size="large" popIn />
        </>}
      </div>

      {phase === 'hatched' && (
        <button
          className="pp-btn pp-btn-primary"
          style={{ marginTop: 64, animation: 'pp-fade-in 0.5s 0.3s both' }}
          onClick={onContinue}
        >
          Hi there ▸
        </button>
      )}

      <button className="pp-skip" onClick={onContinue}>skip ›</button>
    </div>
  );
}

function Confetti({ count = 18 }) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count;
    const dist  = 80 + (Math.sin(i * 17.3) * 30 + 30); // deterministic-ish jitter
    return (
      <div
        key={i}
        className="pp-confetti"
        style={{
          left: '50%',
          top:  '50%',
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          borderRadius: i % 2 ? '50%' : '2px',
          ['--cx']: `${Math.cos(angle) * dist}px`,
          ['--cy']: `${Math.sin(angle) * dist - 30}px`,
          animation: `pp-confetti-burst 1s ${i * 0.012}s forwards`,
        }}
      />
    );
  });
}
