/**
 * usePets — bunny variants the user has hatched + which is active.
 *
 * Storage on `users/{uid}`:
 *   bunny.kind          — currently active variant id (existing field)
 *   pets.hatched: string[] — variant ids the user has hatched from eggs
 *
 * Eggs themselves live in `gacha.inventory` (kind === 'egg'). Hatching
 * decrements the egg count and adds the variant to `pets.hatched`.
 */

import { useCallback, useMemo } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import { useHabitStore } from '@/features/habits/habitStore';
import useUserProgress from '@/features/habits/useUserProgress';
import {
  BUNNY_KINDS,
  BUNNY_VARIANTS,
  evaluateUnlockedBunnies,
} from '@/features/bunny/bunnyVariants';

export default function usePets() {
  const { user, profile } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const progress = useUserProgress(habits);

  const activePet = profile?.bunny?.kind || 'bun';
  const hatched = useMemo(() => profile?.pets?.hatched || [], [profile?.pets?.hatched]);
  const inventory = useMemo(
    () => profile?.gacha?.inventory || {},
    [profile?.gacha?.inventory]
  );

  const unlockedIds = useMemo(
    () => new Set(evaluateUnlockedBunnies(progress, hatched)),
    [progress, hatched]
  );

  const eggsByVariant = useMemo(() => {
    const out = {};
    for (const item of Object.values(inventory)) {
      if (item.kind === 'egg' && item.count > 0) {
        out[item.ref] = (out[item.ref] || 0) + item.count;
      }
    }
    return out;
  }, [inventory]);

  /** All variants annotated with status — for the Pets page grid. */
  const variants = useMemo(
    () => BUNNY_KINDS.map((id) => {
      const v = BUNNY_VARIANTS[id];
      const unlocked = unlockedIds.has(id);
      const eggsHeld = eggsByVariant[id] || 0;
      return {
        ...v,
        unlocked,
        active: id === activePet,
        eggsHeld,
        canHatch: !unlocked && v.source === 'egg' && eggsHeld > 0,
      };
    }),
    [unlockedIds, eggsByVariant, activePet]
  );

  const setActivePet = useCallback(
    async (id) => {
      if (!user || !unlockedIds.has(id)) return;
      await updateDoc(doc(db, 'users', user.uid), {
        'bunny.kind': id,
        updatedAt: serverTimestamp(),
      });
    },
    [user, unlockedIds]
  );

  /**
   * hatchEgg — consume one egg with `ref === variantId` and add the
   * variant to `pets.hatched`. Throws if no egg held or already hatched.
   */
  const hatchEgg = useCallback(
    async (variantId) => {
      if (!user) throw new Error('Not signed in');
      if (hatched.includes(variantId)) throw new Error('Already hatched');

      const eggEntry = Object.values(inventory).find(
        (it) => it.kind === 'egg' && it.ref === variantId && (it.count || 0) > 0
      );
      if (!eggEntry) throw new Error('No egg available');

      const nextInventory = { ...inventory };
      const remaining = (eggEntry.count || 1) - 1;
      if (remaining <= 0) {
        delete nextInventory[eggEntry.id];
      } else {
        nextInventory[eggEntry.id] = { ...eggEntry, count: remaining };
      }

      await updateDoc(doc(db, 'users', user.uid), {
        'gacha.inventory': nextInventory,
        'pets.hatched': [...hatched, variantId],
        updatedAt: serverTimestamp(),
      });
    },
    [user, hatched, inventory]
  );

  return { activePet, variants, hatched, eggsByVariant, setActivePet, hatchEgg };
}
