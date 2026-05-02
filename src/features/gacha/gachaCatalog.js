/**
 * gachaCatalog — declarative catalog of every item the Punchie Machine
 * can drop, plus the rarity tiers, weights, and pity rules.
 *
 * This file is the single source of truth for *what exists* in the gacha.
 * The rolling logic lives in @/features/gacha/gachaService.js — it consumes
 * this catalog. Inventory state lives on the user profile (see useGacha).
 *
 * Adding new items: append to GACHA_ITEMS with a stable id, kind, rarity,
 * and a `ref` that the renderer maps to art (sticker PNG, cursor SVG, etc).
 *
 * Kinds (extend as we ship):
 *   • sticker            — flat decals shown on the dashboard / journals
 *   • cursor             — app-wide CSS cursor (overlaps with unlockRules
 *                          cursors, but gacha cursors are cosmetic-only
 *                          variants and never gate features)
 *   • decoration         — placed onto the StudentIdCard frame (planned)
 *   • avatar-decoration  — equipped on the avatar layer stack (planned)
 *
 * Rarities ranked low → high. Weights are within a single pull's roll —
 * they do *not* need to sum to 100; the service normalizes them.
 */

export const RARITY_ORDER = ['common', 'cute', 'rare', 'holo', 'secret'];

export const RARITY_META = {
  common: { label: 'Common', accent: '#F9A8D4', glow: 'none' },
  cute:   { label: 'Cute',   accent: '#F472B6', glow: '0 0 18px rgba(244,114,182,0.45)' },
  rare:   { label: 'Rare',   accent: '#A5C2F0', glow: '0 0 22px rgba(165,194,240,0.55)' },
  holo:   { label: 'Holo',   accent: '#C5B7FF', glow: '0 0 28px rgba(197,183,255,0.7)' },
  secret: { label: 'Secret', accent: '#FFD27A', glow: '0 0 34px rgba(255,210,122,0.85)' },
};

/** Default per-pull weights. The service can override these per-machine. */
export const DEFAULT_WEIGHTS = {
  common: 60,
  cute:   28,
  rare:   9,
  holo:   2.5,
  secret: 0.5,
};

/**
 * Pity: every Nth pull guarantees AT LEAST the floor rarity.
 * "any rarity at or above floor counts as redeeming the pity counter."
 */
export const PITY_RULES = [
  { everyN: 10, floor: 'rare' },
  { everyN: 50, floor: 'holo' },
];

/** Token cost per pull. */
export const PULL_COST = 1;
/** Bulk pull bundles. The 10× pulls reuse the same pity counter. */
export const PULL_BUNDLES = [1, 10];

/**
 * GACHA_ITEMS — initial pool. The `ref` field is intentionally a slug;
 * art lookup happens in the renderer so we can hot-swap PNGs without
 * touching the catalog.
 *
 * Keep this seeded with placeholder items per kind so the pull logic is
 * exercised end-to-end. Real art lands later.
 */
export const GACHA_ITEMS = [
  // ── Stickers (the bulk of the pool) ──
  { id: 'sticker.heart',        kind: 'sticker', rarity: 'common', ref: 'heart',        name: 'Lil Heart' },
  { id: 'sticker.cloud',        kind: 'sticker', rarity: 'common', ref: 'cloud',        name: 'Tiny Cloud' },
  { id: 'sticker.star',         kind: 'sticker', rarity: 'common', ref: 'star',         name: 'Star Bit' },
  { id: 'sticker.bow',          kind: 'sticker', rarity: 'cute',   ref: 'bow',          name: 'Pink Bow' },
  { id: 'sticker.cake',         kind: 'sticker', rarity: 'cute',   ref: 'cake',         name: 'Slice of Cake' },
  { id: 'sticker.bunnyChibi',   kind: 'sticker', rarity: 'rare',   ref: 'bunny-chibi',  name: 'Chibi Bunny' },
  { id: 'sticker.galaxyBow',    kind: 'sticker', rarity: 'holo',   ref: 'galaxy-bow',   name: 'Galaxy Bow ✦' },
  { id: 'sticker.goldenBunny',  kind: 'sticker', rarity: 'secret', ref: 'golden-bunny', name: '★ Golden Bunny ★' },

  // ── Cursors (cosmetic gacha variants; functional cursors stay in unlockRules) ──
  { id: 'cursor.gummy',     kind: 'cursor', rarity: 'cute', ref: 'gummy',     name: 'Gummy Cursor' },
  { id: 'cursor.shootStar', kind: 'cursor', rarity: 'rare', ref: 'shootStar', name: 'Shooting Star' },
  { id: 'cursor.holoHeart', kind: 'cursor', rarity: 'holo', ref: 'holoHeart', name: 'Holo Heart' },

  // ── Decorations (frame stickers, planned) ──
  { id: 'decoration.lace',   kind: 'decoration', rarity: 'cute', ref: 'lace',   name: 'Lace Trim' },
  { id: 'decoration.pearls', kind: 'decoration', rarity: 'rare', ref: 'pearls', name: 'Pearl String' },

  // ── Avatar decorations (worn on the avatar, planned) ──
  { id: 'avatar.tinyCrown', kind: 'avatar-decoration', rarity: 'rare',   ref: 'tinyCrown', name: 'Tiny Crown' },
  { id: 'avatar.haloRing',  kind: 'avatar-decoration', rarity: 'holo',   ref: 'haloRing',  name: 'Halo Ring' },
];

export const GACHA_KINDS = [...new Set(GACHA_ITEMS.map((i) => i.kind))];

/** Group items by rarity for fast pull-time lookup. */
export function itemsByRarity(items = GACHA_ITEMS) {
  const out = Object.fromEntries(RARITY_ORDER.map((r) => [r, []]));
  for (const it of items) out[it.rarity]?.push(it);
  return out;
}
