import { useRef, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Navigate, useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import AvatarCustomizer from '@/features/avatar/AvatarCustomizer';
import CreatePunchCard, { FIRST_ICON_ID } from '@/features/punchpass/CreatePunchCard';
import '@/features/auth/guards.css';
import HatchScene from './steps/HatchScene';
import NameBunny from './steps/NameBunny';
import PremiumOffer from './steps/PremiumOffer';

export default function OnboardingFlow() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const addHabit = useHabitStore((s) => s.addHabit);
  const [step, setStep] = useState(0);
  const [bunnyName, setBunnyName] = useState('');
  const [bunnyKind, setBunnyKind] = useState('bun');
  const [avatar, setAvatar] = useState(null);
  const [pass, setPass] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    reward: '',
    cardImage: 'WindowsPink.png',
    iconId: FIRST_ICON_ID,
    icon1Id: FIRST_ICON_ID,
    icon2Id: FIRST_ICON_ID,
    customIcons: [],
  });
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Onboarding is one-and-done. If the profile already says it's complete,
  // bounce to the dashboard so users can't replay the flow by typing /onboarding.
  if (profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  const next = () => setStep((s) => s + 1);

  const finish = async () => {
    if (!user || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await Promise.all([
        setDoc(
          doc(db, 'users', user.uid),
          {
            bunny: { name: bunnyName, kind: bunnyKind, avatar },
            studentId: { memberSince: serverTimestamp() },
            // Starter bunny is permanently theirs — even if its progression
            // condition isn't independently met (HatchScene picks at random).
            pets: { hatched: [bunnyKind] },
            gacha: { bonusTokens: 10, bonusEvaluatedPasses: 0 },
            onboardingCompleted: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        addHabit(user.uid, {
          title: (pass.title || '').trim() || 'My first habit',
          description: pass.description || '',
          frequency: pass.frequency,
          reward: pass.reward,
          cardImage: pass.cardImage,
          iconId: pass.icon1Id || pass.iconId,
          icon1Id: pass.icon1Id || pass.iconId,
          icon2Id: pass.icon2Id || pass.icon1Id || pass.iconId,
          customIcons: pass.customIcons || [],
          targetPunches: 10,
        }),
      ]);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      savingRef.current = false;
      setSaving(false);
    }
  };

  switch (step) {
    case 0:
      return (
        <HatchScene
          onContinue={(kind) => {
            if (kind) setBunnyKind(kind);
            next();
          }}
        />
      );
    case 1:
      return (
        <NameBunny
          value={bunnyName}
          onChange={setBunnyName}
          onContinue={next}
          kind={bunnyKind}
        />
      );
    case 2:
      return (
        <AvatarCustomizer
          initial={{ ...(avatar || {}), name: avatar?.name || bunnyName }}
          onConfirm={(a) => {
            setAvatar(a);
            next();
          }}
        />
      );
    case 3:
      return <PremiumOffer onContinue={next} />;
    case 4:
      return (
        <CreatePunchCard
          pass={pass}
          onChange={(updater) =>
            setPass((prev) =>
              typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
            )
          }
          onSubmit={finish}
          bunnyName={bunnyName}
          headerEyebrow="YOUR FIRST PUNCH CARD"
          headerTitle="Create your first Punch Card"
          submitLabel="Start punching ▸"
        />
      );
    default:
      return (
        <div className="guard-page">
          <div className="guard-card">
            <div className="guard-eyebrow">★ {saving ? 'Saving' : 'Almost there'} ★</div>
            <h2 className="guard-title">{saving ? 'Tucking everything in' : 'Welcome'}</h2>
            <p className="guard-msg">
              {saving
                ? 'Sealing your bunny pass with a wax stamp…'
                : 'A new chapter is about to begin.'}
            </p>
            {saving && (
              <div className="guard-dots" aria-hidden>
                <span /><span /><span />
              </div>
            )}
          </div>
        </div>
      );
  }
}
