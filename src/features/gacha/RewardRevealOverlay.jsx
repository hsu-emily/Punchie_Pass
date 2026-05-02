/**
 * RewardRevealOverlay — fullscreen pop-in with the pulled items.
 *
 * Each card shows the real GachaItemArt, glows with its rarity accent, and
 * is click-to-obtain. Tapping a card flips it to an "OBTAINED ✓" state
 * with a confetti puff. When all cards are acknowledged (or the user clicks
 * the close button), the overlay dismisses; items are already in inventory
 * the moment the pull resolves — this layer is purely the satisfying finish.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backpack, Check, PawPrint, X } from 'lucide-react';
import GachaItemArt from './GachaItemArt';
import { RARITY_META } from './gachaCatalog';
import './RewardRevealOverlay.css';

export default function RewardRevealOverlay({ items, onClose, onGoToInventory, onGoToPets }) {
  const [obtained, setObtained] = useState(() => new Set());
  const [allFlipped, setAllFlipped] = useState(false);

  useEffect(() => {
    if (!items?.length) return;
    if (obtained.size >= items.length) {
      const t = setTimeout(() => setAllFlipped(true), 250);
      return () => clearTimeout(t);
    }
  }, [obtained.size, items?.length]);

  if (!items?.length) return null;
  const hasEgg = items.some((it) => it.kind === 'egg');

  const markObtained = (key) => {
    setObtained((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const obtainAll = () => {
    setObtained(new Set(items.map((_, i) => i)));
  };

  return (
    <motion.div
      className="rro-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="rro-panel"
        initial={{ y: 18, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 12, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      >
        <button className="rro-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="rro-eyebrow">★ YOU OBTAINED ★</div>
        <h2 className="rro-title">
          {items.length === 1 ? 'A new capsule!' : `${items.length} new capsules!`}
        </h2>
        <p className="rro-lede">
          Tap each one to add it to your collection.
        </p>

        <div className={`rro-grid rro-grid-${Math.min(items.length, 5)}`}>
          {items.map((item, i) => (
            <RewardCard
              key={`${item.id}-${i}`}
              item={item}
              index={i}
              flipped={obtained.has(i)}
              onClick={() => markObtained(i)}
            />
          ))}
        </div>

        <div className="rro-actions">
          {obtained.size < items.length && (
            <button className="rro-btn rro-btn-ghost" onClick={obtainAll}>
              Tap all
            </button>
          )}
          {hasEgg && (
            <button className="rro-btn rro-btn-egg" onClick={onGoToPets}>
              <PawPrint size={16} /> Hatch egg
            </button>
          )}
          <button
            className="rro-btn rro-btn-primary"
            onClick={onGoToInventory}
          >
            <Backpack size={16} /> View inventory
          </button>
        </div>

        {allFlipped && (
          <motion.p
            className="rro-allset"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✦ All collected!
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

function RewardCard({ item, index, flipped, onClick }) {
  const meta = RARITY_META[item.awardedRarity] || RARITY_META[item.rarity] || RARITY_META.common;

  return (
    <motion.button
      type="button"
      className={`rro-card ${flipped ? 'is-flipped' : ''}`}
      style={{
        '--rarity': meta.accent,
        boxShadow: meta.glow === 'none' ? '0 4px 14px rgba(0,0,0,0.06)' : meta.glow,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.6, rotate: -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        delay: 0.08 + index * 0.12,
        type: 'spring',
        stiffness: 240,
        damping: 14,
      }}
      whileHover={!flipped ? { y: -4, rotate: 1 } : undefined}
      whileTap={!flipped ? { scale: 0.96 } : undefined}
      onClick={onClick}
      aria-pressed={flipped}
    >
      <div className="rro-card-ribbon" style={{ background: meta.accent }}>
        {meta.label}
      </div>

      <div className="rro-card-art">
        <GachaItemArt item={item} size={108} />
      </div>

      <div className="rro-card-name">{item.name}</div>
      <div className="rro-card-kind">{item.kind}</div>

      {item.rolledRarity && item.rolledRarity !== item.awardedRarity && (
        <div className="rro-card-pity">★ pity rescue ★</div>
      )}

      <AnimatePresence>
        {flipped && (
          <motion.div
            className="rro-stamp"
            initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Check size={20} strokeWidth={3.5} />
            OBTAINED
          </motion.div>
        )}
      </AnimatePresence>

      {flipped && <CardConfetti />}
    </motion.button>
  );
}

const COLORS = ['#EC4899', '#F472B6', '#FBCFE8', '#C5B8FF', '#FFD27A', '#A5C2F0'];
function CardConfetti({ count = 10 }) {
  return (
    <div className="rro-card-confetti" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count;
        const dist = 38 + ((i * 13) % 18);
        return (
          <span
            key={i}
            className="rro-confetti"
            style={{
              background: COLORS[i % COLORS.length],
              borderRadius: i % 2 ? '50%' : '2px',
              ['--cx']: `${Math.cos(angle) * dist}px`,
              ['--cy']: `${Math.sin(angle) * dist - 6}px`,
              animationDelay: `${i * 0.02}s`,
            }}
          />
        );
      })}
    </div>
  );
}
