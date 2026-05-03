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
import TokenIcon from './TokenIcon';
import coinUrl from '@/assets/coin.png';
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
  const {
    tokensAvailable,
    pullsUsed,
    pityCounter,
    bonusTokens,
    inventory,
    pull,
    pulling,
    error,
  } = useGacha();
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
          <span className="gacha-token-num">
            <TokenIcon size={26} style={{ verticalAlign: '-0.22em', marginRight: 4 }} />
            {tokensAvailable}
          </span>
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
            <span className="gacha-pull-cost">{n} <TokenIcon size={11} /></span>
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
  const showCoin = phase === 'crank';
  const [shaking, setShaking] = useState(false);
  const [bump, setBump] = useState({ key: 0, source: -1 });

  const handleBallClick = (idx) => {
    setBump({ key: Date.now(), source: idx });
  };

  const handleMachineClick = () => {
    setShaking(false);
    requestAnimationFrame(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 520);
    });
  };

  return (
    <div
      className={`pm-frame ${phase}${shaking ? ' pm-machine-bump' : ''}`}
      onClick={handleMachineClick}
    >
      <AnimatePresence>
        {showCoin && (
          <motion.img
            key="coin"
            src={coinUrl}
            alt=""
            aria-hidden
            className="pm-coin"
            initial={{ x: '-50%', top: '-10%', scale: 0.6, rotate: 0, opacity: 0 }}
            animate={{
              x: '-50%',
              // Slot is at y≈497 in 376×667 viewBox = 74.5% from top.
              top: ['-10%', '20%', '50%', '70%', '74%', '74.5%'],
              scale: [0.7, 0.9, 0.95, 0.85, 0.45, 0.15],
              rotate: [0, 180, 360, 540, 720, 720],
              opacity: [0, 1, 1, 1, 0.7, 0],
            }}
            transition={{
              duration: CRANK_MS / 1000,
              times: [0, 0.18, 0.45, 0.78, 0.94, 1],
              ease: 'easeIn',
            }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <svg viewBox="0 0 376 667" className="pm-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pmBody" x1="50.0342" y1="357.546" x2="50.0342" y2="609.819" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9A8D4" />
            <stop offset="0.48" stopColor="#F472B6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
          <radialGradient id="pmGlobe" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(169.443 180.34) scale(251.6 246.16)">
            <stop stopColor="white" stopOpacity="0.96" />
            <stop offset="0.45" stopColor="#EEEFFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#BFDEFF" stopOpacity="0.78" />
          </radialGradient>
          <linearGradient id="pmCrankInner" x1="256.943" y1="497" x2="281.943" y2="522" gradientUnits="userSpaceOnUse">
            <stop offset="1" stopColor="#A38A95" />
          </linearGradient>
          <linearGradient id="pmNeck" x1="79.9433" y1="15.499" x2="79.9433" y2="63.499" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9A8D4" />
            <stop offset="0.48" stopColor="#F472B6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {/* floor shadow */}
        <path opacity="0.16" d="M186.671 637.909C272.124 637.909 341.398 631.885 341.398 624.455C341.398 617.024 272.124 611 186.671 611C101.217 611 31.9434 617.024 31.9434 624.455C31.9434 631.885 101.217 637.909 186.671 637.909Z" fill="#DB2777" />
        {/* sparkles */}
        <path d="M65.1372 323.575C64.9892 322.701 64.599 321.759 63.9666 320.75C63.3343 319.727 62.4328 318.779 61.2623 317.904C60.1052 317.03 58.9481 316.471 57.791 316.229V315.381C58.9346 315.112 60.0312 314.614 61.0806 313.888C62.1435 313.148 63.0315 312.26 63.7446 311.224C64.4712 310.161 64.9354 309.112 65.1372 308.076H65.9848C66.1059 308.748 66.3481 309.441 66.7114 310.154C67.0746 310.854 67.5388 311.527 68.1039 312.172C68.6824 312.805 69.3283 313.377 70.0414 313.888C71.1043 314.641 72.1874 315.139 73.2906 315.381V316.229C72.5506 316.377 71.7837 316.68 70.9899 317.137C70.2095 317.595 69.483 318.14 68.8103 318.772C68.1375 319.391 67.5859 320.043 67.1554 320.73C66.523 321.739 66.1328 322.687 65.9848 323.575H65.1372Z" fill="#F472B6" />
        <path d="M313.348 317.459C313.213 316.657 312.855 315.794 312.275 314.869C311.696 313.931 310.869 313.062 309.796 312.26C308.736 311.458 307.675 310.947 306.614 310.725V309.948C307.663 309.701 308.668 309.245 309.63 308.579C310.604 307.9 311.418 307.086 312.072 306.137C312.738 305.162 313.163 304.2 313.348 303.251H314.125C314.236 303.867 314.458 304.502 314.791 305.156C315.124 305.797 315.55 306.414 316.068 307.006C316.598 307.586 317.19 308.11 317.844 308.579C318.818 309.269 319.811 309.726 320.822 309.948V310.725C320.144 310.86 319.441 311.138 318.713 311.557C317.998 311.976 317.332 312.476 316.715 313.056C316.099 313.623 315.593 314.221 315.198 314.85C314.619 315.775 314.261 316.645 314.125 317.459H313.348Z" fill="#FFD27A" />
        {/* hearts */}
        <path d="M81.3203 488.763L75.7946 483.237C75.3539 482.796 75.06 482.284 74.9131 481.7C74.7698 481.116 74.7716 480.535 74.9185 479.958C75.0654 479.378 75.3575 478.873 75.7946 478.443C76.2426 478.002 76.7532 477.71 77.3265 477.566C77.9035 477.42 78.4786 477.42 79.052 477.566C79.6289 477.713 80.1413 478.005 80.5892 478.443L81.3203 479.152L82.0513 478.443C82.5028 478.005 83.0152 477.713 83.5886 477.566C84.1619 477.42 84.7353 477.42 85.3086 477.566C85.8855 477.71 86.398 478.002 86.8459 478.443C87.2831 478.873 87.5751 479.378 87.722 479.958C87.869 480.535 87.869 481.116 87.722 481.7C87.5787 482.284 87.2867 482.796 86.8459 483.237L81.3203 488.763Z" fill="white" />
        <path d="M293.229 475.309L287.704 469.783C287.263 469.342 286.969 468.83 286.822 468.246C286.679 467.662 286.681 467.081 286.828 466.504C286.975 465.924 287.267 465.418 287.704 464.988C288.152 464.548 288.662 464.256 289.236 464.112C289.813 463.965 290.388 463.965 290.961 464.112C291.538 464.259 292.05 464.551 292.498 464.988L293.229 465.698L293.96 464.988C294.412 464.551 294.924 464.259 295.498 464.112C296.071 463.965 296.644 463.965 297.218 464.112C297.795 464.256 298.307 464.548 298.755 464.988C299.192 465.418 299.484 465.924 299.631 466.504C299.778 467.081 299.778 467.662 299.631 468.246C299.488 468.83 299.196 469.342 298.755 469.783L293.229 475.309Z" fill="white" />
        {/* feet */}
        <path opacity="0.9" d="M129.08 603.091H95.4433C90.7991 603.091 87.0342 606.856 87.0342 611.5C87.0342 616.144 90.7991 619.909 95.4433 619.909H129.08C133.724 619.909 137.489 616.144 137.489 611.5C137.489 606.856 133.724 603.091 129.08 603.091Z" fill="#DB2777" />
        <path opacity="0.9" d="M280.443 603.091H246.807C242.162 603.091 238.397 606.856 238.397 611.5C238.397 616.144 242.162 619.909 246.807 619.909H280.443C285.087 619.909 288.852 616.144 288.852 611.5C288.852 606.856 285.087 603.091 280.443 603.091Z" fill="#DB2777" />
        {/* body backplate */}
        <path opacity="0.16" d="M290.535 362.591H85.3529C63.0607 362.591 44.9893 380.662 44.9893 402.954V576.182C44.9893 598.474 63.0607 616.545 85.3529 616.545H290.535C312.827 616.545 330.898 598.474 330.898 576.182V402.954C330.898 380.662 312.827 362.591 290.535 362.591Z" fill="#DB2777" />
        {/* body main */}
        <path d="M287.171 357.546H88.716C67.3526 357.546 50.0342 374.864 50.0342 396.228V571.137C50.0342 592.5 67.3526 609.819 88.716 609.819H287.171C308.534 609.819 325.852 592.5 325.852 571.137V396.228C325.852 374.864 308.534 357.546 287.171 357.546Z" fill="url(#pmBody)" stroke="#DB2777" strokeWidth="5.88636" />
        {/* body shine */}
        <path opacity="0.24" d="M75.2617 377.728C150.383 353.061 225.504 353.061 300.625 377.728" stroke="white" strokeWidth="8.40909" strokeLinecap="round" fill="none" />
        {/* label panel */}
        <path d="M277.08 396.228H98.8074C89.519 396.228 81.9893 403.757 81.9893 413.046V460.137C81.9893 469.425 89.519 476.955 98.8074 476.955H277.08C286.369 476.955 293.898 469.425 293.898 460.137V413.046C293.898 403.757 286.369 396.228 277.08 396.228Z" fill="white" stroke="#DB2777" strokeWidth="4.70909" />
        {/* PUNCHIE pixel text */}
        <path d="M118.443 435V431H120.443V429H118.443V427H116.443V425H122.443V421H124.443V425H130.443V427H128.443V429H126.443V431H128.443V435H126.443V433H124.443V431H122.443V433H120.443V435H118.443ZM152.443 435V433H150.443V431H148.443V425H150.443V423H152.443V421H162.443V423H154.443V425H152.443V431H154.443V433H158.443V429H156.443V427H162.443V435H152.443ZM164.443 435V425H166.443V423H168.443V421H174.443V423H176.443V425H178.443V435H174.443V431H168.443V435H164.443ZM168.443 429H174.443V425H172.443V423H170.443V425H168.443V429ZM184.443 435V433H182.443V431H180.443V425H182.443V423H184.443V421H192.443V423H194.443V425H190.443V423H186.443V425H184.443V431H186.443V433H190.443V431H194.443V433H192.443V435H184.443ZM196.443 435V421H200.443V427H206.443V421H210.443V435H206.443V429H200.443V435H196.443ZM212.443 435V425H214.443V423H216.443V421H222.443V423H224.443V425H226.443V435H222.443V431H216.443V435H212.443ZM216.443 429H222.443V425H220.443V423H218.443V425H216.443V429ZM246.443 435V431H248.443V429H246.443V427H244.443V425H250.443V421H252.443V425H258.443V427H256.443V429H254.443V431H256.443V435H254.443V433H252.443V431H250.443V433H248.443V435H246.443Z" fill="#DB2777" />
        {/* INSERT TOKEN pixel text */}
        <path d="M123.219 458.634V457.267H125.952V450.435H123.219V449.068H131.418V450.435H128.685V457.267H131.418V458.634H123.219ZM132.784 458.634V449.068H135.517V450.435H136.884V451.801H138.25V453.168H139.617V449.068H142.35V458.634H139.617V455.901H138.25V454.534H136.884V453.168H135.517V458.634H132.784ZM145.083 458.634V457.267H143.716V455.901H146.449V457.267H150.548V454.534H145.083V453.168H143.716V450.435H145.083V449.068H151.915V450.435H153.281V451.801H150.548V450.435H146.449V453.168H151.915V454.534H153.281V457.267H151.915V458.634H145.083ZM154.648 458.634V449.068H164.213V450.435H157.381V453.168H162.847V454.534H157.381V457.267H164.213V458.634H154.648ZM165.58 458.634V449.068H173.779V450.435H175.145V454.534H172.412V455.901H173.779V457.267H175.145V458.634H171.046V457.267H169.679V455.901H168.313V458.634H165.58ZM168.313 454.534H171.046V453.168H172.412V450.435H168.313V454.534ZM180.611 458.634V450.435H177.878V449.068H186.077V450.435H183.344V458.634H180.611ZM202.475 458.634V450.435H199.742V449.068H207.941V450.435H205.208V458.634H202.475ZM210.673 458.634V457.267H209.307V450.435H210.673V449.068H217.506V450.435H218.872V457.267H217.506V458.634H210.673ZM212.04 457.267H216.139V450.435H212.04V457.267ZM220.239 458.634V449.068H222.972V453.168H224.338V451.801H225.705V450.435H227.071V449.068H229.804V450.435H228.438V451.801H227.071V453.168H225.705V454.534H227.071V455.901H228.438V457.267H229.804V458.634H225.705V457.267H224.338V455.901H222.972V458.634H220.239ZM231.171 458.634V449.068H240.736V450.435H233.904V453.168H239.369V454.534H233.904V457.267H240.736V458.634H231.171ZM242.102 458.634V449.068H244.835V450.435H246.202V451.801H247.568V453.168H248.935V449.068H251.668V458.634H248.935V455.901H247.568V454.534H246.202V453.168H244.835V458.634H242.102Z" fill="#9D2A66" />
        {/* token slot */}
        <path d="M206.443 492.091H169.443C166.656 492.091 164.397 494.35 164.397 497.136C164.397 499.923 166.656 502.182 169.443 502.182H206.443C209.229 502.182 211.488 499.923 211.488 497.136C211.488 494.35 209.229 492.091 206.443 492.091Z" fill="#5B1B36" />
        {/* prize chute */}
        <path d="M238.398 532.454H137.489C130.987 532.454 125.716 537.725 125.716 544.227V577.863C125.716 584.365 130.987 589.636 137.489 589.636H238.398C244.9 589.636 250.17 584.365 250.17 577.863V544.227C250.17 537.725 244.9 532.454 238.398 532.454Z" fill="#5B1B36" />
        <path d="M228.307 547.591H147.58C143.864 547.591 140.853 550.603 140.853 554.318V571.136C140.853 574.852 143.864 577.864 147.58 577.864H228.307C232.022 577.864 235.034 574.852 235.034 571.136V554.318C235.034 550.603 232.022 547.591 228.307 547.591Z" fill="#2C0F1B" />
        <path opacity="0.08" d="M224.944 552.637H150.944C149.086 552.637 147.58 554.143 147.58 556C147.58 557.858 149.086 559.364 150.944 559.364H224.944C226.801 559.364 228.307 557.858 228.307 556C228.307 554.143 226.801 552.637 224.944 552.637Z" fill="white" />
        {/* chute door — slides up during drop/crack */}
        <path
          d="M228.307 547.591H147.58C143.864 547.591 140.853 550.603 140.853 554.318V571.136C140.853 574.852 143.864 577.864 147.58 577.864H228.307C232.022 577.864 235.034 574.852 235.034 571.136V554.318C235.034 550.603 232.022 547.591 228.307 547.591Z"
          fill="#7A2447"
          stroke="#5B1B36"
          strokeWidth="2.52273"
          style={{
            transformOrigin: '188px 562px',
            transform: showCapsule ? 'translateY(-22px) scaleY(0.18)' : 'translateY(0) scaleY(1)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: showCapsule ? 0.4 : 1,
          }}
        />
        {/* glass globe */}
        <path d="M187.943 364C290.116 364 372.943 345.464 372.943 245.5C372.943 145.536 290.116 44 187.943 44C85.7707 44 2.94336 145.536 2.94336 245.5C2.94336 345.464 85.7707 364 187.943 364Z" fill="url(#pmGlobe)" stroke="#F472B6" strokeWidth="5.88636" />
        {/* globe shine */}
        <path opacity="0.72" d="M120.671 214.591C138.61 189.924 161.035 177.591 187.944 177.591" stroke="white" strokeWidth="10.0909" strokeLinecap="round" fill="none" />
        <path opacity="0.38" d="M155.989 184.318C186.262 168.621 216.535 171.424 246.807 192.727" stroke="white" strokeWidth="5.88636" strokeLinecap="round" fill="none" />
        {/* neck connector — sits between globe and body so balls overlap nicely */}
        <path d="M291.943 350.818C291.943 346.174 227.905 350.817 223.261 350.817L187.443 353L152.625 350.817C147.981 350.817 73.9434 346.175 73.9434 350.819V359.228C73.9434 363.872 138.799 376.044 143.443 376.044L168.443 379.5H187.443H206.443L233.943 376.044C238.588 376.044 291.943 363.872 291.943 359.227V350.818Z" fill="#DB2777" />
        <path opacity="0.16" d="M208.943 357.5H172.443C170.586 357.5 155.943 354.143 155.943 356.001C155.943 357.858 170.586 362.728 172.443 362.728H206.443C208.301 362.728 222.443 357.858 222.443 356.001C222.443 354.143 210.801 357.5 208.943 357.5Z" fill="white" />
        {/* hearts on chute */}
        <path d="M88.9068 558.737L82.7673 552.597C82.2775 552.108 81.951 551.538 81.7878 550.889C81.6285 550.24 81.6305 549.595 81.7938 548.954C81.957 548.309 82.2815 547.748 82.7673 547.27C83.265 546.78 83.8323 546.456 84.4694 546.297C85.1104 546.133 85.7495 546.133 86.3865 546.297C87.0275 546.46 87.5969 546.784 88.0946 547.27L88.9068 548.058L89.7191 547.27C90.2208 546.784 90.7901 546.46 91.4272 546.297C92.0642 546.133 92.7013 546.133 93.3383 546.297C93.9794 546.456 94.5487 546.78 95.0464 547.27C95.5322 547.748 95.8567 548.309 96.0199 548.954C96.1832 549.595 96.1832 550.24 96.0199 550.889C95.8607 551.538 95.5362 552.108 95.0464 552.597L88.9068 558.737Z" fill="white" />
        <path d="M280.634 558.737L274.495 552.597C274.005 552.108 273.679 551.538 273.515 550.889C273.356 550.24 273.358 549.595 273.521 548.954C273.685 548.309 274.009 547.748 274.495 547.27C274.992 546.78 275.56 546.456 276.197 546.297C276.838 546.133 277.477 546.133 278.114 546.297C278.755 546.46 279.324 546.784 279.822 547.27L280.634 548.058L281.447 547.27C281.948 546.784 282.518 546.46 283.155 546.297C283.792 546.133 284.429 546.133 285.066 546.297C285.707 546.456 286.276 546.78 286.774 547.27C287.26 547.748 287.584 548.309 287.747 548.954C287.911 549.595 287.911 550.24 287.747 550.889C287.588 551.538 287.264 552.108 286.774 552.597L280.634 558.737Z" fill="white" />
        {/* crank — fixed dark backing */}
        <path d="M268.943 534C282.75 534 293.943 522.807 293.943 509C293.943 495.193 282.75 484 268.943 484C255.136 484 243.943 495.193 243.943 509C243.943 522.807 255.136 534 268.943 534Z" fill="#5B1B36" />
        {/* crank — rotating handle + inner */}
        <g
          style={{
            transformOrigin: '269px 509px',
            animation: phase === 'crank' ? 'pm-crank 3s cubic-bezier(0.45, 0, 0.55, 1) 1' : 'none',
          }}
        >
          <path d="M249.943 510H287.181" stroke="#A38A95" strokeWidth="8" strokeLinecap="round" />
          <path d="M269.443 522C276.347 522 281.943 516.404 281.943 509.5C281.943 502.596 276.347 497 269.443 497C262.54 497 256.943 502.596 256.943 509.5C256.943 516.404 262.54 522 269.443 522Z" fill="url(#pmCrankInner)" stroke="#A38A95" strokeWidth="3.5" />
        </g>

        {/* gacha balls inside globe — each jiggles independently, click for a bigger pop */}
        <Ball idx={0} delay="0s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M161.903 338.22C174.793 352.536 196.847 353.692 211.163 340.802C225.479 327.912 226.635 305.857 213.745 291.541C200.855 277.225 178.8 276.07 164.484 288.96C150.168 301.85 149.013 323.904 161.903 338.22Z" fill="white" />
          <path d="M168.727 293.671C174.352 288.607 181.758 285.984 189.317 286.38C196.875 286.776 203.967 290.159 209.031 295.783C214.096 301.408 216.719 308.814 216.323 316.373C215.926 323.931 212.544 331.023 206.919 336.087L168.727 293.671Z" fill="#A5C2F0" />
          <path d="M168.727 293.672C163.102 298.736 159.719 305.828 159.323 313.386C158.927 320.945 161.55 328.351 166.614 333.976C171.679 339.601 178.77 342.983 186.329 343.379C193.887 343.775 201.294 341.153 206.918 336.088L168.727 293.672Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={1} delay="-0.3s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M57.8236 307.76C77.0874 307.76 92.7038 292.144 92.7038 272.88C92.7038 253.616 77.0874 238 57.8236 238C38.5598 238 22.9434 253.616 22.9434 272.88C22.9434 292.144 38.5598 307.76 57.8236 307.76Z" fill="white" />
          <path d="M29.2842 272.879C29.2842 265.31 32.2909 258.051 37.6429 252.7C42.9949 247.348 50.2537 244.341 57.8225 244.341C65.3914 244.341 72.6502 247.348 78.0022 252.7C83.3542 258.051 86.3609 265.31 86.3609 272.879H29.2842Z" fill="#A5C2F0" />
          <path d="M29.2842 272.881C29.2842 280.45 32.2909 287.709 37.6429 293.061C42.9949 298.413 50.2537 301.419 57.8225 301.419C65.3914 301.419 72.6502 298.413 78.0022 293.061C83.3542 287.709 86.3609 280.45 86.3609 272.881H29.2842Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={2} delay="-0.6s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M194.824 218.76C214.087 218.76 229.704 203.144 229.704 183.88C229.704 164.616 214.087 149 194.824 149C175.56 149 159.943 164.616 159.943 183.88C159.943 203.144 175.56 218.76 194.824 218.76Z" fill="white" />
          <path d="M166.284 183.879C166.284 176.31 169.291 169.051 174.643 163.7C179.995 158.348 187.254 155.341 194.823 155.341C202.391 155.341 209.65 158.348 215.002 163.7C220.354 169.051 223.361 176.31 223.361 183.879H166.284Z" fill="#A5C2F0" />
          <path d="M166.284 183.881C166.284 191.45 169.291 198.709 174.643 204.061C179.995 209.413 187.254 212.419 194.823 212.419C202.391 212.419 209.65 209.413 215.002 204.061C220.354 198.709 223.361 191.45 223.361 183.881H166.284Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={3} delay="-0.9s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M291.617 286.321C301.249 303.004 322.581 308.72 339.264 299.088C355.947 289.456 361.663 268.123 352.031 251.441C342.399 234.758 321.067 229.042 304.384 238.674C287.701 248.305 281.985 269.638 291.617 286.321Z" fill="white" />
          <path d="M307.555 244.165C314.109 240.38 321.899 239.355 329.21 241.314C336.521 243.273 342.754 248.056 346.539 254.61C350.323 261.165 351.349 268.955 349.39 276.266C347.431 283.577 342.648 289.81 336.093 293.595L307.555 244.165Z" fill="#FFD27A" />
          <path d="M307.554 244.165C300.999 247.949 296.216 254.183 294.257 261.494C292.298 268.805 293.324 276.594 297.108 283.149C300.892 289.704 307.126 294.487 314.437 296.446C321.748 298.405 329.537 297.379 336.092 293.595L307.554 244.165Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={4} delay="-1.2s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M292.031 325.321C301.663 308.638 295.947 287.305 279.264 277.673C262.581 268.041 241.249 273.757 231.617 290.44C221.985 307.123 227.701 328.456 244.384 338.088C261.067 347.719 282.399 342.003 292.031 325.321Z" fill="white" />
          <path d="M247.554 332.596C240.999 328.812 236.216 322.579 234.257 315.268C232.298 307.957 233.324 300.167 237.108 293.612C240.892 287.057 247.126 282.274 254.437 280.315C261.748 278.356 269.537 279.382 276.092 283.166L247.554 332.596Z" fill="#C5B7FF" />
          <path d="M247.555 332.597C254.109 336.381 261.899 337.407 269.21 335.448C276.521 333.489 282.754 328.706 286.539 322.151C290.323 315.596 291.349 307.806 289.39 300.495C287.431 293.185 282.648 286.951 276.093 283.167L247.555 332.597Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={5} delay="-1.5s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M289.824 244.76C309.087 244.76 324.704 229.144 324.704 209.88C324.704 190.616 309.087 175 289.824 175C270.56 175 254.943 190.616 254.943 209.88C254.943 229.144 270.56 244.76 289.824 244.76Z" fill="white" />
          <path d="M261.284 209.879C261.284 202.31 264.291 195.051 269.643 189.7C274.995 184.348 282.254 181.341 289.823 181.341C297.391 181.341 304.65 184.348 310.002 189.7C315.354 195.051 318.361 202.31 318.361 209.879H261.284Z" fill="#C5B7FF" />
          <path d="M261.284 209.881C261.284 217.45 264.291 224.709 269.643 230.061C274.995 235.413 282.254 238.419 289.823 238.419C297.391 238.419 304.65 235.413 310.002 230.061C315.354 224.709 318.361 217.45 318.361 209.881H261.284Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={6} delay="-1.8s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M100.824 255.76C120.087 255.76 135.704 240.144 135.704 220.88C135.704 201.616 120.087 186 100.824 186C81.5598 186 65.9434 201.616 65.9434 220.88C65.9434 240.144 81.5598 255.76 100.824 255.76Z" fill="white" />
          <path d="M72.2842 220.879C72.2842 213.31 75.2909 206.051 80.6428 200.7C85.9948 195.348 93.2537 192.341 100.823 192.341C108.391 192.341 115.65 195.348 121.002 200.7C126.354 206.051 129.361 213.31 129.361 220.879H72.2842Z" fill="#C5B7FF" />
          <path d="M72.2842 220.881C72.2842 228.45 75.2909 235.709 80.6428 241.061C85.9948 246.413 93.2537 249.419 100.823 249.419C108.391 249.419 115.65 246.413 121.002 241.061C126.354 235.709 129.361 228.45 129.361 220.881H72.2842Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={7} delay="-2.1s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M130.199 338.917C147.208 329.873 153.665 308.753 144.621 291.744C135.578 274.735 114.458 268.278 97.4488 277.322C80.4398 286.366 73.9828 307.486 83.0266 324.495C92.0704 341.504 113.19 347.961 130.199 338.917Z" fill="white" />
          <path d="M88.6245 321.517C85.0712 314.834 84.3181 307.014 86.531 299.775C88.7439 292.537 93.7415 286.475 100.424 282.921C107.107 279.368 114.928 278.615 122.166 280.828C129.404 283.041 135.467 288.038 139.02 294.721L88.6245 321.517Z" fill="#F472B6" />
          <path d="M88.625 321.518C92.1784 328.2 98.2409 333.198 105.479 335.411C112.717 337.624 120.538 336.871 127.221 333.318C133.904 329.764 138.901 323.702 141.114 316.463C143.327 309.225 142.574 301.405 139.021 294.722L88.625 321.518Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={8} delay="-2.4s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M247.264 275.087C263.947 265.456 269.663 244.123 260.031 227.44C250.399 210.757 229.067 205.041 212.384 214.673C195.701 224.305 189.985 245.637 199.617 262.32C209.249 279.003 230.581 284.719 247.264 275.087Z" fill="white" />
          <path d="M205.107 259.15C201.323 252.595 200.297 244.805 202.256 237.494C204.215 230.183 208.998 223.95 215.553 220.165C222.108 216.381 229.897 215.355 237.208 217.314C244.519 219.273 250.753 224.056 254.537 230.611L205.107 259.15Z" fill="#F472B6" />
          <path d="M205.108 259.15C208.893 265.705 215.126 270.488 222.437 272.447C229.748 274.406 237.538 273.381 244.093 269.596C250.647 265.812 255.43 259.578 257.389 252.267C259.348 244.957 258.323 237.167 254.538 230.612L205.108 259.15Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>
        <Ball idx={9} delay="-2.7s" bump={bump} onBallClick={handleBallClick}>
          <path opacity="0.4" d="M139.35 278.365C154.53 290.225 176.45 287.534 188.31 272.354C200.17 257.174 197.479 235.253 182.298 223.393C167.118 211.533 145.198 214.225 133.338 229.405C121.478 244.585 124.17 266.505 139.35 278.365Z" fill="white" />
          <path d="M138.335 233.308C142.995 227.344 149.833 223.475 157.346 222.552C164.858 221.63 172.429 223.729 178.394 228.389C184.358 233.049 188.227 239.887 189.149 247.4C190.072 254.912 187.972 262.483 183.312 268.448L138.335 233.308Z" fill="#FFD27A" />
          <path d="M138.334 233.309C133.674 239.273 131.574 246.844 132.497 254.357C133.419 261.869 137.288 268.707 143.253 273.367C149.217 278.027 156.788 280.127 164.3 279.204C171.813 278.282 178.651 274.413 183.311 268.449L138.334 233.309Z" fill="white" stroke="#9D2A66" strokeWidth="1.68182" />
        </Ball>

        {/* tube on top dispensing into machine */}
        <path d="M275.385 56.1231L252.545 44.5091C242.064 39.1801 219.701 27 207.943 27H186.943H164.943C153.498 27 129.324 41.3092 119.087 46.4277L99.5718 56.1857C92.4451 59.7491 90.1367 66.7747 97.228 70.4081C101.211 72.4488 106.459 74.6422 112.943 77L137.443 85L164.943 89.999L179.627 91.2759C185.162 91.7571 190.727 91.7764 196.264 91.3333L212.943 89.999L238.443 85L258.597 78.4193C261.489 77.4748 264.302 76.2739 267.013 74.892C271.294 72.7097 274.787 71.0395 277.585 69.6891C285 66.1114 282.724 59.8546 275.385 56.1231Z" fill="url(#pmNeck)" stroke="#DB2777" strokeWidth="5.88636" />
        <ellipse cx="185.943" cy="19" rx="22" ry="19" fill="#DB2777" />
      </svg>

      {/* Falling / cracking capsule overlay */}
      <AnimatePresence>
        {showCapsule && (
          <motion.div
            key="capsule"
            className={`pm-capsule pm-capsule-${phase}`}
            initial={{ x: '-50%', top: '83%', scale: 0.5, opacity: 0 }}
            animate={
              phase === 'drop'
                ? {
                    x: '-50%',
                    // Pop out from chute exit (~85%), drop, bounce, settle below the machine.
                    top: ['83%', '85%', '88%', '94%', '97%', '95%', '96%'],
                    scale: [0.5, 0.85, 1.0, 1.05, 1.0, 1.02, 1.0],
                    rotate: [0, -6, 4, -8, 6, -2, 0],
                    opacity: [0, 1, 1, 1, 1, 1, 1],
                  }
                : { x: '-50%', top: '96%', scale: 1, rotate: 0, opacity: 1 }
            }
            transition={{
              duration: phase === 'drop' ? DROP_MS / 1000 : 0.05,
              times: phase === 'drop'
                ? [0, 0.18, 0.42, 0.68, 0.82, 0.92, 1]
                : undefined,
              ease: 'easeOut',
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

function Ball({ idx, delay, bump, onBallClick, children }) {
  const [popping, setPopping] = useState(false);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    if (!bump?.key || bump.source === idx) return;
    setBumping(false);
    const raf = requestAnimationFrame(() => {
      setBumping(true);
    });
    const t = setTimeout(() => setBumping(false), 440);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [bump?.key, bump?.source, idx]);

  const handleClick = (e) => {
    e.stopPropagation();
    setPopping(false);
    requestAnimationFrame(() => {
      setPopping(true);
      setTimeout(() => setPopping(false), 650);
    });
    onBallClick?.(idx);
  };

  let cls = 'pm-ball';
  if (popping) cls += ' pm-ball-pop';
  else if (bumping) cls += ' pm-ball-bump';

  return (
    <g
      className={cls}
      style={{ animationDelay: delay }}
      onClick={handleClick}
    >
      {children}
    </g>
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

