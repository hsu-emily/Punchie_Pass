import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import CreatePunchCard, { FIRST_ICON_ID } from './CreatePunchCard';
import { DEFAULT_PUNCH_CURSOR_ID } from '@/assets/cursors/cursors';

const DEFAULT_PASS = {
  title: '',
  description: '',
  frequency: 'daily',
  reward: '',
  cardImage: 'WindowsPink.png',
  iconId: FIRST_ICON_ID,
  icon1Id: FIRST_ICON_ID,
  icon2Id: FIRST_ICON_ID,
  customIcons: [],
  cursorId: DEFAULT_PUNCH_CURSOR_ID,
};

export default function NewPassPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const addHabit = useHabitStore((s) => s.addHabit);
  const [pass, setPass] = useState(DEFAULT_PASS);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await addHabit(user.uid, {
        title: pass.title.trim(),
        description: pass.description,
        frequency: pass.frequency,
        reward: pass.reward,
        cardImage: pass.cardImage,
        iconId: pass.icon1Id || pass.iconId,
        icon1Id: pass.icon1Id || pass.iconId,
        icon2Id: pass.icon2Id,
        customIcons: pass.customIcons || [],
        cursorId: pass.cursorId || DEFAULT_PUNCH_CURSOR_ID,
        targetPunches: 10,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create pass:', err);
      setSaving(false);
    }
  };

  return (
    <CreatePunchCard
      user={user}
      pass={pass}
      onChange={(updater) =>
        setPass((prev) =>
          typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        )
      }
      onSubmit={handleSubmit}
      onCancel={() => navigate('/dashboard')}
      bunnyName={profile?.bunny?.name}
      submitLabel={saving ? 'Saving…' : 'Create Punch Card'}
    />
  );
}
