/**
 * gachaCatalog — declarative catalog of every item the Punchie Machine
 * can drop, plus the rarity tiers, weights, and pity rules.
 *
 * `ref` field semantics by kind:
 *   • cursor          — folder name under src/assets/cursors/{ref}/
 *   • icon            — `bucket/number` matching src/assets/icons/{bucket}/{n}.png
 *                       (same id format as habit.iconId)
 *   • pass-template   — exact filename under src/assets/punch_cards/
 *   • egg             — bunnyVariants id this egg hatches into
 *   • sticker         — slug under src/assets/stickers/{ref}.png   (art pending)
 *   • decoration      — slug under src/assets/decorations/{ref}.png (art pending)
 *   • avatar-decoration — slug under src/assets/avatar_decorations/{ref}.png (art pending)
 */

export const RARITY_ORDER = ['common', 'cute', 'rare', 'holo', 'secret'];

export const RARITY_META = {
  common: { label: 'Common', accent: '#F9A8D4', glow: 'none' },
  cute:   { label: 'Cute',   accent: '#F472B6', glow: '0 0 18px rgba(244,114,182,0.45)' },
  rare:   { label: 'Rare',   accent: '#A5C2F0', glow: '0 0 22px rgba(165,194,240,0.55)' },
  holo:   { label: 'Holo',   accent: '#C5B7FF', glow: '0 0 28px rgba(197,183,255,0.7)' },
  secret: { label: 'Secret', accent: '#FFD27A', glow: '0 0 34px rgba(255,210,122,0.85)' },
};

export const DEFAULT_WEIGHTS = {
  common: 60,
  cute:   28,
  rare:   9,
  holo:   2.5,
  secret: 0.5,
};

export const PITY_RULES = [
  { everyN: 50, floor: 'holo' },
];

/**
 * Bunny pity — every Nth pull is forced to be an egg (kind=egg). The egg's
 * rarity is rolled from the normal weights but restricted to the egg pool,
 * falling down the rarity ladder if a tier has no eggs.
 */
export const BUNNY_PITY_EVERY = 10;

export const PULL_COST = 1;
export const PULL_BUNDLES = [1, 10];

/**
 * Shards — recycling a duplicate (any item with count > 1) yields shards
 * scaled by rarity. Spend shards on upload slots, future cosmetic skins, etc.
 */
export const SHARD_VALUE = {
  common: 1,
  cute:   2,
  rare:   5,
  holo:   12,
  secret: 30,
};

/**
 * Custom-icon upload slots — slot 1 is free. Additional slots cost shards
 * per the schedule below (slot 2 = 5, slot 3 = 20, slot 4 = 30, …). The
 * array is open-ended; if the user blasts past the end, future slots cost
 * the last value in the schedule.
 */
export const UPLOAD_SLOT_COSTS = [5, 20, 30, 50, 80];

export function uploadSlotCost(nextSlotIndex) {
  // nextSlotIndex is 1-based: 1 = the slot you already have free, so first
  // *purchasable* slot is index 2 → schedule[0].
  const i = Math.max(0, nextSlotIndex - 2);
  return UPLOAD_SLOT_COSTS[Math.min(i, UPLOAD_SLOT_COSTS.length - 1)];
}

/**
 * GACHA_ITEMS — the live drop pool, restricted to kinds that have real art
 * on disk today (cursor / icon / pass-template / egg). Sticker, decoration,
 * and avatar-decoration entries are removed from the pool until their art
 * folders exist; re-add them here once the PNGs land.
 */
export const GACHA_ITEMS = [
  // ── Cursors (src/assets/cursors/{ref}/) ──
  { id: 'cursor.star',  kind: 'cursor', rarity: 'cute', ref: 'star',  name: 'Star Cursor' },
  { id: 'cursor.wand',  kind: 'cursor', rarity: 'rare', ref: 'wand',  name: 'Wand Cursor' },
  { id: 'cursor.heart', kind: 'cursor', rarity: 'holo', ref: 'heart', name: 'Heart Cursor' },

  // ── Punch icons (src/assets/icons/{bucket}/{n}.png) ──
  // pink/* — common (8 of 11; 3, 4, 5 stay free defaults if you want)
  { id: 'icon.pink.3',  kind: 'icon', rarity: 'common', ref: 'pink/3',  name: 'Pink Stamp 3' },
  { id: 'icon.pink.4',  kind: 'icon', rarity: 'common', ref: 'pink/4',  name: 'Pink Stamp 4' },
  { id: 'icon.pink.5',  kind: 'icon', rarity: 'common', ref: 'pink/5',  name: 'Pink Stamp 5' },
  { id: 'icon.pink.6',  kind: 'icon', rarity: 'common', ref: 'pink/6',  name: 'Pink Stamp 6' },
  { id: 'icon.pink.7',  kind: 'icon', rarity: 'common', ref: 'pink/7',  name: 'Pink Stamp 7' },
  { id: 'icon.pink.8',  kind: 'icon', rarity: 'common', ref: 'pink/8',  name: 'Pink Stamp 8' },
  { id: 'icon.pink.10', kind: 'icon', rarity: 'common', ref: 'pink/10', name: 'Pink Stamp 10' },
  { id: 'icon.pink.11', kind: 'icon', rarity: 'common', ref: 'pink/11', name: 'Pink Stamp 11' },
  { id: 'icon.pink.12', kind: 'icon', rarity: 'common', ref: 'pink/12', name: 'Pink Stamp 12' },
  { id: 'icon.pink.13',    kind: 'icon', rarity: 'common', ref: 'pink/13',    name: 'Pink Stamp 13' },
  { id: 'icon.pink.bunny', kind: 'icon', rarity: 'common', ref: 'pink/bunny', name: 'Bunny Stamp' },

  // blue/* — cute
  { id: 'icon.blue.1', kind: 'icon', rarity: 'cute', ref: 'blue/1', name: 'Blue Stamp 1' },
  { id: 'icon.blue.2', kind: 'icon', rarity: 'cute', ref: 'blue/2', name: 'Blue Stamp 2' },

  // metal/* — rare
  { id: 'icon.metal.14', kind: 'icon', rarity: 'rare', ref: 'metal/14', name: 'Metal Stamp 14' },
  { id: 'icon.metal.15', kind: 'icon', rarity: 'rare', ref: 'metal/15', name: 'Metal Stamp 15' },
  { id: 'icon.metal.16', kind: 'icon', rarity: 'rare', ref: 'metal/16', name: 'Metal Stamp 16' },

  // pixle/* — split (9, 18, 21, 22 cute; 23, 24, 27 rare; 26 holo).
  // 17 sparkle, 19 water, 20 book stay as defaults in unlockRules.js.
  { id: 'icon.pixle.9',  kind: 'icon', rarity: 'cute', ref: 'pixle/9',  name: 'Pixel Stamp 9'  },
  { id: 'icon.pixle.18', kind: 'icon', rarity: 'cute', ref: 'pixle/18', name: 'Pixel Stamp 18' },
  { id: 'icon.pixle.21', kind: 'icon', rarity: 'cute', ref: 'pixle/21', name: 'Pixel Stamp 21' },
  { id: 'icon.pixle.22', kind: 'icon', rarity: 'cute', ref: 'pixle/22', name: 'Pixel Stamp 22' },
  { id: 'icon.pixle.23', kind: 'icon', rarity: 'rare', ref: 'pixle/23', name: 'Pixel Stamp 23' },
  { id: 'icon.pixle.24', kind: 'icon', rarity: 'rare', ref: 'pixle/24', name: 'Pixel Stamp 24' },
  { id: 'icon.pixle.27', kind: 'icon', rarity: 'rare', ref: 'pixle/27', name: 'Pixel Stamp 27' },
  { id: 'icon.pixle.26', kind: 'icon', rarity: 'holo', ref: 'pixle/26', name: 'Crown Stamp'    },

  // ── Punch-card templates (src/assets/punch_cards/) ──
  // WindowsPink.png is the free default; everything else goes to the pool.
  { id: 'tpl.windowsGreen',  kind: 'pass-template', rarity: 'common', ref: 'WindowsGreen.png',  name: 'Window · Mint' },
  { id: 'tpl.windowsPurple', kind: 'pass-template', rarity: 'cute',   ref: 'WindowsPurple.png', name: 'Window · Lilac' },
  { id: 'tpl.plaidBlue',     kind: 'pass-template', rarity: 'cute',   ref: 'PlaidBlue.png',     name: 'Plaid · Blue' },
  { id: 'tpl.plaidGreen',    kind: 'pass-template', rarity: 'cute',   ref: 'PlaidGreen.png',    name: 'Plaid · Green' },
  { id: 'tpl.lacePink',      kind: 'pass-template', rarity: 'rare',   ref: 'LacePink.png',      name: 'Lace · Pink' },
  { id: 'tpl.laceRed',       kind: 'pass-template', rarity: 'rare',   ref: 'LaceRed.png',       name: 'Lace · Red' },
  { id: 'tpl.digiCam',       kind: 'pass-template', rarity: 'holo',   ref: 'DigiCam.png',       name: 'Digi-Cam Memory' },
  { id: 'tpl.filmCam',       kind: 'pass-template', rarity: 'holo',   ref: 'FilmCam.png',       name: 'Film-Cam Memory' },

  // ── ID skins (alt looks for the StudentIdCard) ──
  // `ref` is the skin id consumed by StudentIdCard's `psid-skin-{ref}` class.
  { id: 'idSkin.holo',     kind: 'idSkin', rarity: 'holo',   ref: 'holo',     name: 'Holographic ID' },
  { id: 'idSkin.wishz',    kind: 'idSkin', rarity: 'rare',   ref: 'wishz',    name: 'Frosty Blue ID' },
  { id: 'idSkin.inari',    kind: 'idSkin', rarity: 'rare',   ref: 'inari',    name: 'Maroon ID' },
  { id: 'idSkin.lottsa',   kind: 'idSkin', rarity: 'holo',   ref: 'lottsa',   name: 'Princess Pink ID' },
  { id: 'idSkin.babymoon', kind: 'idSkin', rarity: 'rare',   ref: 'babymoon', name: 'Beige ID' },

  // ── Eggs → bunny variants (kawaii pets) ──
  { id: 'egg.sea',      kind: 'egg', rarity: 'cute',   ref: 'seabun',      name: 'Sea Egg' },
  { id: 'egg.choco',    kind: 'egg', rarity: 'cute',   ref: 'chocobun',    name: 'Choco Egg' },
  { id: 'egg.stardust', kind: 'egg', rarity: 'holo',   ref: 'stardustbun', name: 'Dust Egg' },
  { id: 'egg.twilight', kind: 'egg', rarity: 'holo',   ref: 'twilightbun', name: 'Twilight Egg' },
  { id: 'egg.golden',   kind: 'egg', rarity: 'rare',   ref: 'goldbun',     name: 'Golden Egg' },
  { id: 'egg.midnight', kind: 'egg', rarity: 'secret', ref: 'midnightbun', name: 'Midnight Egg' },
  { id: 'egg.cinna',    kind: 'egg', rarity: 'secret', ref: 'cinnabun',    name: 'Cinna Egg' },
];

export const GACHA_KINDS = [...new Set(GACHA_ITEMS.map((i) => i.kind))];

/** Group items by rarity for fast pull-time lookup. */
export function itemsByRarity(items = GACHA_ITEMS) {
  const out = Object.fromEntries(RARITY_ORDER.map((r) => [r, []]));
  for (const it of items) out[it.rarity]?.push(it);
  return out;
}
