// Most bunnies are palette swaps over the master `bun.svg` artwork — adding a
// new variant in that mode is a single entry below. A bunny can also opt out
// by setting `customSvg` to a different illustration (e.g. cinnabun has its
// own bespoke drawing); palette is still kept around so the egg shell tile
// can pull tint colors from the variant.

import bunUrl from '@/assets/bunnies/bun.svg';
import cinnabunUrl from '@/assets/bunnies/cinna bun.svg';
import midnightbunUrl from '@/assets/bunnies/midnight bun.svg';
import dustbunUrl from '@/assets/bunnies/bunny_composed 4.svg';

// Hex tokens that appear in bun.svg, by visual role.
const BASE = {
  cream: '#FFF8EB', // body fur
  body:  '#FF74A4', // primary detail color (most-used)
  bodyAlt: '#FF7CA8', // body shading variant
  cheek: '#FD8CB3', // cheeks / inner ear
  dark:  '#61283B', // eyes / outline
};

/**
 * Pet bonuses are declarative — the actual mechanics are wired by the
 * features that read them (xp, tokens, etc). Keeping the *what* here
 * means new pets are a single entry, not a code change everywhere.
 *
 *   xpMultiplier:    multiplier on XP earned per punch        (default 1)
 *   tokenChance:     extra chance (0..1) to earn a token per completed pass
 *   streakShield:    consecutive missed days the streak forgives (default 0)
 *
 * `source: 'progress'` pets unlock from progression conditions (legacy).
 * `source: 'egg'`      pets only unlock by hatching a gacha egg.
 */
export const BUNNY_VARIANTS = {
  bun: {
    id: 'bun',
    name: 'Bun',
    tagline: 'Loves pretty pink things.',
    rarity: 'common',
    source: 'progress',
    condition: () => true,
    hint: 'Default starter',
    bonus: { xpMultiplier: 1, tokenChance: 0, streakShield: 0 },
    bonusLabel: 'Steady & sweet',
    palette: {
      cream: '#FFF8EB',
      body:  '#FF74A4',
      bodyAlt: '#FF7CA8',
      cheek: '#FD8CB3',
      dark:  '#61283B',
    },
  },
  seabun: {
    id: 'seabun',
    name: 'Sea Bun',
    tagline: "Don't forget to stay hydrated.",
    rarity: 'cute',
    source: 'egg',
    hint: 'Hatch a Sea Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.02, tokenChance: 0, streakShield: 0 },
    bonusLabel: '+2% XP per punch',
    palette: {
      cream: '#E0EEFF',
      body:  '#5B8FD9',
      bodyAlt: '#6B9DE3',
      cheek: '#9CC0F0',
      dark:  '#1F2B5C',
    },
  },
  chocobun: {
    id: 'chocobun',
    name: 'Choco Bun',
    tagline: "Don't forget to reward yourself.",
    rarity: 'cute',
    source: 'egg',
    hint: 'Hatch a Choco Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1, tokenChance: 0.04, streakShield: 0 },
    bonusLabel: '+4% chance of bonus token on pass complete',
    palette: {
      cream: '#AE8275',
      body:  '#5E3F38',
      bodyAlt: '#5E3F38',
      cheek: '#5E3F38',
      dark:  '#5E3F38',
    },
  },
  stardustbun: {
    id: 'stardustbun',
    name: 'Dust Bun',
    tagline: 'Soft as ash, quiet as snow.',
    rarity: 'holo',
    source: 'egg',
    hint: 'Hatch a Dust Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.05, tokenChance: 0, streakShield: 1 },
    bonusLabel: '+5% XP · 1-day streak shield',
    customSvg: dustbunUrl,
    palette: {
      cream: '#ACACAA',
      body:  '#030303',
      bodyAlt: '#1D1D1D',
      cheek: '#7E012C',
      dark:  '#030303',
    },
  },
  twilightbun: {
    id: 'twilightbun',
    name: 'Twilight Bun',
    tagline: 'Stitched from the seams of the sky.',
    rarity: 'holo',
    source: 'egg',
    hint: 'Hatch a Twilight Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.04, tokenChance: 0.04, streakShield: 0 },
    bonusLabel: '+4% XP · +4% bonus token chance',
    palette: {
      cream: '#EDE7FF',
      body:  '#9B7CFF',
      bodyAlt: '#A88BFF',
      cheek: '#C5B7FF',
      dark:  '#2B1A56',
    },
  },
  goldbun: {
    id: 'goldbun',
    name: 'Golden Bun',
    tagline: 'A little luck in pocket form.',
    rarity: 'rare',
    source: 'egg',
    hint: 'Hatch a Golden Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.03, tokenChance: 0.03, streakShield: 0 },
    bonusLabel: '+3% XP · +3% bonus token chance',
    palette: {
      cream: '#FFF6D6',
      body:  '#E5B845',
      bodyAlt: '#F0C75A',
      cheek: '#FFD27A',
      dark:  '#5A3F08',
    },
  },
  midnightbun: {
    id: 'midnightbun',
    name: 'Midnight Bun',
    tagline: 'Whispers in the velvet dark.',
    rarity: 'secret',
    source: 'egg',
    hint: 'Hatch a Midnight Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.06, tokenChance: 0.05, streakShield: 1 },
    bonusLabel: '+6% XP · +5% token · 1-day streak shield',
    customSvg: midnightbunUrl,
    palette: {
      cream: '#1D1D1D',
      body:  '#D7D7D7',
      bodyAlt: '#D7D7D7',
      cheek: '#B8144D',
      dark:  '#1D1D1D',
    },
  },
  cinnabun: {
    id: 'cinnabun',
    name: 'Cinna Bun',
    tagline: 'Sweet, spicy, impossibly rare.',
    rarity: 'secret',
    source: 'egg',
    hint: 'Hatch a Cinna Egg (Secret pull from the Punchie Machine)',
    bonus: { xpMultiplier: 1.07, tokenChance: 0.07, streakShield: 1 },
    bonusLabel: '+7% XP · +7% token · 1-day streak shield',
    customSvg: cinnabunUrl,
    palette: {
      cream: '#FFF8EB',
      body:  '#7A1738',
      bodyAlt: '#7A1738',
      cheek: '#FFB7CE',
      dark:  '#2F171F',
    },
  },
};

export const BUNNY_KINDS = Object.keys(BUNNY_VARIANTS);

/** Every new user hatches the default `bun`. All other variants are unlocked
 *  through progression or earned via the gacha system. */
export function pickRandomBunny() {
  return 'bun';
}

/**
 * Bunnies a user has access to.
 *
 * Two unlock paths:
 *   1. Progression — variants with `source: 'progress'` whose condition matches.
 *   2. Hatched     — variants whose id is present in `hatched` (egg-source).
 */
export function evaluateUnlockedBunnies(progress = {}, hatched = []) {
  const hatchedSet = new Set(hatched);
  return BUNNY_KINDS.filter((k) => {
    const v = BUNNY_VARIANTS[k];
    if (!v) return false;
    // Hatched is the universal "permanent unlock" override — once a user
    // owns a variant (HatchScene starter pick or hatched egg), they keep it
    // even if the progression condition isn't independently met.
    if (hatchedSet.has(k)) return true;
    if (v.source === 'egg') return false;
    try { return v.condition?.(progress) ?? true; } catch { return false; }
  });
}

const sourceCache = new Map();

async function loadSourceUrl(url) {
  const cached = sourceCache.get(url);
  if (cached) return cached;
  const promise = fetch(url).then((r) => r.text()).then((text) => {
    sourceCache.set(url, text);
    return text;
  });
  sourceCache.set(url, promise);
  return promise;
}

function applyPalette(svgText, palette) {
  return svgText
    .replaceAll(BASE.cream, palette.cream)
    .replaceAll(BASE.bodyAlt, palette.bodyAlt)
    .replaceAll(BASE.body, palette.body)
    .replaceAll(BASE.cheek, palette.cheek)
    .replaceAll(BASE.dark, palette.dark);
}

// Namespace the figma-generated `_NUM_NUM` def IDs so multiple bunnies on the
// same page don't share scatter/clip defs (which would otherwise paint every
// bunny's fuzzy outline with whichever variant rendered first).
function namespaceDefIds(svgText, idSuffix) {
  return svgText.replace(/_(\d+)_(\d+)/g, (m) => `${m}_${idSuffix}`);
}

function stripRootSize(svgText) {
  return svgText
    .replace(/<svg([^>]*?)\swidth="\d+"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="\d+"/, '<svg$1');
}

export async function loadBunnySvg(kind) {
  const variant = BUNNY_VARIANTS[kind] || BUNNY_VARIANTS.bun;
  const sourceUrl = variant.customSvg || bunUrl;
  let text = await loadSourceUrl(sourceUrl);
  // Custom SVGs are pre-colored; only the palette-swap base needs recoloring.
  if (!variant.customSvg && variant.palette) {
    text = applyPalette(text, variant.palette);
  }
  text = namespaceDefIds(text, variant.id);
  text = stripRootSize(text);
  return text;
}
