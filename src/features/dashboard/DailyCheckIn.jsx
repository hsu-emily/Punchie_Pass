import { Gift } from 'lucide-react';
import TokenIcon from '@/features/gacha/TokenIcon';
import useDailyCheckIn, { MAX_REWARD } from './useDailyCheckIn';
import './DailyCheckIn.css';

export default function DailyCheckIn() {
  const {
    claim,
    claiming,
    claimedToday,
    streak,
    nextStreak,
    todayReward,
    filled,
    error,
  } = useDailyCheckIn();

  const handleClaim = async () => {
    if (claimedToday || claiming) return;
    try {
      await claim();
    } catch {
      /* surfaced via `error` */
    }
  };

  const shownStreak = claimedToday ? streak : nextStreak;

  return (
    <div
      className={`dci-banner ${claimedToday ? 'is-claimed' : 'is-ready'}`}
      role="region"
      aria-label="Daily check-in"
    >
      <div className="dci-text">
        <Gift size={14} className="dci-spark" />
        <span className="dci-headline">Daily Check-in</span>
        <span className="dci-streak">{shownStreak}-day streak</span>
        <div className="dci-pips" role="list" aria-label="Daily reward track">
          {Array.from({ length: MAX_REWARD }).map((_, i) => {
            const day = i + 1;
            const isFilled = day <= filled;
            const isToday =
              !claimedToday && day === Math.min(nextStreak, MAX_REWARD);
            return (
              <span
                key={day}
                role="listitem"
                className={`dci-pip${isFilled ? ' is-filled' : ''}${isToday ? ' is-today' : ''}`}
                aria-label={`Day ${day}`}
              />
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="dci-cta"
        onClick={handleClaim}
        disabled={claimedToday || claiming}
      >
        {claimedToday ? (
          <>Claimed</>
        ) : (
          <>
            Claim {todayReward}
            <TokenIcon size={12} />
          </>
        )}
      </button>
      {error && <span className="dci-error">{error.message || 'Try again'}</span>}
    </div>
  );
}
