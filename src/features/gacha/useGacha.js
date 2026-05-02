/**
 * useGacha — wires the pure gacha service to Firestore + applies the active
 * pet's `tokenChance` bonus.
 *
 * Storage shape on `users/{uid}`:
 *   gacha: {
 *     pullsUsed:           number,   // total successful pulls
 *     pityCounter:         number,   // gachaService's running counter
 *     inventory:           { [itemId]: InventoryEntry },
 *     bonusTokens:         number,   // tokens awarded by pet `tokenChance`
 *     bonusEvaluatedPasses:number,   // last `completedPasses` value bonusTokens was synced to
 *   }
 *
 * Token derivation:
 *   tokensAvailable = max(0, completedPasses + bonusTokens − pullsUsed)
 *
 * Bonus tokens are awarded only on *new* pass completions: when
 * `completedPasses > bonusEvaluatedPasses`, we roll `tokenChance` once per new
 * pass with the active pet's chance and persist the delta. Switching pets
 * mid-grind doesn't retroactively award tokens for old passes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import { getPetBonus } from '@/features/pets/petBonus';
import useUserProgress from '@/features/habits/useUserProgress';
import { useHabitStore } from '@/features/habits/habitStore';
import { PULL_COST } from './gachaCatalog';
import { mergeIntoInventory, pull as rollPull } from './gachaService';

export default function useGacha() {
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const { completedPasses } = useUserProgress(habits);
  const [pulling, setPulling] = useState(false);
  const [error, setError] = useState(null);

  const gacha = profile?.gacha;
  const pullsUsed = gacha?.pullsUsed || 0;
  const pityCounter = gacha?.pityCounter || 0;
  const bonusTokens = gacha?.bonusTokens || 0;
  const bonusEvaluatedPasses = gacha?.bonusEvaluatedPasses || 0;
  const inventory = useMemo(() => gacha?.inventory || {}, [gacha?.inventory]);

  const activeKind = profile?.bunny?.kind || 'bun';
  const { tokenChance } = getPetBonus(activeKind);

  const tokensAvailable = Math.max(0, completedPasses + bonusTokens - pullsUsed);

  // ── Bonus-token sync ────────────────────────────────────────────────
  // When the user completes new passes, roll the active pet's `tokenChance`
  // for each newly-completed pass and persist the deltas.
  //
  // Two safety nets:
  //   • First-run init: if bonusEvaluatedPasses is missing (existing users
  //     pre-feature), set it to current completedPasses without rolling, so
  //     legacy progress doesn't get retroactively granted bonus tokens.
  //   • In-flight ref: prevents the effect from double-firing across
  //     overlapping snapshot updates while the write is round-tripping.
  const syncingRef = useRef(false);
  const hasGacha = !!gacha;
  useEffect(() => {
    if (!user || !profile) return;
    if (syncingRef.current) return;

    // Existing users with no bonus fields yet: initialize without rolling.
    if (hasGacha && gacha.bonusEvaluatedPasses === undefined && completedPasses > 0) {
      syncingRef.current = true;
      updateDoc(doc(db, 'users', user.uid), {
        'gacha.bonusEvaluatedPasses': completedPasses,
      })
        .catch((err) => console.error('Bonus init failed:', err))
        .finally(() => { syncingRef.current = false; });
      return;
    }

    const newlyCompleted = completedPasses - bonusEvaluatedPasses;
    if (newlyCompleted <= 0) return;

    let awarded = 0;
    if (tokenChance > 0) {
      for (let i = 0; i < newlyCompleted; i++) {
        if (Math.random() < tokenChance) awarded += 1;
      }
    }

    syncingRef.current = true;
    updateDoc(doc(db, 'users', user.uid), {
      'gacha.bonusEvaluatedPasses': completedPasses,
      ...(awarded > 0 ? { 'gacha.bonusTokens': increment(awarded) } : {}),
    })
      .catch((err) => console.error('Bonus token sync failed:', err))
      .finally(() => { syncingRef.current = false; });
  }, [user, profile, hasGacha, gacha, completedPasses, bonusEvaluatedPasses, tokenChance]);

  const inventoryList = useMemo(
    () => Object.values(inventory).sort((a, b) => {
      const rOrder = ['common', 'cute', 'rare', 'holo', 'secret'];
      const dr = rOrder.indexOf(b.rarity) - rOrder.indexOf(a.rarity);
      if (dr !== 0) return dr;
      return (b.lastPulledAt || '').localeCompare(a.lastPulledAt || '');
    }),
    [inventory]
  );

  const pull = useCallback(
    async (count = 1) => {
      if (!user) throw new Error('Not signed in');
      const cost = count * PULL_COST;
      if (tokensAvailable < cost) {
        throw new Error(`Need ${cost} tokens, have ${tokensAvailable}`);
      }

      setPulling(true);
      setError(null);
      try {
        const { items, nextPityCounter } = rollPull({
          count,
          pityCounter,
        });
        const nextInventory = mergeIntoInventory(inventory, items);

        await updateDoc(doc(db, 'users', user.uid), {
          'gacha.pullsUsed': increment(count),
          'gacha.pityCounter': nextPityCounter,
          'gacha.inventory': nextInventory,
          'gacha.lastPulledAt': serverTimestamp(),
        });

        return items;
      } catch (err) {
        console.error('Gacha pull failed:', err);
        setError(err);
        throw err;
      } finally {
        setPulling(false);
      }
    },
    [user, tokensAvailable, pityCounter, inventory]
  );

  return {
    tokensAvailable,
    pullsUsed,
    pityCounter,
    bonusTokens,
    inventory,
    inventoryList,
    pull,
    pulling,
    error,
  };
}
