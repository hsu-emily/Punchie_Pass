// Single-source bunny: bun.svg is the master illustration. Each variant is
// just a palette swap over the same artwork. Adding a new variant = adding a
// palette here.

import bunUrl from '@/assets/bunnies/bun.svg';

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
    bonus: { xpMultiplier: 1.05, tokenChance: 0, streakShield: 0 },
    bonusLabel: '+5% XP per punch',
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
    bonus: { xpMultiplier: 1, tokenChance: 0.12, streakShield: 0 },
    bonusLabel: '+12% chance of bonus token on pass complete',
    palette: {
      cream: '#AE8275',
      body:  '#9A6F62',
      bodyAlt: '#A57A6D',
      cheek: '#FFB7CE',
      dark:  '#5E3F38',
    },
  },
  stardustbun: {
    id: 'stardustbun',
    name: 'Stardust Bun',
    tagline: 'Stitched from the seams of the sky.',
    rarity: 'holo',
    source: 'egg',
    hint: 'Hatch a Stardust Egg from the Punchie Machine',
    bonus: { xpMultiplier: 1.12, tokenChance: 0, streakShield: 1 },
    bonusLabel: '+12% XP · 1-day streak shield',
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
    tagline: 'Rumored to bring tokens like rain.',
    rarity: 'secret',
    source: 'egg',
    hint: 'Hatch a Golden Egg (Secret pull from the Punchie Machine)',
    bonus: { xpMultiplier: 1.08, tokenChance: 0.25, streakShield: 0 },
    bonusLabel: '+8% XP · +25% bonus token chance',
    palette: {
      cream: '#FFF6D6',
      body:  '#E5B845',
      bodyAlt: '#F0C75A',
      cheek: '#FFD27A',
      dark:  '#5A3F08',
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

let cachedSource = null;
let inflight = null;

async function loadSource() {
  if (cachedSource) return cachedSource;
  if (inflight) return inflight;
  inflight = fetch(bunUrl).then((r) => r.text()).then((text) => {
    cachedSource = text;
    inflight = null;
    return text;
  });
  return inflight;
}

function applyPalette(svgText, palette) {
  return svgText
    .replaceAll(BASE.cream, palette.cream)
    .replaceAll(BASE.bodyAlt, palette.bodyAlt)
    .replaceAll(BASE.body, palette.body)
    .replaceAll(BASE.cheek, palette.cheek)
    .replaceAll(BASE.dark, palette.dark)
    // Strip the fixed root width/height so the SVG scales to its container.
    .replace(/<svg([^>]*?)\swidth="\d+"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="\d+"/, '<svg$1');
}

export async function loadBunnySvg(kind) {
  const variant = BUNNY_VARIANTS[kind] || BUNNY_VARIANTS.bun;
  const source = await loadSource();
  return applyPalette(source, variant.palette);
}
