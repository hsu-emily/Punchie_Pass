import { useMemo } from 'react';
import useStreak from './useStreak';

/**
 * Aggregate user progress from a habit list shaped like the existing
 * habitStore: each habit has currentPunches, targetPunches, and a logs[]
 * of { date, punchNumber } entries.
 *
 * @returns {{ totalPunches, completedPasses, currentStreak, longestStreak,
 *             punchDates: Date[] }}
 */
export default function useUserProgress(habits) {
  const punchDates = useMemo(() => {
    if (!habits?.length) return [];
    return habits
      .flatMap((h) => h.logs || [])
      .map((l) => l?.date)
      .filter(Boolean);
  }, [habits]);

  const { current, longest } = useStreak(punchDates);

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
      punchDates,
    };
  }, [habits, current, longest, punchDates]);
}
