/**
 * DashboardCards — the home-screen "what's going on with my account" trio.
 *
 *   Card 1: Mini Student ID (tap → /student-id)
 *   Card 2: Punchie Machine preview with token count + Pull CTA (tap → /gacha)
 *   Card 3: Stats panel — XP/level, streaks, lifetime totals, this-week strip
 *
 * Stats are derived from the live habit list + profile + gacha. No data is
 * cached here — everything stays in sync with the rest of the app.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backpack, ChevronRight, Egg, Flame, Sparkles, Star, Trophy } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import AvatarPreview from '@/features/avatar/AvatarPreview';
import HatchedBunny from '@/features/bunny/HatchedBunny';
import { BUNNY_KINDS } from '@/features/bunny/bunnyVariants';
import useUserProgress from '@/features/habits/useUserProgress';
import useUserLevel from '@/features/progress/useUserLevel';
import useGacha from '@/features/gacha/useGacha';
import TokenIcon from '@/features/gacha/TokenIcon';
import CalendarHeatmap from './CalendarHeatmap';
import DailyCheckIn from './DailyCheckIn';
import './DashboardCards.css';

function deriveIdNumber(uid) {
  if (!uid) return 'PP-0000000';
  const num = Math.abs(
    uid.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 10_000_000;
  return `PP-${String(num).padStart(7, '0')}`;
}

function startOfWeek(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday start
  return d;
}

export default function DashboardCards({ habits }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const progress = useUserProgress(habits);
  const { totalPunches, completedPasses, currentStreak, longestStreak, punchDates } = progress;
  const { level, title, progressPct, xpInLevel, xpForNext } = useUserLevel(progress);
  const { tokensAvailable, pullsUsed, inventory } = useGacha();

  const bunnyKind = profile?.bunny?.kind || 'bun';
  const bunnyName = profile?.bunny?.name || 'Bunny';
  const avatar = profile?.bunny?.avatar;
  const idNumber = deriveIdNumber(user?.uid);
  const skin = profile?.studentId?.skin || 'default';
  const hatchedPets = profile?.pets?.hatched || [];
  const lifetimeTokensEarned = profile?.progress?.lifetimeTokensEarned || 0;

  const inventoryEntries = useMemo(() => Object.values(inventory || {}), [inventory]);
  const itemsCollected = inventoryEntries.length;

  const punchesThisWeek = useMemo(() => {
    const since = startOfWeek().getTime();
    return punchDates.filter((d) => new Date(d).getTime() >= since).length;
  }, [punchDates]);

  return (
    <section className="dc-section">
      <div className="dc-eyebrow">★ Your Pass ★</div>

      <DailyCheckIn />

      <div className="dc-grid">
        {/* ── Card 1: Student ID preview ───────────────────────── */}
        <button
          className={`dc-card dc-card-id dc-id-skin-${skin}`}
          onClick={() => navigate('/student-id')}
        >
          <div className="dc-id-header">
            <span className="dc-id-stamp">P</span>
            <span className="dc-id-cert">PUNCHIE WORLD</span>
          </div>
          <div className="dc-id-body">
            <div className="dc-id-portrait">
              {avatar
                ? <AvatarPreview avatar={avatar} size={120} background="transparent" rounded={false} />
                : <HatchedBunny kind={bunnyKind} size={120} />}
              {avatar && (
                <div className="dc-id-pet"><HatchedBunny kind={bunnyKind} size={48} /></div>
              )}
            </div>
            <div className="dc-id-info">
              <div className="dc-id-row"><span>NAME</span><b>{bunnyName}</b></div>
              <div className="dc-id-row"><span>LV</span><b>{level} · {title}</b></div>
              <div className="dc-id-row"><span>ID</span><b>{idNumber}</b></div>
            </div>
          </div>
        </button>

        {/* ── Card 2: Punchie Machine preview ──────────────────── */}
        <button
          className="dc-card dc-card-gacha"
          onClick={() => navigate('/gacha')}
        >
          <div className="dc-gacha-eyebrow">PUNCHIE MACHINE</div>
          <div className="dc-gacha-art">
            <MiniPunchieMachine />
          </div>
          <div className="dc-gacha-stats">
            <div className="dc-gacha-tokens">
              <TokenIcon size={18} /> <b>{tokensAvailable}</b> <span>tokens</span>
            </div>
            <div className="dc-gacha-meta">
              {pullsUsed} pulls · {itemsCollected} item{itemsCollected === 1 ? '' : 's'}
            </div>
          </div>
          <div className="dc-gacha-cta">
            <Egg size={14} /> Pull now <ChevronRight size={14} />
          </div>
        </button>

        {/* ── Card 3: Stats panel ──────────────────────────────── */}
        <div className="dc-card dc-card-stats">
          <div className="dc-stats-eyebrow">YOUR STATS</div>

          <div className="dc-xp-block">
            <div className="dc-xp-head">
              <span className="dc-xp-lv">Lv {level}</span>
              <span className="dc-xp-title">{title}</span>
              <span className="dc-xp-num">{xpInLevel}/{xpForNext} XP</span>
            </div>
            <div className="dc-xp-track">
              <div className="dc-xp-fill" style={{ width: `${Math.round(progressPct * 100)}%` }} />
            </div>
            <div className="dc-xp-hint">
              {Math.max(0, xpForNext - xpInLevel)} XP to Lv {level + 1} · earns +2 ✦
            </div>
          </div>

          <div className="dc-stats-row">
            <div className="dc-stat">
              <Flame size={16} className="dc-stat-icon dc-flame" />
              <b>{currentStreak}</b>
              <span>day streak</span>
              <em>best {longestStreak}</em>
            </div>
            <div className="dc-stat">
              <Star size={16} className="dc-stat-icon dc-star" />
              <b>{totalPunches}</b>
              <span>punches</span>
              <em>{completedPasses} pass{completedPasses === 1 ? '' : 'es'}</em>
            </div>
            <div className="dc-stat">
              <Trophy size={16} className="dc-stat-icon dc-trophy" />
              <b>{hatchedPets.length}/{BUNNY_KINDS.length}</b>
              <span>bunnies</span>
              <em>{itemsCollected} items</em>
            </div>
            <div className="dc-stat">
              <Backpack size={16} className="dc-stat-icon dc-pack" />
              <b>{lifetimeTokensEarned}</b>
              <span>✦ earned</span>
              <em>{pullsUsed} pulls</em>
            </div>
          </div>

          <div className="dc-week-strip">
            <Sparkles size={14} />
            <span><b>{punchesThisWeek}</b> punches this week</span>
          </div>
        </div>
      </div>

      <div className="dc-heatmap-row">
        <div className="dc-heatmap-wrap">
          <CalendarHeatmap punchDates={punchDates} />
        </div>

        <button
          className="dc-card dc-card-pet"
          onClick={() => navigate('/pets')}
        >
          <div className="dc-side-eyebrow">YOUR PET</div>
          <div className="dc-pet-art">
            <HatchedBunny kind={bunnyKind} size={120} />
          </div>
          <div className="dc-side-meta">
            <b>{bunnyName}</b>
            <span>{hatchedPets.length}/{BUNNY_KINDS.length} hatched</span>
          </div>
          <div className="dc-side-cta">
            View pet <ChevronRight size={14} />
          </div>
        </button>

        <button
          className="dc-card dc-card-inventory"
          onClick={() => navigate('/inventory')}
        >
          <div className="dc-side-eyebrow">YOUR INVENTORY</div>
          <div className="dc-inv-art">
            <Backpack size={64} className="dc-inv-icon" />
          </div>
          <div className="dc-side-meta">
            <b>{itemsCollected}</b>
            <span>item{itemsCollected === 1 ? '' : 's'} collected</span>
          </div>
          <div className="dc-side-cta">
            Open inventory <ChevronRight size={14} />
          </div>
        </button>
      </div>
    </section>
  );
}

/* ── Mini Punchie Machine SVG (compact preview, mirrors GachaPage) ── */
function MiniPunchieMachine() {
  return (
    <svg viewBox="0 0 376 667" className="dc-mini-machine" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dcMiniBody" x1="50.0342" y1="357.546" x2="50.0342" y2="609.819" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9A8D4" />
          <stop offset="0.48" stopColor="#F472B6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <radialGradient id="dcMiniGlobe" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(169.443 180.34) scale(251.6 246.16)">
          <stop stopColor="white" stopOpacity="0.96" />
          <stop offset="0.45" stopColor="#EEEFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#BFDEFF" stopOpacity="0.78" />
        </radialGradient>
        <linearGradient id="dcMiniCrankInner" x1="256.943" y1="497" x2="281.943" y2="522" gradientUnits="userSpaceOnUse">
          <stop offset="1" stopColor="#A38A95" />
        </linearGradient>
        <linearGradient id="dcMiniNeck" x1="79.9433" y1="15.499" x2="79.9433" y2="63.499" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9A8D4" />
          <stop offset="0.48" stopColor="#F472B6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      <path opacity="0.16" d="M186.671 637.909C272.124 637.909 341.398 631.885 341.398 624.455C341.398 617.024 272.124 611 186.671 611C101.217 611 31.9434 617.024 31.9434 624.455C31.9434 631.885 101.217 637.909 186.671 637.909Z" fill="#DB2777" />
      <path opacity="0.9" d="M129.08 603.091H95.4433C90.7991 603.091 87.0342 606.856 87.0342 611.5C87.0342 616.144 90.7991 619.909 95.4433 619.909H129.08C133.724 619.909 137.489 616.144 137.489 611.5C137.489 606.856 133.724 603.091 129.08 603.091Z" fill="#DB2777" />
      <path opacity="0.9" d="M280.443 603.091H246.807C242.162 603.091 238.397 606.856 238.397 611.5C238.397 616.144 242.162 619.909 246.807 619.909H280.443C285.087 619.909 288.852 616.144 288.852 611.5C288.852 606.856 285.087 603.091 280.443 603.091Z" fill="#DB2777" />
      <path opacity="0.16" d="M290.535 362.591H85.3529C63.0607 362.591 44.9893 380.662 44.9893 402.954V576.182C44.9893 598.474 63.0607 616.545 85.3529 616.545H290.535C312.827 616.545 330.898 598.474 330.898 576.182V402.954C330.898 380.662 312.827 362.591 290.535 362.591Z" fill="#DB2777" />
      <path d="M287.171 357.546H88.716C67.3526 357.546 50.0342 374.864 50.0342 396.228V571.137C50.0342 592.5 67.3526 609.819 88.716 609.819H287.171C308.534 609.819 325.852 592.5 325.852 571.137V396.228C325.852 374.864 308.534 357.546 287.171 357.546Z" fill="url(#dcMiniBody)" stroke="#DB2777" strokeWidth="5.88636" />
      <path opacity="0.24" d="M75.2617 377.728C150.383 353.061 225.504 353.061 300.625 377.728" stroke="white" strokeWidth="8.40909" strokeLinecap="round" fill="none" />
      <path d="M277.08 396.228H98.8074C89.519 396.228 81.9893 403.757 81.9893 413.046V460.137C81.9893 469.425 89.519 476.955 98.8074 476.955H277.08C286.369 476.955 293.898 469.425 293.898 460.137V413.046C293.898 403.757 286.369 396.228 277.08 396.228Z" fill="white" stroke="#DB2777" strokeWidth="4.70909" />
      <path d="M118.443 435V431H120.443V429H118.443V427H116.443V425H122.443V421H124.443V425H130.443V427H128.443V429H126.443V431H128.443V435H126.443V433H124.443V431H122.443V433H120.443V435H118.443ZM152.443 435V433H150.443V431H148.443V425H150.443V423H152.443V421H162.443V423H154.443V425H152.443V431H154.443V433H158.443V429H156.443V427H162.443V435H152.443ZM164.443 435V425H166.443V423H168.443V421H174.443V423H176.443V425H178.443V435H174.443V431H168.443V435H164.443ZM168.443 429H174.443V425H172.443V423H170.443V425H168.443V429ZM184.443 435V433H182.443V431H180.443V425H182.443V423H184.443V421H192.443V423H194.443V425H190.443V423H186.443V425H184.443V431H186.443V433H190.443V431H194.443V433H192.443V435H184.443ZM196.443 435V421H200.443V427H206.443V421H210.443V435H206.443V429H200.443V435H196.443ZM212.443 435V425H214.443V423H216.443V421H222.443V423H224.443V425H226.443V435H222.443V431H216.443V435H212.443ZM216.443 429H222.443V425H220.443V423H218.443V425H216.443V429ZM246.443 435V431H248.443V429H246.443V427H244.443V425H250.443V421H252.443V425H258.443V427H256.443V429H254.443V431H256.443V435H254.443V433H252.443V431H250.443V433H248.443V435H246.443Z" fill="#DB2777" />
      <path d="M206.443 492.091H169.443C166.656 492.091 164.397 494.35 164.397 497.136C164.397 499.923 166.656 502.182 169.443 502.182H206.443C209.229 502.182 211.488 499.923 211.488 497.136C211.488 494.35 209.229 492.091 206.443 492.091Z" fill="#5B1B36" />
      <path d="M238.398 532.454H137.489C130.987 532.454 125.716 537.725 125.716 544.227V577.863C125.716 584.365 130.987 589.636 137.489 589.636H238.398C244.9 589.636 250.17 584.365 250.17 577.863V544.227C250.17 537.725 244.9 532.454 238.398 532.454Z" fill="#5B1B36" />
      <path d="M228.307 547.591H147.58C143.864 547.591 140.853 550.603 140.853 554.318V571.136C140.853 574.852 143.864 577.864 147.58 577.864H228.307C232.022 577.864 235.034 574.852 235.034 571.136V554.318C235.034 550.603 232.022 547.591 228.307 547.591Z" fill="#2C0F1B" />
      <path d="M187.943 364C290.116 364 372.943 345.464 372.943 245.5C372.943 145.536 290.116 44 187.943 44C85.7707 44 2.94336 145.536 2.94336 245.5C2.94336 345.464 85.7707 364 187.943 364Z" fill="url(#dcMiniGlobe)" stroke="#F472B6" strokeWidth="5.88636" />
      <path opacity="0.72" d="M120.671 214.591C138.61 189.924 161.035 177.591 187.944 177.591" stroke="white" strokeWidth="10.0909" strokeLinecap="round" fill="none" />

      {/* static balls inside globe */}
      <circle cx="190" cy="313" r="32" fill="#A5C2F0" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="58" cy="273" r="34" fill="#A5C2F0" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="195" cy="184" r="34" fill="#A5C2F0" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="321" cy="269" r="33" fill="#FFD27A" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="261" cy="307" r="33" fill="#C5B7FF" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="289" cy="210" r="34" fill="#C5B7FF" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="100" cy="221" r="34" fill="#C5B7FF" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="113" cy="308" r="33" fill="#F472B6" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="229" cy="244" r="33" fill="#F472B6" stroke="#9D2A66" strokeWidth="1.7" />
      <circle cx="160" cy="250" r="34" fill="#FFD27A" stroke="#9D2A66" strokeWidth="1.7" />

      {/* neck connector */}
      <path d="M291.943 350.818C291.943 346.174 227.905 350.817 223.261 350.817L187.443 353L152.625 350.817C147.981 350.817 73.9434 346.175 73.9434 350.819V359.228C73.9434 363.872 138.799 376.044 143.443 376.044L168.443 379.5H187.443H206.443L233.943 376.044C238.588 376.044 291.943 363.872 291.943 359.227V350.818Z" fill="#DB2777" />

      {/* crank */}
      <path d="M268.943 534C282.75 534 293.943 522.807 293.943 509C293.943 495.193 282.75 484 268.943 484C255.136 484 243.943 495.193 243.943 509C243.943 522.807 255.136 534 268.943 534Z" fill="#5B1B36" />
      <path d="M249.943 510H287.181" stroke="#A38A95" strokeWidth="8" strokeLinecap="round" />
      <path d="M269.443 522C276.347 522 281.943 516.404 281.943 509.5C281.943 502.596 276.347 497 269.443 497C262.54 497 256.943 502.596 256.943 509.5C256.943 516.404 262.54 522 269.443 522Z" fill="url(#dcMiniCrankInner)" stroke="#A38A95" strokeWidth="3.5" />

      {/* tube on top */}
      <path d="M275.385 56.1231L252.545 44.5091C242.064 39.1801 219.701 27 207.943 27H186.943H164.943C153.498 27 129.324 41.3092 119.087 46.4277L99.5718 56.1857C92.4451 59.7491 90.1367 66.7747 97.228 70.4081C101.211 72.4488 106.459 74.6422 112.943 77L137.443 85L164.943 89.999L179.627 91.2759C185.162 91.7571 190.727 91.7764 196.264 91.3333L212.943 89.999L238.443 85L258.597 78.4193C261.489 77.4748 264.302 76.2739 267.013 74.892C271.294 72.7097 274.787 71.0395 277.585 69.6891C285 66.1114 282.724 59.8546 275.385 56.1231Z" fill="url(#dcMiniNeck)" stroke="#DB2777" strokeWidth="5.88636" />
      <ellipse cx="185.943" cy="19" rx="22" ry="19" fill="#DB2777" />
    </svg>
  );
}
