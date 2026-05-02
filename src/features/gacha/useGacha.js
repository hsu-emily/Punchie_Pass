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
 *   tokensAvailable = max(0, passTokens + bonusTokens − pullsUsed)
 *
 * `passTokens` weights completed passes by frequency category
 * (daily=1, weekly=4, monthly=10) — see useUserProgress.
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
import { PULL_COST, SHARD_VALUE } from './gachaCatalog';
import { mergeIntoInventory, pull as rollPull } from './gachaService';

export default function useGacha() {
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const { completedPasses, passTokens } = useUserProgress(habits);
  const [pulling, setPulling] = useState(false);
  const [error, setError] = useState(null);

  const gacha = profile?.gacha;
  const pullsUsed = gacha?.pullsUsed || 0;
  const pityCounter = gacha?.pityCounter || 0;
  const bonusTokens = gacha?.bonusTokens || 0;
  const bonusEvaluatedPasses = gacha?.bonusEvaluatedPasses || 0;
  const shards = gacha?.shards || 0;
  const inventory = useMemo(() => gacha?.inventory || {}, [gacha?.inventory]);

  const activeKind = profile?.bunny?.kind || 'bun';
  const upgradeLv = profile?.pets?.upgrades?.[activeKind] || 0;
  const { tokenChance } = getPetBonus(activeKind, upgradeLv);

  const tokensAvailable = Math.max(0, passTokens + bonusTokens - pullsUsed);

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

  /**
   * grantBonusTokens — dev helper for adding tokens to your own account.
   * Bumps `gacha.bonusTokens` directly, which feeds into tokensAvailable.
   * Safe to call in production but only surfaced in dev UI.
   */
  const grantBonusTokens = useCallback(
    async (n = 10) => {
      if (!user) throw new Error('Not signed in');
      await updateDoc(doc(db, 'users', user.uid), {
        'gacha.bonusTokens': increment(n),
      });
    },
    [user]
  );

  /**
   * recycle — convert duplicates of an item into shards. Eggs are excluded
   * (they're consumed by hatching, not by recycling). You can never recycle
   * the last copy of an item — `count` must end at 1 or higher so the user
   * keeps the entry.
   */
  const recycle = useCallback(
    async (itemId, copies = 1) => {
      if (!user) throw new Error('Not signed in');
      const entry = inventory[itemId];
      if (!entry) throw new Error('Item not in inventory');
      if (entry.kind === 'egg') throw new Error('Eggs cannot be recycled');
      const available = (entry.count || 1) - 1;
      if (available <= 0) throw new Error('No duplicates to recycle');
      const n = Math.min(copies, available);
      const value = (SHARD_VALUE[entry.rarity] || 1) * n;

      const nextInventory = { ...inventory };
      nextInventory[itemId] = { ...entry, count: (entry.count || 1) - n };

      await updateDoc(doc(db, 'users', user.uid), {
        'gacha.inventory': nextInventory,
        'gacha.shards': increment(value),
      });
      return { shards: value, recycled: n };
    },
    [user, inventory]
  );

  /**
   * recycleAll — convert every available duplicate across the inventory in
   * one Firestore write. Eggs and single-copy items are left untouched.
   * Returns { shards, recycled } totals.
   */
  const recycleAll = useCallback(
    async () => {
      if (!user) throw new Error('Not signed in');
      const nextInventory = { ...inventory };
      let totalShards = 0;
      let totalRecycled = 0;
      for (const entry of Object.values(inventory)) {
        if (entry.kind === 'egg') continue;
        const dupes = (entry.count || 1) - 1;
        if (dupes <= 0) continue;
        totalShards += (SHARD_VALUE[entry.rarity] || 1) * dupes;
        totalRecycled += dupes;
        nextInventory[entry.id] = { ...entry, count: 1 };
      }
      if (totalRecycled === 0) return { shards: 0, recycled: 0 };
      await updateDoc(doc(db, 'users', user.uid), {
        'gacha.inventory': nextInventory,
        'gacha.shards': increment(totalShards),
      });
      return { shards: totalShards, recycled: totalRecycled };
    },
    [user, inventory]
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
    shards,
    inventory,
    inventoryList,
    pull,
    pulling,
    error,
    grantBonusTokens,
    recycle,
    recycleAll,
  };
}
