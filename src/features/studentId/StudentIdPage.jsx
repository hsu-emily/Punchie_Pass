import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Backpack, Download, PawPrint, Pencil, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import useUserProgress from '@/features/habits/useUserProgress';
import useUserLevel from '@/features/progress/useUserLevel';
import { evaluateUnlockedBunnies } from '@/features/bunny/bunnyVariants';
import AvatarCustomizer from '@/features/avatar/AvatarCustomizer';
import StudentIdCard from './StudentIdCard';
import './StudentIdPage.css';

function deriveIdNumber(uid) {
  if (!uid) return 'PP-0042';
  const num = Math.abs(
    uid.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 10000;
  return `PP-${String(num).padStart(4, '0')}`;
}

export default function StudentIdPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(false);

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

  const hatchedPets = useMemo(() => profile?.pets?.hatched || [], [profile?.pets?.hatched]);

  const unlockedBunnies = useMemo(
    () => evaluateUnlockedBunnies(
      { totalPunches, completedPasses, currentStreak, longestStreak },
      hatchedPets
    ),
    [totalPunches, completedPasses, currentStreak, longestStreak, hatchedPets]
  );

  const handleSaveEdits = async (nextAvatar, nextBunnyKind) => {
    if (!user) return;
    setBusy('save');
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          bunny: { avatar: nextAvatar, kind: nextBunnyKind, name: nextAvatar?.name || bunnyName },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setEditing(false);
    } catch (err) {
      console.error('Failed to save profile edits:', err);
    } finally {
      setBusy(null);
    }
  };

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

  if (editing) {
    return (
      <AvatarCustomizer
        initial={{ ...(avatar || {}), name: avatar?.name || bunnyName }}
        bunnyKind={bunnyKind}
        unlockedBunnies={unlockedBunnies}
        title="EDIT YOUR ID"
        confirmLabel={busy === 'save' ? 'Saving…' : 'Save changes ✓'}
        onBack={() => setEditing(false)}
        onConfirm={handleSaveEdits}
      />
    );
  }

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
        <button className="sid-btn sid-btn-ghost" onClick={() => setEditing(true)} disabled={!!busy}>
          <Pencil size={16} /> Edit
        </button>
        <button className="sid-btn sid-btn-ghost" onClick={() => navigate('/pets')} disabled={!!busy}>
          <PawPrint size={16} /> Your Pets
        </button>
        <button className="sid-btn sid-btn-ghost" onClick={() => navigate('/inventory')} disabled={!!busy}>
          <Backpack size={16} /> Your Inventory
        </button>
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
    </div>
  );
}
