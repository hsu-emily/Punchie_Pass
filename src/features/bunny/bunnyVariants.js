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

export const BUNNY_VARIANTS = {
  bun: {
    id: 'bun',
    name: 'Bun',
    tagline: 'Loves pretty pink things.',
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
    palette: {
      cream: '#F5E1CA',
      body:  '#5A3220',
      bodyAlt: '#6B3D28',
      cheek: '#FFB7CE',
      dark:  '#241108',
    },
  },
};

export const BUNNY_KINDS = Object.keys(BUNNY_VARIANTS);

export function pickRandomBunny() {
  return BUNNY_KINDS[Math.floor(Math.random() * BUNNY_KINDS.length)];
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
