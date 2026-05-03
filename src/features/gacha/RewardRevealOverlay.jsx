/**
 * RewardRevealOverlay — capsule-first reveal with bare item display.
 *
 * Per item: capsule flies toward the screen (zoom from machine area) and
 * idle-bobs. Tap → pop SFX, capsule splits apart, item appears behind on the
 * blurred backdrop (no white panel, no OBTAINED stamp). Bottom: Next/Skip.
 *
 * After the last item: a single white "You obtained" summary panel listing
 * the full pull. The X close button is gone — exit via inventory/pets.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backpack, FastForward, PawPrint, Sparkles } from 'lucide-react';
import GachaItemArt from './GachaItemArt';
import { RARITY_META } from './gachaCatalog';
import { POP_URL, playOneShot } from './sounds';
import './RewardRevealOverlay.css';

export default function RewardRevealOverlay({ items, onClose, onGoToInventory, onGoToPets }) {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState('capsule'); // capsule | revealed | summary

  if (!items?.length) return null;
  const hasEgg = items.some((it) => it.kind === 'egg');
  const isLast = idx >= items.length - 1;
  const multi = items.length > 1;

  const crack = () => {
    if (stage !== 'capsule') return;
    playOneShot(POP_URL);
    setStage('revealed');
  };

  const next = () => {
    if (isLast) {
      setStage('summary');
      return;
    }
    setIdx((i) => i + 1);
    setStage('capsule');
  };

  const skip = () => setStage('summary');

  const counter = multi ? `${idx + 1} / ${items.length}` : null;

  return (
    <motion.div
      className="rro-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AnimatePresence mode="wait">
        {stage === 'capsule' && (
          <CapsuleStage
            key={`cap-${idx}`}
            item={items[idx]}
            counter={counter}
            onCrack={crack}
          />
        )}
        {stage === 'revealed' && (
          <RevealedStage
            key={`rev-${idx}`}
            item={items[idx]}
            counter={counter}
            isLast={isLast}
            onNext={next}
            onSkip={multi && !isLast ? skip : null}
          />
        )}
        {stage === 'summary' && (
          <SummaryStage
            key="summary"
            items={items}
            hasEgg={hasEgg}
            onPullMore={onClose}
            onGoToInventory={onGoToInventory}
            onGoToPets={onGoToPets}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CapsuleStage({ item, counter, onCrack }) {
  const meta = RARITY_META[item.awardedRarity] || RARITY_META[item.rarity] || RARITY_META.common;

  return (
    <motion.div
      className="rro-bare-stage"
      // Starts small + offset (from machine area) — flies toward viewer.
      initial={{ scale: 0.12, y: 260, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 1.15, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
    >
      {counter && <div className="rro-counter">{counter}</div>}

      <motion.button
        type="button"
        className="rro-bigcapsule"
        style={{ '--rarity': meta.accent }}
        onClick={onCrack}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Tap to open capsule"
      >
        <BigCapsule accent={meta.accent} />
        <SparkleField />
      </motion.button>

      <p className="rro-tap-hint">Tap to open</p>
    </motion.div>
  );
}

function RevealedStage({ item, counter, isLast, onNext, onSkip }) {
  const meta = RARITY_META[item.awardedRarity] || RARITY_META[item.rarity] || RARITY_META.common;

  return (
    <motion.div
      className="rro-reveal-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25 }}
    >
      {counter && <div className="rro-counter">{counter}</div>}

      <div className="rro-crack-wrap">
        {/* Capsule halves flying apart */}
        <motion.svg
          viewBox="0 0 120 120"
          className="rro-crack-half rro-crack-top"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: -240, rotate: -55, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <path d="M14 60 A46 46 0 0 1 106 60 Z" fill={meta.accent} stroke="#5B1B36" strokeWidth="2.5" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 120 120"
          className="rro-crack-half rro-crack-bottom"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 240, rotate: 40, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <path d="M14 60 A46 46 0 0 0 106 60 Z" fill="#fff" stroke="#5B1B36" strokeWidth="2.5" />
        </motion.svg>

        {/* Item revealed behind, no panel */}
        <motion.div
          className="rro-revealed-item"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 220, damping: 16 }}
        >
          <div
            className="rro-revealed-art"
            style={{ filter: `drop-shadow(0 0 32px ${meta.accent})` }}
          >
            <GachaItemArt item={item} size={180} />
          </div>
          <div className="rro-revealed-rarity" style={{ color: meta.accent }}>
            {meta.label}
          </div>
          <div className="rro-revealed-name">{item.name}</div>
        </motion.div>

        <CardConfetti count={20} />
      </div>

      <div className="rro-reveal-actions">
        {onSkip && (
          <button className="rro-skip" onClick={onSkip}>
            <FastForward size={14} /> Skip
          </button>
        )}
        <button className="rro-btn rro-btn-primary" onClick={onNext}>
          {isLast ? 'See all →' : 'Next →'}
        </button>
      </div>
    </motion.div>
  );
}

function SummaryStage({ items, hasEgg, onPullMore, onGoToInventory, onGoToPets }) {
  return (
    <motion.div
      className="rro-panel rro-panel-summary"
      initial={{ y: 20, scale: 0.94, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ y: 10, scale: 0.96, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <div className="rro-eyebrow">★ YOU OBTAINED ★</div>
      <h2 className="rro-title">
        {items.length === 1 ? 'A new capsule!' : `${items.length} new capsules!`}
      </h2>
      <p className="rro-lede">All saved to your inventory.</p>

      <div className={`rro-grid rro-grid-${Math.min(items.length, 5)}`}>
        {items.map((item, i) => (
          <RewardCard key={`${item.id}-${i}`} item={item} index={i} />
        ))}
      </div>

      <div className="rro-actions">
        {hasEgg && (
          <button className="rro-btn rro-btn-egg" onClick={onGoToPets}>
            <PawPrint size={16} /> Hatch egg
          </button>
        )}
        <button className="rro-btn rro-btn-secondary" onClick={onGoToInventory}>
          <Backpack size={16} /> View inventory
        </button>
        <button className="rro-btn rro-btn-primary" onClick={onPullMore}>
          <Sparkles size={16} /> Pull more
        </button>
      </div>
    </motion.div>
  );
}

function RewardCard({ item, index }) {
  const meta = RARITY_META[item.awardedRarity] || RARITY_META[item.rarity] || RARITY_META.common;
  return (
    <motion.div
      className="rro-card"
      style={{
        '--rarity': meta.accent,
        boxShadow: meta.glow === 'none' ? '0 4px 14px rgba(0,0,0,0.06)' : meta.glow,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.06, type: 'spring', stiffness: 240, damping: 14 }}
    >
      <div className="rro-card-ribbon" style={{ background: meta.accent }}>
        {meta.label}
      </div>
      <div className="rro-card-art">
        <GachaItemArt item={item} size={108} />
      </div>
      <div className="rro-card-name">{item.name}</div>
      <div className="rro-card-kind">{item.kind}</div>
    </motion.div>
  );
}

function BigCapsule({ accent }) {
  return (
    <svg viewBox="0 0 120 120" className="rro-capsule-svg">
      <defs>
        <linearGradient id="rroCapTop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
        <radialGradient id="rroCapShine" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M14 60 A46 46 0 0 1 106 60 Z" fill="url(#rroCapTop)" stroke="#5B1B36" strokeWidth="2.5" />
      <path d="M14 60 A46 46 0 0 0 106 60 Z" fill="#fff" stroke="#5B1B36" strokeWidth="2.5" />
      <rect x="14" y="58" width="92" height="5" fill="#FCE7F3" />
      <ellipse cx="46" cy="40" rx="18" ry="10" fill="url(#rroCapShine)" />
    </svg>
  );
}

function SparkleField() {
  const sparkles = [
    { x: 8, y: 16, d: 0 },
    { x: 90, y: 22, d: 0.3 },
    { x: 12, y: 76, d: 0.6 },
    { x: 86, y: 80, d: 0.9 },
    { x: 50, y: 4, d: 1.2 },
  ];
  return (
    <div className="rro-sparkle-field" aria-hidden>
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="rro-sparkle"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: s.d, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

const COLORS = ['#EC4899', '#F472B6', '#FBCFE8', '#C5B8FF', '#FFD27A', '#A5C2F0'];
function CardConfetti({ count = 14 }) {
  return (
    <div className="rro-card-confetti" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count;
        const dist = 80 + ((i * 13) % 30);
        return (
          <span
            key={i}
            className="rro-confetti"
            style={{
              background: COLORS[i % COLORS.length],
              borderRadius: i % 2 ? '50%' : '2px',
              ['--cx']: `${Math.cos(angle) * dist}px`,
              ['--cy']: `${Math.sin(angle) * dist - 8}px`,
              animationDelay: `${0.1 + i * 0.02}s`,
            }}
          />
        );
      })}
    </div>
  );
}
