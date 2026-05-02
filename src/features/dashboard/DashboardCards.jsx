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

      <div className="dc-heatmap-wrap">
        <CalendarHeatmap punchDates={punchDates} />
      </div>
    </section>
  );
}

/* ── Mini Punchie Machine SVG (compact preview) ─────────────── */
function MiniPunchieMachine() {
  return (
    <svg viewBox="0 0 120 150" className="dc-mini-machine" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dcMiniGlobe" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="dcMiniBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="146" rx="48" ry="3" fill="rgba(220,60,130,0.18)" />
      <rect x="14" y="74" width="92" height="68" rx="10" fill="url(#dcMiniBody)" stroke="#DB2777" strokeWidth="2" />
      <rect x="26" y="86" width="68" height="22" rx="4" fill="#fff" stroke="#DB2777" strokeWidth="1.5" />
      <text x="60" y="100" textAnchor="middle" fontFamily="Press Start 2P, monospace" fontSize="6.5" fill="#DB2777">★ PUNCHIE ★</text>
      <rect x="40" y="118" width="40" height="16" rx="3" fill="#5B1B36" />
      <circle cx="60" cy="40" r="34" fill="url(#dcMiniGlobe)" stroke="#F472B6" strokeWidth="2" />
      <circle cx="48" cy="42" r="5" fill="#A5C2F0" />
      <circle cx="66" cy="34" r="5" fill="#FFD27A" />
      <circle cx="56" cy="56" r="5" fill="#C5B7FF" />
      <circle cx="72" cy="50" r="5" fill="#F472B6" />
      <rect x="46" y="68" width="28" height="8" rx="2" fill="#DB2777" />
      <circle cx="98" cy="118" r="6" fill="#5B1B36" />
      <circle cx="98" cy="118" r="4" fill="#FFD27A" stroke="#DB2777" strokeWidth="1" />
    </svg>
  );
}
