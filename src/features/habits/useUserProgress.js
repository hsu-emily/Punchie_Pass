import { useMemo } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getPetBonus } from '@/features/pets/petBonus';
import useStreak from './useStreak';

/**
 * Aggregate user progress from a habit list shaped like the existing
 * habitStore: each habit has currentPunches, targetPunches, and a logs[]
 * of { date, punchNumber } entries.
 *
 * Pulls the active pet's `streakShield` from the profile and forwards it
 * to useStreak so the streak number reflects the equipped pet's grace.
 *
 * @returns {{ totalPunches, completedPasses, currentStreak, longestStreak,
 *             shieldUsed, punchDates: Date[] }}
 */
export default function useUserProgress(habits) {
  const { profile } = useAuth();
  const activeKind = profile?.bunny?.kind || 'bun';
  const { streakShield } = getPetBonus(activeKind);

  const punchDates = useMemo(() => {
    if (!habits?.length) return [];
    return habits
      .flatMap((h) => h.logs || [])
      .map((l) => l?.date)
      .filter(Boolean);
  }, [habits]);

  const { current, longest, shieldUsed } = useStreak(punchDates, { shieldDays: streakShield });

  return useMemo(() => {
    const totalPunches = (habits || []).reduce(
      (acc, h) => acc + (h.currentPunches || 0),
      0
    );
    const completedPasses = (habits || []).filter(
      (h) => (h.currentPunches || 0) >= (h.targetPunches || 10)
    ).length;
    return {
      totalPunches,
      completedPasses,
      currentStreak: current,
      longestStreak: longest,
      shieldUsed,
      punchDates,
    };
  }, [habits, current, longest, shieldUsed, punchDates]);
}
