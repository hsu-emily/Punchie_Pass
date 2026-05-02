import { useMemo, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import AvatarCustomizer from '@/features/avatar/AvatarCustomizer';
import CreatePunchCard from '@/features/punchpass/CreatePunchCard';
import HatchScene from './steps/HatchScene';
import NameBunny from './steps/NameBunny';
import BorderPicker from './steps/BorderPicker';

const borderModules = import.meta.glob('@/assets/borders/*.png', { eager: true });
const iconModules = import.meta.glob('@/assets/icons/*.png', { eager: true });

const BORDER_LIST = Object.entries(borderModules)
  .map(([path, mod]) => {
    const id = path.split('/').pop().replace('.png', '');
    return { id, name: `Border ${id}`, url: mod.default };
  })
  .sort((a, b) => Number(a.id) - Number(b.id));

const UNLOCKED_DEFAULT = new Set(['1', '2', '3']);

const ICON_LIST = Object.entries(iconModules)
  .map(([path, mod]) => {
    const id = path.split('/').pop().replace('.png', '');
    return { id, url: mod.default };
  })
  .sort((a, b) => Number(a.id) - Number(b.id));

export default function OnboardingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [bunnyName, setBunnyName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [borderId, setBorderId] = useState('1');
  const [pass, setPass] = useState({
    title: '',
    subtitle: '',
    frequency: 'daily',
    iconId: ICON_LIST[0]?.id || '1',
    reward: '',
  });
  const [saving, setSaving] = useState(false);

  const next = () => setStep((s) => s + 1);

  const borders = useMemo(
    () =>
      BORDER_LIST.map((b) => ({
        ...b,
        unlocked: UNLOCKED_DEFAULT.has(b.id),
        lockedHint: 'Complete a pass to unlock',
      })),
    []
  );

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          bunny: { name: bunnyName, avatar },
          studentId: { borderId, memberSince: serverTimestamp() },
          firstPass: pass,
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      setSaving(false);
    }
  };

  switch (step) {
    case 0:
      return <HatchScene onContinue={next} />;
    case 1:
      return (
        <NameBunny
          value={bunnyName}
          onChange={setBunnyName}
          onContinue={next}
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
      return (
        <BorderPicker
          borders={borders}
          value={borderId}
          onChange={setBorderId}
          onContinue={next}
        />
      );
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
        <div className="pp-stage">
          <p>{saving ? 'Saving…' : 'Almost there…'}</p>
        </div>
      );
  }
}
