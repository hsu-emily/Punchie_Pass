/**
 * useStreak — derive a current streak (consecutive days with ≥1 punch)
 * from a list of punch timestamps.
 *
 * @param {Array<Date|firebase.Timestamp|number|string>} punches
 *   Timestamps of all punches the user has made. Order doesn't matter.
 * @returns {{ current: number, longest: number }}
 *
 * For Firestore-backed apps, prefer pushing this calculation server-side
 * (Cloud Function on punch write) and reading the stored value, then use
 * this hook only for local optimistic updates.
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

export default function useStreak(punches) {
  return useMemo(() => {
    if (!punches?.length) return { current: 0, longest: 0 };

    const days = new Set(punches.map(toDate).filter(Boolean).map(dayKey));

    // Longest streak: walk all unique days sorted ascending
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

    // Current streak: count back from today
    let current = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; ; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(dayKey(d))) {
        current++;
      } else if (i === 0) {
        // grace: if user hasn't punched today yet, still count if they
        // punched yesterday — only break the streak after a full day off
        continue;
      } else {
        break;
      }
    }

    return { current, longest };
  }, [punches]);
}
