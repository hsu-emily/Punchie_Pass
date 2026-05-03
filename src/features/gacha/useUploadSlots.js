/**
 * useUploadSlots — how many custom-icon slots the user has unlocked, and
 * how to spend shards to unlock more.
 *
 * Storage on `users/{uid}`:
 *   uploads.slotsUnlocked: number   // defaults to 1 (one free slot)
 *
 * Slot 1 is free. Slot 2 onward costs shards per UPLOAD_SLOT_COSTS.
 */
import { useCallback } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';
import usePremium, { PREMIUM_BONUS_UPLOAD_SLOTS } from '@/features/premium/usePremium';
import { uploadSlotCost } from './gachaCatalog';

export default function useUploadSlots() {
  const { user, profile } = useAuth();
  const { premium } = usePremium();
  const baseSlotsUnlocked = profile?.uploads?.slotsUnlocked ?? 1;
  // Premium grants bonus slots on top of the user's earned/base slots so the
  // bonus disappears cleanly if a subscription lapses, without touching the
  // stored slot count.
  const slotsUnlocked = baseSlotsUnlocked + (premium ? PREMIUM_BONUS_UPLOAD_SLOTS : 0);
  const shards = profile?.gacha?.shards || 0;
  const nextSlotIndex = baseSlotsUnlocked + 1;
  const nextSlotCost = uploadSlotCost(nextSlotIndex);
  const canUnlockNext = shards >= nextSlotCost;

  const unlockNextSlot = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    if (shards < nextSlotCost) {
      throw new Error(`Need ${nextSlotCost} shards, have ${shards}`);
    }
    await updateDoc(doc(db, 'users', user.uid), {
      'gacha.shards': increment(-nextSlotCost),
      'uploads.slotsUnlocked': nextSlotIndex,
    });
    return { slotsUnlocked: nextSlotIndex, spent: nextSlotCost };
  }, [user, shards, nextSlotCost, nextSlotIndex]);

  return {
    slotsUnlocked,
    nextSlotIndex,
    nextSlotCost,
    canUnlockNext,
    shards,
    unlockNextSlot,
  };
}
