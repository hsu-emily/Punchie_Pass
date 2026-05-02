/**
 * Helpers for reading the active pet's bonuses anywhere they're applied.
 * Single import path so hooks (xp, tokens, streak) share the same source.
 */
import { BUNNY_VARIANTS } from '@/features/bunny/bunnyVariants';

const NEUTRAL_BONUS = { xpMultiplier: 1, tokenChance: 0, streakShield: 0 };

/** Active pet's `bonus` block, or a no-op bonus if the pet/profile is missing. */
export function getPetBonus(activeKind) {
  const v = BUNNY_VARIANTS[activeKind];
  return { ...NEUTRAL_BONUS, ...(v?.bonus || {}) };
}
