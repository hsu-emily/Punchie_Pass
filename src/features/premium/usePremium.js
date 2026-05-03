/**
 * usePremium — reads `profile.premium` to determine if the user has an
 * active Punchie Pass+ subscription, and exposes `subscribe()` to start one.
 *
 * Storage on `users/{uid}`:
 *   premium: {
 *     active:    boolean,
 *     since:     ISO string,
 *     expiresAt: ISO string,   // active is treated as false past this date
 *   }
 *
 * Premium perks (single source of truth — referenced by useUserProgress and
 * useUploadSlots):
 *   • FREE_HABIT_LIMIT — non-premium users capped here
 *   • PREMIUM_COIN_MULTIPLIER — multiplies passTokens earned from habits
 *   • PREMIUM_BONUS_UPLOAD_SLOTS — added on top of base/earned upload slots
 */
import { useCallback, useMemo } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/features/auth/useAuth';

export const FREE_HABIT_LIMIT = 3;
export const PREMIUM_COIN_MULTIPLIER = 5;
export const PREMIUM_BONUS_UPLOAD_SLOTS = 10;
export const PREMIUM_PRICE_USD = 3.99;
export const PREMIUM_PERIOD_DAYS = 365;

function isActive(premium) {
  if (!premium?.active) return false;
  if (!premium.expiresAt) return true;
  return new Date(premium.expiresAt).getTime() > Date.now();
}

export default function usePremium() {
  const { user, profile } = useAuth();
  const premium = profile?.premium;
  const active = useMemo(() => isActive(premium), [premium]);

  const subscribe = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    const now = new Date();
    const expires = new Date(now.getTime() + PREMIUM_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    await setDoc(
      doc(db, 'users', user.uid),
      {
        premium: {
          active: true,
          since: now.toISOString(),
          expiresAt: expires.toISOString(),
          canceled: false,
          canceledAt: null,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [user]);

  // Cancel auto-renewal. The user keeps premium access through `expiresAt`,
  // matching how App Store / Stripe-style cancellations behave: status stays
  // active until the paid period lapses, then `isActive` flips to false.
  const unsubscribe = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    await setDoc(
      doc(db, 'users', user.uid),
      {
        premium: {
          ...(premium || {}),
          canceled: true,
          canceledAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [user, premium]);

  return {
    premium: active,
    since: premium?.since || null,
    expiresAt: premium?.expiresAt || null,
    canceled: !!premium?.canceled,
    subscribe,
    unsubscribe,
  };
}
