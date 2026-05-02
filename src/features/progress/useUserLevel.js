/**
 * useUserLevel — derives a level + title from raw progress.
 *
 * XP model: punches count 1 each, completed passes bonus 5, streak bonus 1/day.
 * Levels follow a triangular curve: level n needs 10·n·(n+1)/2 XP cumulatively.
 * That gives a gentle early ramp (Lv 2 at 10 xp, Lv 3 at 30, Lv 5 at 75, Lv 10 at 275).
 */
import { useMemo } from 'react';

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
  // total XP required to *reach* (level)
  const n = level - 1;
  return 5 * n * (n + 1);
}

export default function useUserLevel({
  totalPunches = 0,
  completedPasses = 0,
  currentStreak = 0,
} = {}) {
  return useMemo(() => {
    const xp =
      (totalPunches | 0) * 1 +
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

    return { level, xp, xpInLevel, xpForNext, progressPct, title };
  }, [totalPunches, completedPasses, currentStreak]);
}
