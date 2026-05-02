import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, Lock, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import useUserProgress from '@/features/habits/useUserProgress';
import useUserLevel from '@/features/progress/useUserLevel';
import { UNLOCK_RULES, evaluateUnlocks } from '@/features/unlocks/unlockRules';
import StudentIdCard from './StudentIdCard';
import './StudentIdPage.css';

function deriveIdNumber(uid) {
  if (!uid) return 'PP-0042';
  const num = Math.abs(
    uid.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 10000;
  return `PP-${String(num).padStart(4, '0')}`;
}

const KIND_META = {
  cursor:   { label: 'Cursors',  emoji: '✦' },
  icon:     { label: 'Punches',  emoji: '🎫' },
  'pass-template': { label: 'Templates', emoji: '📜' },
};

export default function StudentIdPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (user) fetchHabits(user.uid);
  }, [user, fetchHabits]);

  const progress = useUserProgress(habits);
  const { totalPunches, completedPasses, currentStreak, longestStreak } = progress;
  const { level, title, progressPct, xpInLevel, xpForNext } = useUserLevel(progress);

  const bunnyName = profile?.bunny?.name || 'Bunny';
  const bunnyKind = profile?.bunny?.kind || 'bun';
  const avatar = profile?.bunny?.avatar;
  const idNumber = deriveIdNumber(user?.uid);
  const memberSince = profile?.studentId?.memberSince?.toDate?.() ||
    user?.metadata?.creationTime;

  const unlockedSet = useMemo(() => {
    const u = evaluateUnlocks({ totalPunches, completedPasses, currentStreak, longestStreak });
    return new Set(u.map((r) => r.id));
  }, [totalPunches, completedPasses, currentStreak, longestStreak]);

  const groupedRules = useMemo(() => {
    const groups = {};
    for (const r of UNLOCK_RULES) {
      (groups[r.kind] ||= []).push(r);
    }
    return groups;
  }, []);

  const captureCard = async () => {
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setBusy('download');
    try {
      const canvas = await captureCard();
      const link = document.createElement('a');
      link.download = `${bunnyName}-student-id.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setBusy('share');
    try {
      const canvas = await captureCard();
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (navigator.share && blob) {
        const file = new File([blob], `${bunnyName}-student-id.png`, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: `${bunnyName}'s Punchie Pass Student ID`,
        });
      } else if (navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('Copied to clipboard!');
      } else {
        handleDownload();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Share failed:', err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="sid-page">
      <header className="sid-header">
        <button className="sid-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <h1 className="sid-title">Your Student ID</h1>
        <div className="sid-spacer" />
      </header>

      <div className="sid-card-wrap" ref={cardRef}>
        <StudentIdCard
          bunnyName={bunnyName}
          bunnyKind={bunnyKind}
          avatar={avatar}
          totalPunches={totalPunches}
          streakDays={currentStreak}
          level={level}
          title={title}
          progressPct={progressPct}
          idNumber={idNumber}
          memberSince={memberSince}
        />
      </div>

      <div className="sid-actions">
        <button className="sid-btn sid-btn-ghost" onClick={handleDownload} disabled={!!busy}>
          <Download size={16} /> {busy === 'download' ? 'Saving…' : 'Download PNG'}
        </button>
        <button className="sid-btn sid-btn-primary" onClick={handleShare} disabled={!!busy}>
          <Share2 size={16} /> {busy === 'share' ? 'Sharing…' : 'Share'}
        </button>
      </div>

      <p className="sid-meta">
        Lv {level} · {xpInLevel}/{xpForNext} XP to Lv {level + 1} · {completedPasses} passes ·
        longest streak {longestStreak}d
      </p>

      <section className="sid-collection">
        <div className="sid-section-head">
          <Sparkles size={16} />
          <h2 className="sid-section-title">Collection</h2>
          <span className="sid-section-sub">
            {unlockedSet.size}/{UNLOCK_RULES.length} unlocked
          </span>
        </div>
        <p className="sid-section-lede">
          Earn rewards by punching, finishing passes, and keeping streaks alive.
          Locked items show what to do next.
        </p>

        {Object.entries(groupedRules).map(([kind, rules]) => {
          const meta = KIND_META[kind] || { label: kind, emoji: '✦' };
          if (!rules.length) return null;
          return (
            <div key={kind} className="sid-collection-group">
              <div className="sid-group-head">
                <span className="sid-group-emoji">{meta.emoji}</span>
                <span className="sid-group-label">{meta.label}</span>
              </div>
              <div className="sid-tile-grid">
                {rules.map((r) => {
                  const unlocked = unlockedSet.has(r.id);
                  return (
                    <div
                      key={r.id}
                      className={`sid-tile ${unlocked ? 'unlocked' : 'locked'}`}
                      title={r.hint}
                    >
                      <div className="sid-tile-art">
                        {unlocked ? (
                          <span className="sid-tile-emoji">{meta.emoji}</span>
                        ) : (
                          <Lock size={18} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="sid-tile-name">
                        {r.id.split('.').slice(-1)[0]}
                      </div>
                      <div className="sid-tile-hint">{r.hint}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
