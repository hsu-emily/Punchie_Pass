import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import CreatePunchCard, { FIRST_ICON_ID } from './CreatePunchCard';
import { DEFAULT_PUNCH_CURSOR_ID } from '@/assets/cursors/cursors';

const habitToPass = (h) => ({
  title: h.title || '',
  description: h.description || '',
  frequency: h.frequency || 'daily',
  reward: h.reward || '',
  cardImage: h.cardImage || h.punchCardImage || 'WindowsPink.png',
  iconId: h.icon1Id || h.iconId || FIRST_ICON_ID,
  icon1Id: h.icon1Id || h.iconId || FIRST_ICON_ID,
  icon2Id: h.icon2Id || h.icon1Id || h.iconId || FIRST_ICON_ID,
  customIcons: h.customIcons || [],
  cursorId: h.cursorId || DEFAULT_PUNCH_CURSOR_ID,
});

export default function EditPassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const [pass, setPass] = useState(null);
  const [saving, setSaving] = useState(false);

  // Make sure habits are loaded so we can find this one.
  useEffect(() => {
    if (user && habits.length === 0) fetchHabits(user.uid);
  }, [user, habits.length, fetchHabits]);

  const habit = habits.find((h) => h.id === id);

  useEffect(() => {
    if (habit && !pass) setPass(habitToPass(habit));
  }, [habit, pass]);

  const handleSubmit = async () => {
    if (!user || !pass || saving) return;
    setSaving(true);
    try {
      await updateHabit(id, {
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
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update pass:', err);
      setSaving(false);
    }
  };

  if (!pass) {
    return (
      <div className="cpc-page">
        <div className="cpc-header">
          <div>
            <div className="cpc-eyebrow">★ EDIT PUNCH CARD</div>
            <h1 className="cpc-title">Loading…</h1>
          </div>
        </div>
      </div>
    );
  }

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
      headerEyebrow="EDIT PUNCH CARD"
      headerTitle="Edit your Punch Card"
      submitLabel={saving ? 'Saving…' : 'Save changes'}
    />
  );
}
