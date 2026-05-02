/**
 * useGacha — wires the pure gacha service to Firestore.
 *
 * Storage shape on `users/{uid}`:
 *   gacha: {
 *     pullsUsed:    number,    // total successful pulls
 *     pityCounter:  number,    // gachaService's running counter
 *     inventory:    { [itemId]: InventoryEntry }
 *   }
 *
 * Tokens are *derived*, not stored:
 *   tokensAvailable = completedPasses - gacha.pullsUsed
 *
 * That keeps token-earning automatic from existing habit data and avoids a
 * second source of truth. Persistence shifts only happen on pull().
 */

import { useCallback, useMemo, useState } from 'react';
import { doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
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
  const inventory = useMemo(() => gacha?.inventory || {}, [gacha?.inventory]);

  const tokensAvailable = Math.max(0, completedPasses - pullsUsed);

  const inventoryList = useMemo(
    () => Object.values(inventory).sort((a, b) => {
      // Rarity desc then most-recent first.
      const rOrder = ['common', 'cute', 'rare', 'holo', 'secret'];
      const dr = rOrder.indexOf(b.rarity) - rOrder.indexOf(a.rarity);
      if (dr !== 0) return dr;
      return (b.lastPulledAt || '').localeCompare(a.lastPulledAt || '');
    }),
    [inventory]
  );

  /**
   * pull — spend `count` tokens to roll `count` capsules.
   * Returns the array of awarded items (also persisted to inventory).
   * Throws if not enough tokens or no auth.
   */
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
    inventory,
    inventoryList,
    pull,
    pulling,
    error,
  };
}
