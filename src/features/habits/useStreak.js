/**
 * useStreak — derive a current streak (consecutive days with ≥1 punch)
 * from a list of punch timestamps.
 *
 * @param {Array<Date|firebase.Timestamp|number|string>} punches
 * @param {object} [opts]
 * @param {number} [opts.shieldDays=0]
 *   Number of empty days the streak forgives before breaking. Sourced from
 *   the active pet's `streakShield` bonus where applicable. Shielded days
 *   keep the streak alive but do *not* count toward streak length — the
 *   number is "consecutive days you actually punched", not "days alive".
 * @returns {{ current: number, longest: number, shieldUsed: number }}
 */
import { useMemo } from 'react';

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  return new Date(v);
};

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function useStreak(punches, { shieldDays = 0 } = {}) {
  return useMemo(() => {
    if (!punches?.length) return { current: 0, longest: 0, shieldUsed: 0 };

    const days = new Set(punches.map(toDate).filter(Boolean).map(dayKey));

    // Longest streak — shields don't apply here (lifetime stat is exact).
    const sorted = [...days].sort();
    let longest = 0, run = 0, prev = null;
    for (const k of sorted) {
      const d = new Date(k);
      if (prev) {
        const diff = (d - prev) / 86_400_000;
        run = diff === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      longest = Math.max(longest, run);
      prev = d;
    }

    // Current streak — walk back from today, applying shield to gap days.
    let current = 0;
    let shieldRemaining = Math.max(0, shieldDays | 0);
    let shieldUsed = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; ; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(dayKey(d))) {
        current++;
      } else if (i === 0) {
        // Grace: not punching today doesn't break the streak yet.
        continue;
      } else if (shieldRemaining > 0) {
        shieldRemaining -= 1;
        shieldUsed += 1;
        // Streak survives this gap day; do not increment `current`.
        continue;
      } else {
        break;
      }
    }

    return { current, longest, shieldUsed };
  }, [punches, shieldDays]);
}
