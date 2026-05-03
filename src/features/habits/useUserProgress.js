import { useMemo } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getPetBonus } from '@/features/pets/petBonus';
import usePremium, { PREMIUM_COIN_MULTIPLIER } from '@/features/premium/usePremium';
import useStreak from './useStreak';

/**
 * Aggregate user progress from a habit list shaped like the existing
 * habitStore: each habit has currentPunches, targetPunches, and a logs[]
 * of { date, punchNumber } entries.
 *
 * Pulls the active pet's `streakShield` from the profile and forwards it
 * to useStreak so the streak number reflects the equipped pet's grace.
 *
 * `passTokens` weights each completed pass by its frequency category
 * (daily=1, weekly=4, monthly=10) — used by the gacha as the base token
 * grant. `completedPasses` remains a raw count for level/XP math.
 *
 * @returns {{ totalPunches, completedPasses, passTokens, currentStreak,
 *             longestStreak, shieldUsed, punchDates: Date[] }}
 */
const PASS_TOKEN_VALUE = { daily: 1, weekly: 4, monthly: 10 };

export default function useUserProgress(habits) {
  const { profile } = useAuth();
  const { premium } = usePremium();
  const activeKind = profile?.bunny?.kind || 'bun';
  const upgradeLv = profile?.pets?.upgrades?.[activeKind] || 0;
  const { streakShield } = getPetBonus(activeKind, upgradeLv);

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
    const completed = (habits || []).filter(
      (h) => (h.currentPunches || 0) >= (h.targetPunches || 10)
    );
    const completedPasses = completed.length;
    const basePassTokens = completed.reduce((acc, h) => {
      const freq = h.frequency || h.timeWindow || 'daily';
      return acc + (PASS_TOKEN_VALUE[freq] ?? 1);
    }, 0);
    const passTokens = premium ? basePassTokens * PREMIUM_COIN_MULTIPLIER : basePassTokens;
    return {
      totalPunches,
      completedPasses,
      passTokens,
      currentStreak: current,
      longestStreak: longest,
      shieldUsed,
      punchDates,
    };
  }, [habits, current, longest, shieldUsed, punchDates, premium]);
}
