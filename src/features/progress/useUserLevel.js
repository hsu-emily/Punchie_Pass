/**
 * useUserLevel — derives a level + title from raw progress, with the
 * active pet's xpMultiplier applied to the punches contribution.
 *
 * XP model:
 *   xp = floor(totalPunches × pet.xpMultiplier) + completedPasses × 5 + currentStreak
 *
 * Triangular curve: level n needs 5·n·(n−1) XP to reach.
 *   Lv 2 at 10, Lv 3 at 30, Lv 5 at 80, Lv 10 at 450.
 */
import { useMemo } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getPetBonus } from '@/features/pets/petBonus';

const TITLES = [
  'Sprout',       // 1
  'Nibbler',      // 2
  'Hopper',       // 3
  'Punchling',    // 4
  'Cardholder',   // 5
  'Streakster',   // 6
  'Habit Knight', // 7
  'Bun Sage',     // 8
  'Moon Hopper',  // 9
  'Star Bunny',   // 10+
];

function xpForLevel(level) {
  const n = level - 1;
  return 5 * n * (n + 1);
}

export default function useUserLevel({
  totalPunches = 0,
  completedPasses = 0,
  currentStreak = 0,
} = {}) {
  const { profile } = useAuth();
  const activeKind = profile?.bunny?.kind || 'bun';
  const { xpMultiplier } = getPetBonus(activeKind);

  return useMemo(() => {
    const xp =
      Math.floor((totalPunches | 0) * (xpMultiplier || 1)) +
      (completedPasses | 0) * 5 +
      (currentStreak | 0) * 1;

    let level = 1;
    while (xpForLevel(level + 1) <= xp) level++;

    const xpAtLevel = xpForLevel(level);
    const xpAtNext = xpForLevel(level + 1);
    const xpInLevel = xp - xpAtLevel;
    const xpForNext = xpAtNext - xpAtLevel;
    const progressPct = Math.min(1, xpInLevel / Math.max(1, xpForNext));
    const title = TITLES[Math.min(level, TITLES.length) - 1];

    return { level, xp, xpInLevel, xpForNext, progressPct, title, xpMultiplier };
  }, [totalPunches, completedPasses, currentStreak, xpMultiplier]);
}
