/**
 * StudentIdCard — Punchie World certificate-style ID.
 *
 * Mirrors the onboarding AvatarCustomizer card aesthetic but is read-only and
 * tuned for app/sharing context: shows level, streak, lifetime punches, and
 * the user's HatchedBunny next to the avatar portrait.
 */
import AvatarPreview from '@/features/avatar/AvatarPreview.jsx';
import HatchedBunny from '@/features/bunny/HatchedBunny.jsx';

export default function StudentIdCard({
  bunnyName,
  bunnyKind = 'bun',
  avatar,
  totalPunches = 0,
  streakDays = 0,
  level = 1,
  title = 'Sprout',
  progressPct = 0,
  idNumber,
  memberSince,
  tier = 'Regular Member',
  onNameChange,
}) {
  const bg = avatar?.background || '#FBCFE8';
  const stageBg = `linear-gradient(180deg, ${bg} 0%, #fff5fa 60%, ${bg}80 100%)`;
  const memberLabel = memberSince
    ? new Date(memberSince).toLocaleDateString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
      }).replace(/\//g, ' · ')
    : `EST ${new Date().getFullYear()}`;

  return (
    <div className="psid-card">
      <HeartStamp className="psid-heart tl" />
      <HeartStamp className="psid-heart br" />

      <div className="psid-header">
        <div className="psid-stamp"><span className="psid-stamp-p">P</span></div>
        <div className="psid-cert-title">
          PUNCHIE WORLD MEMBERSHIP
        </div>
      </div>

      <div className="psid-body">
        <div className="psid-portrait-col">
          <div className="psid-frame">
            <div className="psid-stage" style={{ background: stageBg }}>
              <div className="psid-avatar-fit">
                <AvatarPreview
                  avatar={avatar}
                  size={140}
                  background="transparent"
                  rounded={false}
                />
              </div>
              <div className="psid-bunny-pocket" style={{ background: stageBg }}>
                <HatchedBunny kind={bunnyKind} size={52} />
              </div>
            </div>
          </div>
          <div className="psid-mini-stats">
            <div className="psid-mini-stat">
              <span className="psid-mini-num">{streakDays}</span>
              <span className="psid-mini-label">DAY STREAK</span>
            </div>
            <div className="psid-mini-stat">
              <span className="psid-mini-num">★ {totalPunches}</span>
              <span className="psid-mini-label">PUNCHES</span>
            </div>
          </div>
        </div>

        <div className="psid-info">
          <div className="psid-row">
            <span className="psid-row-label">名前 · NAME</span>
            {onNameChange ? (
              <input
                className="psid-row-input"
                value={bunnyName || ''}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Your bunny's name"
                maxLength={20}
              />
            ) : (
              <span className="psid-row-value">{bunnyName || 'Bunny'}</span>
            )}
          </div>

          <div className="psid-row">
            <span className="psid-row-label">区分 · TIER</span>
            <span className="psid-row-value psid-tier-text">{tier}</span>
          </div>

          <div className="psid-row">
            <span className="psid-row-label">学年 · LEVEL</span>
            <span className="psid-row-value">
              Lv {level} · <span className="psid-title-text">{title}</span>
            </span>
            <div className="psid-xp-track" aria-hidden>
              <div
                className="psid-xp-fill"
                style={{ width: `${Math.round(progressPct * 100)}%` }}
              />
            </div>
          </div>

          <div className="psid-row last">
            <span className="psid-row-label">入学 · MEMBER SINCE</span>
            <span className="psid-row-value">{memberLabel}</span>
          </div>
        </div>
      </div>

      <div className="psid-footer">
        <span className="psid-footer-text">★ ALWAYS PUNCHIE WORLD ★</span>
        <div className="psid-barcode">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} className="psid-barcode-bar" />
          ))}
        </div>
        <span className="psid-footer-text">// {idNumber || 'PP-0042'}</span>
      </div>
    </div>
  );
}

function HeartStamp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 L4 13 Q1 10 4 7 Q7 4 10 7 L12 9 L14 7 Q17 4 20 7 Q23 10 20 13 Z"
        fill="#FBCFE8"
        stroke="#EC4899"
        strokeWidth="1.5"
      />
    </svg>
  );
}
