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
  { everyN: 10, floor: 'rare' },
  { everyN: 50, floor: 'holo' },
];

export const PULL_COST = 1;
export const PULL_BUNDLES = [1, 10];

/**
 * GACHA_ITEMS — the live drop pool, keyed off the assets that exist on disk
 * today. Stickers / decorations / avatar-decorations are seeded with
 * `_artPending: true` so the renderer can show a placeholder until art lands.
 */
export const GACHA_ITEMS = [
  // ── Cursors (src/assets/cursors/{ref}/) ──
  { id: 'cursor.star', kind: 'cursor', rarity: 'cute', ref: 'star', name: 'Star Cursor' },
  { id: 'cursor.wand', kind: 'cursor', rarity: 'rare', ref: 'wand', name: 'Wand Cursor' },

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
  { id: 'icon.pink.13', kind: 'icon', rarity: 'common', ref: 'pink/13', name: 'Pink Stamp 13' },
  { id: 'icon.pink.28', kind: 'icon', rarity: 'common', ref: 'pink/28', name: 'Pink Stamp 28' },

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

  // ── Eggs → bunny variants (kawaii pets) ──
  { id: 'egg.stardust', kind: 'egg', rarity: 'holo',   ref: 'stardustbun', name: 'Stardust Egg' },
  { id: 'egg.golden',   kind: 'egg', rarity: 'secret', ref: 'goldbun',     name: 'Golden Egg' },

  // ── Stickers (art pending — renderer falls back to placeholder) ──
  { id: 'sticker.heart',       kind: 'sticker', rarity: 'common', ref: 'heart',       name: 'Lil Heart',       _artPending: true },
  { id: 'sticker.cloud',       kind: 'sticker', rarity: 'common', ref: 'cloud',       name: 'Tiny Cloud',      _artPending: true },
  { id: 'sticker.starBit',     kind: 'sticker', rarity: 'common', ref: 'star-bit',    name: 'Star Bit',        _artPending: true },
  { id: 'sticker.bow',         kind: 'sticker', rarity: 'cute',   ref: 'bow',         name: 'Pink Bow',        _artPending: true },
  { id: 'sticker.cake',        kind: 'sticker', rarity: 'cute',   ref: 'cake',        name: 'Slice of Cake',   _artPending: true },
  { id: 'sticker.bunnyChibi',  kind: 'sticker', rarity: 'rare',   ref: 'bunny-chibi', name: 'Chibi Bunny',     _artPending: true },
  { id: 'sticker.galaxyBow',   kind: 'sticker', rarity: 'holo',   ref: 'galaxy-bow',  name: 'Galaxy Bow ✦',    _artPending: true },
  { id: 'sticker.goldenBunny', kind: 'sticker', rarity: 'secret', ref: 'gold-bunny',  name: '★ Golden Bunny ★', _artPending: true },

  // ── Decorations (frame stickers for the Student ID — art pending) ──
  { id: 'decoration.lace',   kind: 'decoration', rarity: 'cute', ref: 'lace',   name: 'Lace Trim',   _artPending: true },
  { id: 'decoration.pearls', kind: 'decoration', rarity: 'rare', ref: 'pearls', name: 'Pearl String', _artPending: true },

  // ── Avatar decorations (worn on the avatar — art pending) ──
  { id: 'avatar.tinyCrown', kind: 'avatar-decoration', rarity: 'rare', ref: 'tinyCrown', name: 'Tiny Crown', _artPending: true },
  { id: 'avatar.haloRing',  kind: 'avatar-decoration', rarity: 'holo', ref: 'haloRing',  name: 'Halo Ring',  _artPending: true },
];

export const GACHA_KINDS = [...new Set(GACHA_ITEMS.map((i) => i.kind))];

/** Group items by rarity for fast pull-time lookup. */
export function itemsByRarity(items = GACHA_ITEMS) {
  const out = Object.fromEntries(RARITY_ORDER.map((r) => [r, []]));
  for (const it of items) out[it.rarity]?.push(it);
  return out;
}
