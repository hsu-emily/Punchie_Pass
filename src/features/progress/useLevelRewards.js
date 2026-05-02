/**
 * useLevelRewards — grants tokens when the user levels up.
 *
 * Storage shape on `users/{uid}`:
 *   progress: {
 *     lastRewardedLevel:    number,  // last level we paid out for
 *     lifetimeTokensEarned: number,  // total tokens awarded by leveling
 *   }
 *
 * Reward formula per level gained:
 *   base 2 ✦ per level + milestone bonus (+10 ✦ at 5/10/25/50/100)
 *
 * Granted via a single atomic Firestore update on the user doc:
 *   gacha.bonusTokens         += totalTokens   (drives tokensAvailable)
 *   progress.lastRewardedLevel = level
 *   progress.lifetimeTokensEarned += totalTokens
 *
 * Returns the latest unacknowledged event so the caller can show a toast,
 * plus an `acknowledge()` to dismiss it. First-run init never rewards
 * legacy progress — it just snapshots the current level so existing users
 * don't get a retroactive token flood.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';

const MILESTONES = new Set([5, 10, 25, 50, 100]);

function rewardForLevel(lv) {
  return 2 + (MILESTONES.has(lv) ? 10 : 0);
}

export default function useLevelRewards(level) {
  const { user, profile } = useAuth();
  const [event, setEvent] = useState(null);
  const writingRef = useRef(false);

  const progress = profile?.progress;
  const lastRewardedLevel = progress?.lastRewardedLevel;

  useEffect(() => {
    if (!user || !profile || !level) return;
    if (writingRef.current) return;

    // First-run init: snapshot current level without paying out.
    if (lastRewardedLevel === undefined) {
      writingRef.current = true;
      updateDoc(doc(db, 'users', user.uid), {
        'progress.lastRewardedLevel': level,
      })
        .catch((err) => console.error('Level reward init failed:', err))
        .finally(() => { writingRef.current = false; });
      return;
    }

    if (level <= lastRewardedLevel) return;

    const gained = [];
    let tokens = 0;
    for (let lv = lastRewardedLevel + 1; lv <= level; lv++) {
      const r = rewardForLevel(lv);
      gained.push(lv);
      tokens += r;
    }
    const milestone = gained.some((lv) => MILESTONES.has(lv));

    writingRef.current = true;
    updateDoc(doc(db, 'users', user.uid), {
      'gacha.bonusTokens': increment(tokens),
      'progress.lastRewardedLevel': level,
      'progress.lifetimeTokensEarned': increment(tokens),
    })
      .then(() => setEvent({ levels: gained, tokens, milestone, level }))
      .catch((err) => console.error('Level reward grant failed:', err))
      .finally(() => { writingRef.current = false; });
  }, [user, profile, level, lastRewardedLevel]);

  const acknowledge = useCallback(() => setEvent(null), []);

  return { event, acknowledge };
}
