/**
 * GachaPage — the Punchie Machine.
 *
 * Pull flow (no reveal grid; items go straight into inventory):
 *   idle → crank      windup music starts; machine shakes
 *        → drop       capsule falls into the chute
 *        → crack      capsule splits open at chute, pop SFX, confetti burst
 *        → idle       toast surfaces "+N capsules → Inventory" / egg CTA
 *
 * Inventory lives on its own page now (StudentIdPage → "Your Inventory").
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Backpack, ListChecks, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useGacha from './useGacha';
import DropListModal from './DropListModal';
import RewardRevealOverlay from './RewardRevealOverlay';
import { PITY_RULES, PULL_BUNDLES, RARITY_META } from './gachaCatalog';
import { POP_URL, WINDUP_URL, playLoop, playOneShot } from './sounds';
import './GachaPage.css';

function pityHintFor(counter) {
  let bestNote = null;
  let bestDist = Infinity;
  for (const rule of PITY_RULES) {
    const dist = rule.everyN - (counter % rule.everyN || rule.everyN);
    const wait = dist === 0 ? rule.everyN : dist;
    if (wait < bestDist) {
      bestDist = wait;
      bestNote = `next ${rule.floor}+ guaranteed in ${wait}`;
    }
  }
  return bestNote || 'no pity active';
}

// Total animation budget ~6s: 3s wind-up → 1.8s drop → 1.2s crack → reveal.
const CRANK_MS = 3000;
const DROP_MS = 1800;
const CRACK_MS = 1200;

export default function GachaPage() {
  const navigate = useNavigate();
  const { tokensAvailable, pullsUsed, pityCounter, bonusTokens, inventory, pull, pulling, error } =
    useGacha();
  const [phase, setPhase] = useState('idle'); // idle | crank | drop | crack
  const [revealItems, setRevealItems] = useState(null);
  const [showDropList, setShowDropList] = useState(false);
  const [pendingError, setPendingError] = useState(null);
  const timersRef = useRef([]);
  const stopWindupRef = useRef(() => {});

  const ownedIds = useMemo(() => new Set(Object.keys(inventory || {})), [inventory]);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    stopWindupRef.current();
  }, []);

  const queueTimer = (fn, delay) => {
    const t = setTimeout(fn, delay);
    timersRef.current.push(t);
    return t;
  };

  const handlePull = async (count) => {
    if (phase !== 'idle') return;
    setPendingError(null);
    setRevealItems(null);
    setPhase('crank');

    // Wind-up music begins immediately. Stops at end of crack.
    stopWindupRef.current = playLoop(WINDUP_URL);

    try {
      const itemsPromise = pull(count);
      queueTimer(() => setPhase('drop'), CRANK_MS);
      queueTimer(() => {
        setPhase('crack');
        playOneShot(POP_URL);
      }, CRANK_MS + DROP_MS);

      const items = await itemsPromise;

      queueTimer(() => {
        stopWindupRef.current();
        setPhase('idle');
        setRevealItems(items);
      }, CRANK_MS + DROP_MS + CRACK_MS);
    } catch (err) {
      stopWindupRef.current();
      setPendingError(err.message || 'Pull failed');
      setPhase('idle');
    }
  };

  const leadRarity = revealItems?.[0]?.awardedRarity || 'common';
  const leadAccent = RARITY_META[leadRarity]?.accent || RARITY_META.common.accent;
  const errorText = pendingError || error?.message;

  return (
    <div className="gacha-page">
      <header className="gacha-header">
        <button className="gacha-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <h1 className="gacha-title">Punchie Machine</h1>
        <button className="gacha-back gacha-inv-link" onClick={() => navigate('/inventory')}>
          <Backpack size={16} /> Inventory
        </button>
      </header>

      <div className="gacha-token-card">
        <div className="gacha-token-row">
          <span className="gacha-token-label">PUNCHIE TOKENS</span>
          <span className="gacha-token-num">✦ {tokensAvailable}</span>
        </div>
        <div className="gacha-token-meta">
          {pullsUsed} pulls all-time · {pityHintFor(pityCounter)}
          {bonusTokens > 0 && ` · ${bonusTokens} bonus`}
        </div>
      </div>

      <PunchieMachine phase={phase} accent={leadAccent} />

      <div className="gacha-actions">
        {PULL_BUNDLES.map((n) => (
          <button
            key={n}
            className="gacha-pull-btn"
            disabled={pulling || phase !== 'idle' || tokensAvailable < n}
            onClick={() => handlePull(n)}
          >
            <Sparkles size={16} /> Pull ×{n}
            <span className="gacha-pull-cost">{n} ✦</span>
          </button>
        ))}
        <button
          className="gacha-droplist-btn"
          onClick={() => setShowDropList(true)}
        >
          <ListChecks size={16} /> Drop list
        </button>
      </div>

      {errorText && <p className="gacha-error">{errorText}</p>}

      <AnimatePresence>
        {revealItems && (
          <RewardRevealOverlay
            items={revealItems}
            onClose={() => setRevealItems(null)}
            onGoToInventory={() => navigate('/inventory')}
            onGoToPets={() => navigate('/pets')}
          />
        )}
        {showDropList && (
          <DropListModal
            ownedIds={ownedIds}
            onClose={() => setShowDropList(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── The machine itself ─────────────────────────────────────── */
function PunchieMachine({ phase, accent }) {
  const showCapsule = phase === 'drop' || phase === 'crack';

  return (
    <div className={`pm-frame ${phase}`}>
      <svg viewBox="0 0 220 320" className="pm-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pmGlobe" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.85" />
          </radialGradient>
          <linearGradient id="pmBody" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id="pmCrank" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFD27A" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="312" rx="86" ry="6" fill="rgba(220,60,130,0.18)" />

        <rect x="28" y="148" width="164" height="148" rx="18" fill="url(#pmBody)"
              stroke="#DB2777" strokeWidth="3" />
        <rect x="48" y="170" width="124" height="46" rx="8" fill="#fff"
              stroke="#DB2777" strokeWidth="2.5" />
        <text x="110" y="194" textAnchor="middle"
              fontFamily="Press Start 2P, monospace" fontSize="9" fill="#DB2777">
          ★ PUNCHIE ★
        </text>
        <text x="110" y="208" textAnchor="middle"
              fontFamily="Press Start 2P, monospace" fontSize="6.5" fill="#9D2A66">
          INSERT TOKEN
        </text>

        <rect x="98" y="226" width="24" height="5" rx="2.5" fill="#5B1B36" />

        <rect x="74" y="252" width="72" height="32" rx="6" fill="#5B1B36" />
        <rect x="82" y="260" width="56" height="18" rx="3" fill="#2C0F1B" />

        <circle cx="178" cy="240" r="11" fill="#5B1B36" />
        <g
          style={{
            transformOrigin: '178px 240px',
            transformBox: 'fill-box',
            animation: phase === 'crank' ? 'pm-crank 3s cubic-bezier(0.45, 0, 0.55, 1) 1' : 'none',
          }}
        >
          <circle cx="178" cy="240" r="9" fill="url(#pmCrank)"
                  stroke="#DB2777" strokeWidth="2" />
          <rect x="187" y="237" width="14" height="6" rx="3" fill="#5B1B36" />
          <circle cx="201" cy="240" r="4.5" fill="#FFD27A" stroke="#5B1B36" strokeWidth="1.5" />
        </g>

        <circle cx="110" cy="86" r="68" fill="url(#pmGlobe)"
                stroke="#F472B6" strokeWidth="3" />
        <path d="M70 60 Q86 38 110 38" stroke="#fff" strokeWidth="6"
              strokeLinecap="round" fill="none" opacity="0.7" />

        <CapsuleDot cx={86} cy={88} fill="#A5C2F0" />
        <CapsuleDot cx={120} cy={70} fill="#FFD27A" />
        <CapsuleDot cx={102} cy={118} fill="#C5B7FF" />
        <CapsuleDot cx={138} cy={102} fill="#F472B6" />

        <rect x="84" y="142" width="52" height="14" rx="4" fill="#DB2777" />

        <text x="46" y="266" fontSize="10" fill="#fff" opacity="0.9">♡</text>
        <text x="160" y="266" fontSize="10" fill="#fff" opacity="0.9">♡</text>
      </svg>

      {/* Falling / cracking capsule overlay */}
      <AnimatePresence>
        {showCapsule && (
          <motion.div
            key="capsule"
            className={`pm-capsule pm-capsule-${phase}`}
            initial={{ x: '-50%', y: -30, scale: 0.4, opacity: 0 }}
            animate={
              phase === 'drop'
                ? {
                    x: '-50%',
                    // Slow build: enter, pause at top, drop, bounce, settle.
                    y: [-30, -10, -10, 60, 140, 132, 138, 134, 138],
                    scale: [0.6, 0.85, 0.85, 0.95, 1.05, 1.0, 1.02, 1.0, 1.0],
                    rotate: [0, -8, 6, -10, 12, -4, 3, -1, 0],
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1],
                  }
                : { x: '-50%', y: 138, scale: 1, rotate: 0, opacity: 1 }
            }
            transition={{
              duration: phase === 'drop' ? DROP_MS / 1000 : 0.05,
              times: phase === 'drop'
                ? [0, 0.12, 0.30, 0.55, 0.78, 0.85, 0.92, 0.97, 1]
                : undefined,
              ease: 'easeIn',
            }}
            exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.22 } }}
          >
            {phase === 'crack' ? (
              <CapsuleCrack accent={accent} />
            ) : (
              <CapsuleSealed accent={accent} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CapsuleSealed({ accent }) {
  return (
    <svg viewBox="0 0 60 60">
      <defs>
        <linearGradient id="pmCapTop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <path d="M6 30 A24 24 0 0 1 54 30 Z" fill="url(#pmCapTop)" />
      <path d="M6 30 A24 24 0 0 0 54 30 Z" fill="#fff" stroke="#5B1B36" strokeWidth="1.5" />
      <rect x="6" y="29" width="48" height="3" fill="#FCE7F3" />
      <circle cx="22" cy="22" r="3" fill="#fff" opacity="0.85" />
    </svg>
  );
}

/** Capsule split into halves flying apart, plus a confetti burst.
 *  A small pre-shake telegraphs the crack before the halves fly. */
function CapsuleCrack({ accent }) {
  return (
    <div className="pm-crack-wrap">
      <motion.svg
        viewBox="0 0 60 60"
        className="pm-crack-half top"
        initial={{ y: 0, rotate: 0, opacity: 1 }}
        animate={{
          y: [0, -2, 2, -2, -38],
          rotate: [0, -3, 3, -3, -22],
          opacity: [1, 1, 1, 1, 0],
        }}
        transition={{ duration: 1.1, times: [0, 0.15, 0.3, 0.45, 1], ease: 'easeOut' }}
      >
        <path d="M6 30 A24 24 0 0 1 54 30 Z" fill={accent} />
      </motion.svg>
      <motion.svg
        viewBox="0 0 60 60"
        className="pm-crack-half bottom"
        initial={{ y: 0, rotate: 0, opacity: 1 }}
        animate={{
          y: [0, 1, -1, 1, 28],
          rotate: [0, 2, -2, 2, 16],
          opacity: [1, 1, 1, 1, 0],
        }}
        transition={{ duration: 1.1, times: [0, 0.15, 0.3, 0.45, 1], ease: 'easeOut' }}
      >
        <path d="M6 30 A24 24 0 0 0 54 30 Z" fill="#fff" stroke="#5B1B36" strokeWidth="1.5" />
      </motion.svg>
      <ConfettiBurst />
    </div>
  );
}

const CONFETTI_COLORS = ['#EC4899', '#F472B6', '#FBCFE8', '#C5B8FF', '#FFD27A', '#A5C2F0'];
function ConfettiBurst({ count = 14 }) {
  return (
    <div className="pm-crack-confetti" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count;
        const dist = 36 + ((i * 17.3) % 18);
        return (
          <span
            key={i}
            className="pm-confetti"
            style={{
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              borderRadius: i % 2 ? '50%' : '2px',
              ['--cx']: `${Math.cos(angle) * dist}px`,
              ['--cy']: `${Math.sin(angle) * dist - 8}px`,
              animationDelay: `${i * 0.018}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function CapsuleDot({ cx, cy, fill }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="#fff" opacity="0.4" />
      <path d={`M${cx - 9} ${cy} A9 9 0 0 1 ${cx + 9} ${cy} Z`} fill={fill} />
      <path d={`M${cx - 9} ${cy} A9 9 0 0 0 ${cx + 9} ${cy} Z`} fill="#fff"
            stroke="#9D2A66" strokeWidth="1" />
    </g>
  );
}
