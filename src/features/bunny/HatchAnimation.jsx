/**
 * HatchAnimation — full-screen overlay that plays the same shaking → cracking
 * → hatched sequence as onboarding's HatchScene, but reusable anywhere a
 * bunny is hatched (gacha eggs from PetsPage today). Reuses the global
 * `pp-egg / pp-nest / pp-confetti` styles from handoff.css/tokens.css.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HatchedBunny from './HatchedBunny';
import { BUNNY_VARIANTS } from './bunnyVariants';
import './HatchAnimation.css';

const SHARDS = [
  { x: -40, y: -30, rot: -25, delay: 0.10 },
  { x:  40, y: -30, rot:  25, delay: 0.15 },
  { x: -30, y:  40, rot:  45, delay: 0.20 },
  { x:  30, y:  40, rot: -45, delay: 0.18 },
];

const CONFETTI_COLORS = ['#EC4899', '#F472B6', '#FBCFE8', '#C5B8FF', '#F3D279', '#B6E2C9'];

export default function HatchAnimation({ kind, onClose }) {
  const [phase, setPhase] = useState('shaking');
  const variant = BUNNY_VARIANTS[kind] || BUNNY_VARIANTS.bun;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('cracking'), 1800);
    const t2 = setTimeout(() => setPhase('hatched'),  2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="hatch-overlay"
        className="hatch-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="hatch-stage">
          <h2 className="hatch-title">
            {phase === 'hatched' ? `It's ${variant.name}!` : "Something's hatching…"}
          </h2>
          {phase !== 'hatched' && <p className="hatch-lede">Hold on a sec.</p>}

          <div className="pp-nest hatch-nest">
            {phase !== 'hatched' && <div className={`pp-egg ${phase}`} />}

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

            {phase === 'hatched' && (
              <>
                <Confetti />
                <HatchedBunny
                  kind={kind}
                  size={220}
                  style={{ animation: 'pp-pop-in 0.5s var(--pp-ease-bounce) both' }}
                />
              </>
            )}
          </div>

          {phase === 'hatched' && (
            <>
              <div className="hatch-tagline" style={{ animation: 'pp-fade-in 0.5s 0.35s both' }}>
                {variant.tagline}
              </div>
              <button
                className="hatch-btn"
                style={{ animation: 'pp-fade-in 0.5s 0.5s both' }}
                onClick={onClose}
              >
                Hi there ▸
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Confetti({ count = 18 }) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count;
    const dist  = 80 + (Math.sin(i * 17.3) * 30 + 30);
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
