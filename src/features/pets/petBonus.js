/**
 * Helpers for reading the active pet's bonuses anywhere they're applied.
 * Single import path so hooks (xp, tokens, streak) share the same source.
 *
 * Pet upgrade levels (0..MAX_PET_UPGRADE) are earned by fusing duplicate
 * eggs of an already-hatched bunny. Each level adds a small flat bump on
 * top of the variant's base bonus.
 */
import { BUNNY_VARIANTS } from '@/features/bunny/bunnyVariants';

const NEUTRAL_BONUS = { xpMultiplier: 1, tokenChance: 0, streakShield: 0 };

export const MAX_PET_UPGRADE = 5;

/** Per-upgrade-level deltas applied additively to the base bonus. */
export const UPGRADE_STEP = {
  xpMultiplier: 0.04,   // +4% XP per level (caps at +20% at lvl 5)
  tokenChance:  0.02,   // +2% bonus token chance per level (caps at +10%)
  // streakShield: +1 day at lvl 5 only.
};

/**
 * Eggs required to advance from `level` to `level + 1`. Doubles each step,
 * starting at 1: 1 → 2 → 4 → 8 → 16. Total to fully max = 31 eggs.
 */
export function upgradeCost(currentLevel) {
  if (currentLevel < 0 || currentLevel >= MAX_PET_UPGRADE) return 0;
  return 2 ** currentLevel;
}

/** Bonus a pet has at the given upgrade level. Level 0 = base. */
export function getPetBonus(activeKind, upgradeLevel = 0) {
  const v = BUNNY_VARIANTS[activeKind];
  const base = { ...NEUTRAL_BONUS, ...(v?.bonus || {}) };
  const lv = Math.max(0, Math.min(MAX_PET_UPGRADE, upgradeLevel | 0));
  if (lv === 0) return base;
  return {
    xpMultiplier: +(base.xpMultiplier + UPGRADE_STEP.xpMultiplier * lv).toFixed(3),
    tokenChance:  Math.min(1, +(base.tokenChance + UPGRADE_STEP.tokenChance * lv).toFixed(3)),
    streakShield: base.streakShield + Math.floor(lv / MAX_PET_UPGRADE),
  };
}

/** Render a bonus object as a human-readable label (e.g. "+4% XP · 1-day streak shield"). */
export function formatBonus(bonus) {
  const parts = [];
  if (bonus.xpMultiplier > 1.0005) {
    parts.push(`+${Math.round((bonus.xpMultiplier - 1) * 100)}% XP`);
  }
  if (bonus.tokenChance > 0.0005) {
    parts.push(`+${Math.round(bonus.tokenChance * 100)}% bonus token`);
  }
  if (bonus.streakShield > 0) {
    parts.push(`${bonus.streakShield}-day streak shield`);
  }
  return parts.join(' · ');
}

/** What the *next* upgrade would add — used by the Pets page tooltip. */
export function describeNextUpgrade(activeKind, currentLevel = 0) {
  if (currentLevel >= MAX_PET_UPGRADE) return null;
  const before = getPetBonus(activeKind, currentLevel);
  const after = getPetBonus(activeKind, currentLevel + 1);
  const parts = [];
  const dx = after.xpMultiplier - before.xpMultiplier;
  const dt = after.tokenChance - before.tokenChance;
  const ds = after.streakShield - before.streakShield;
  if (dx > 0.001) parts.push(`+${Math.round(dx * 100)}% XP`);
  if (dt > 0.001) parts.push(`+${Math.round(dt * 100)}% bonus token chance`);
  if (ds > 0)     parts.push(`+${ds}d streak shield`);
  return parts.join(' · ') || null;
}
