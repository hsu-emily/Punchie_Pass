/**
 * useDailyCheckIn — grants 1–7 tokens once per day based on consecutive
 * check-in streak.
 *
 * Storage on `users/{uid}`:
 *   checkIn: {
 *     lastCheckInDate: 'YYYY-MM-DD'  // local date string
 *     streak:          number        // consecutive days claimed
 *   }
 *
 * Reward = min(nextStreak, MAX_REWARD). nextStreak resets to 1 if the last
 * claim wasn't yesterday. Tokens land in `gacha.bonusTokens`, which feeds
 * `tokensAvailable` in useGacha. `progress.lifetimeTokensEarned` is bumped
 * so the dashboard stat stays consistent with leveling rewards.
 */
import { useCallback, useMemo, useState } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';

export const MAX_REWARD = 7;

const localDayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function isYesterday(prevKey, todayKey) {
  if (!prevKey) return false;
  const today = new Date(todayKey);
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return localDayKey(y) === prevKey;
}

export default function useDailyCheckIn() {
  const { user, profile } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);

  const todayKey = localDayKey();
  const lastDate = profile?.checkIn?.lastCheckInDate || null;
  const streak = profile?.checkIn?.streak || 0;

  const claimedToday = lastDate === todayKey;
  const continues = isYesterday(lastDate, todayKey);

  // What the streak/reward will be if claimed *now*.
  const nextStreak = claimedToday ? streak : continues ? streak + 1 : 1;
  const todayReward = Math.min(nextStreak, MAX_REWARD);

  const claim = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    if (claimedToday) return { reward: 0, streak };

    setClaiming(true);
    setError(null);
    try {
      const reward = todayReward;
      await updateDoc(doc(db, 'users', user.uid), {
        'checkIn.lastCheckInDate': todayKey,
        'checkIn.streak': nextStreak,
        'gacha.bonusTokens': increment(reward),
        'progress.lifetimeTokensEarned': increment(reward),
      });
      return { reward, streak: nextStreak };
    } catch (err) {
      console.error('Daily check-in failed:', err);
      setError(err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }, [user, claimedToday, streak, todayReward, todayKey, nextStreak]);

  // Position in the 7-day display: filled cells = current streak count,
  // capped at MAX_REWARD. After claiming, show streak; before, show what
  // tomorrow's claim will look like (so the next pip glows as the prize).
  const filled = useMemo(() => {
    if (claimedToday) return Math.min(streak, MAX_REWARD);
    return Math.min(Math.max(0, nextStreak - 1), MAX_REWARD);
  }, [claimedToday, streak, nextStreak]);

  return {
    claim,
    claiming,
    claimedToday,
    streak,
    nextStreak,
    todayReward,
    filled,
    error,
  };
}
