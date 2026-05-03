import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Backpack, ChevronDown, ChevronUp, Download, PawPrint, Pencil, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import useUserProgress from '@/features/habits/useUserProgress';
import useUserLevel from '@/features/progress/useUserLevel';
import { evaluateUnlockedBunnies } from '@/features/bunny/bunnyVariants';
import AvatarCustomizer from '@/features/avatar/AvatarCustomizer';
import useGacha from '@/features/gacha/useGacha';
import usePremium from '@/features/premium/usePremium';
import StudentIdCard from './StudentIdCard';
import './StudentIdPage.css';

const ID_SKINS = [
  { id: 'default',  name: 'Classic',      swatch: 'linear-gradient(135deg,#fef0fa,#dcebff)' },
  { id: 'holo',     name: 'Holographic',  swatch: 'linear-gradient(135deg,#FBCFE8,#C5B8FF,#A5C2F0)' },
  { id: 'wishz',    name: 'Frosty Blue',   swatch: 'linear-gradient(135deg,#BFDCFF,#7FB3F0)' },
  { id: 'inari',    name: 'Maroon',        swatch: 'linear-gradient(135deg,#7E1F2C,#F4E6CE)' },
  { id: 'lottsa',   name: 'Princess Pink', swatch: 'linear-gradient(135deg,#FFE4F0,#FFB6CF,#E94B8C)' },
  { id: 'babymoon', name: 'Beige',         swatch: 'linear-gradient(135deg,#F2EBDD,#1F1A18)' },
];

function deriveIdNumber(uid) {
  if (!uid) return 'PP-0000000';
  const num = Math.abs(
    uid.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 10_000_000;
  return `PP-${String(num).padStart(7, '0')}`;
}

export default function StudentIdPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(false);
  const [skinsOpen, setSkinsOpen] = useState(true);
  const { premium, expiresAt } = usePremium();

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
  const activeSkin = profile?.studentId?.skin || 'default';
  const { inventory } = useGacha();
  // 'default' is always free; everything else must be pulled from the gacha.
  const ownedSkins = useMemo(() => {
    const owned = new Set(['default']);
    for (const skin of ID_SKINS) {
      if (skin.id === 'default') continue;
      if (inventory?.[`idSkin.${skin.id}`]) owned.add(skin.id);
    }
    return owned;
  }, [inventory]);

  const handleSelectSkin = async (skinId) => {
    if (!user || skinId === activeSkin || !ownedSkins.has(skinId)) return;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { studentId: { skin: skinId }, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to switch ID skin:', err);
    }
  };

  const hatchedPets = useMemo(() => profile?.pets?.hatched || [], [profile?.pets?.hatched]);

  const unlockedBunnies = useMemo(
    () => evaluateUnlockedBunnies(
      { totalPunches, completedPasses, currentStreak, longestStreak },
      hatchedPets
    ),
    [totalPunches, completedPasses, currentStreak, longestStreak, hatchedPets]
  );

  const handleSaveEdits = async (nextAvatar, nextBunnyKind, nextSkin) => {
    if (!user) return;
    setBusy('save');
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          bunny: { avatar: nextAvatar, kind: nextBunnyKind, name: nextAvatar?.name || bunnyName },
          studentId: { skin: nextSkin || activeSkin },
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
          text: `Check out my habit tracking progress!`,
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
        unlockedSkins={[...ownedSkins]}
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
        <h1 className="sid-title">Punchie World ID</h1>
        <div className="sid-spacer" />
      </header>

      <div className="sid-stage">
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
            skin={activeSkin}
            premium={premium}
          />
        </div>

        <aside className={`sid-skins ${skinsOpen ? '' : 'is-collapsed'}`} aria-label="Card skin">
          <button
            type="button"
            className="sid-skins-title"
            onClick={() => setSkinsOpen((v) => !v)}
            aria-expanded={skinsOpen}
          >
            <span>Card Skin</span>
            {skinsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {skinsOpen && (
            <div className="sid-skins-list">
              {ID_SKINS.map((s) => {
                const owned = ownedSkins.has(s.id);
                const isActive = activeSkin === s.id;
                return (
                  <button
                    key={s.id}
                    className={`sid-skin-btn ${isActive ? 'is-active' : ''} ${!owned ? 'is-locked' : ''}`}
                    onClick={() => handleSelectSkin(s.id)}
                    disabled={!owned}
                    title={owned ? `Use ${s.name}` : `Pull ${s.name} from the Punchie Machine`}
                  >
                    <span className="sid-skin-swatch" style={{ background: s.swatch }} />
                    <span className="sid-skin-name">{s.name}{!owned && ' 🔒'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
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
        {premium && expiresAt && (
          <> · premium renews {new Date(expiresAt).toLocaleDateString()}</>
        )}
      </p>
    </div>
  );
}
