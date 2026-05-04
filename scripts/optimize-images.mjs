// One-shot image optimizer: walks src/assets/ and converts PNGs (and large
// SVGs that contain embedded raster) to WebP at display-appropriate sizes.
// Originals are deleted after a successful WebP write.
//
// Run with: node scripts/optimize-images.mjs
//
// Tweak the per-folder size targets in `rules` below if you need different
// resolutions later.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname, 'src/assets');

// Per-path size policy. First matching prefix wins.
const rules = [
  { match: 'avatar/',      maxDim: 512  },
  { match: 'punch_cards/', maxDim: 800  },
  { match: 'bunnies/',     maxDim: 1024 },
  { match: 'cursors/',     maxDim: 256  },
  { match: 'icons/',       maxDim: 256  },
  { match: '',             maxDim: 1024 }, // fallback
];

const QUALITY = 80;

function pickRule(relPath) {
  return rules.find((r) => relPath.startsWith(r.match));
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function convertOne(file) {
  const rel = path.relative(ROOT, file);
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.svg'].includes(ext)) return null;

  // Skip tiny SVGs — they're almost certainly real vector art worth keeping.
  if (ext === '.svg') {
    const stat = await fs.stat(file);
    if (stat.size < 200 * 1024) return null;
  }

  const rule = pickRule(rel);
  const out = file.replace(/\.(png|svg)$/i, '.webp');

  const beforeBytes = (await fs.stat(file)).size;

  let pipeline = sharp(file, { density: 300 }); // density helps SVG rasterize
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > rule.maxDim) {
    pipeline = pipeline.resize({ width: rule.maxDim, withoutEnlargement: true });
  } else if (meta.height && meta.height > rule.maxDim) {
    pipeline = pipeline.resize({ height: rule.maxDim, withoutEnlargement: true });
  }
  await pipeline.webp({ quality: QUALITY }).toFile(out);

  const afterBytes = (await fs.stat(out)).size;
  await fs.unlink(file);

  return { rel, beforeBytes, afterBytes, outRel: path.relative(ROOT, out) };
}

const results = [];
let totalBefore = 0;
let totalAfter = 0;
for await (const f of walk(ROOT)) {
  try {
    const r = await convertOne(f);
    if (r) {
      results.push(r);
      totalBefore += r.beforeBytes;
      totalAfter += r.afterBytes;
    }
  } catch (err) {
    console.error('FAIL', f, err.message);
  }
}

results.sort((a, b) => b.beforeBytes - a.beforeBytes);
const fmt = (n) => (n / 1024).toFixed(0) + 'KB';
for (const r of results.slice(0, 20)) {
  console.log(`${fmt(r.beforeBytes).padStart(8)} → ${fmt(r.afterBytes).padStart(8)}  ${r.outRel}`);
}
console.log('---');
console.log(`Converted ${results.length} files`);
console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
