import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import AvatarPreview from '@/features/avatar/AvatarPreview';
import HatchedBunny from '@/features/bunny/HatchedBunny';
import useUserProgress from '@/features/habits/useUserProgress';
import CalendarHeatmap from './CalendarHeatmap';
import './ProfileSquares.css';

export default function ProfileSquares({ habits }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { totalPunches, completedPasses, currentStreak, longestStreak, punchDates } =
    useUserProgress(habits);

  const bunnyName = profile?.bunny?.name || 'Bunny';
  const bunnyKind = profile?.bunny?.kind || 'bun';
  const avatar = profile?.bunny?.avatar;

  const memberSince =
    profile?.studentId?.memberSince?.toDate?.()?.getFullYear?.() ||
    user?.metadata?.creationTime?.slice(0, 4) ||
    new Date().getFullYear();

  const tier =
    currentStreak >= 30 ? 'gold' :
    currentStreak >= 7  ? 'hot'  :
    currentStreak > 0   ? 'warm' : 'cold';

  return (
    <section className="ps-section">
      <div className="ps-eyebrow">★ Your Pass ★</div>

      <div className="ps-grid">
        {/* Avatar tile — links to /student-id */}
        <button
          className="ps-tile ps-tile-avatar"
          onClick={() => navigate('/student-id')}
        >
          <div className="ps-avatar-wrap">
            {avatar ? (
              <AvatarPreview avatar={avatar} size={88} />
            ) : (
              <HatchedBunny kind={bunnyKind} size={88} />
            )}
          </div>
          <div className="ps-tile-name">{bunnyName}</div>
          <div className="ps-tile-sub">EST {memberSince}</div>
          <div className="ps-tile-link">View Student ID ▸</div>
        </button>

        {/* Streak tile */}
        <div className={`ps-tile ps-tile-streak ps-${tier}`}>
          <Flame size={28} className="ps-flame" />
          <div className="ps-tile-num">{currentStreak}</div>
          <div className="ps-tile-label">day{currentStreak === 1 ? '' : 's'} streak</div>
          <div className="ps-tile-sub">Best: {longestStreak}</div>
        </div>

        {/* Punches tile */}
        <div className="ps-tile ps-tile-punches">
          <div className="ps-stamp" aria-hidden>★</div>
          <div className="ps-tile-num">{totalPunches}</div>
          <div className="ps-tile-label">total punches</div>
          <div className="ps-tile-sub">{completedPasses} pass{completedPasses === 1 ? '' : 'es'} complete</div>
        </div>
      </div>

      <div className="ps-heatmap-wrap">
        <CalendarHeatmap punchDates={punchDates} />
      </div>
    </section>
  );
}
