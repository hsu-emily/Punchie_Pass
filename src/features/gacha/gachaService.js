/**
 * gachaService — pure rolling logic for the Punchie Machine.
 *
 * Pure functions only. State (tokens, inventory, pity counter) lives in
 * useGacha.js / Firestore. This file is what you call to *decide what
 * comes out of a capsule* given a starting state.
 *
 * Flow:
 *   const result = pull({ catalog, weights, pity, pityCounter, rng });
 *   // result.items is an array of catalog entries (length = pulls)
 *   // result.nextPityCounter must be persisted
 */

import {
  DEFAULT_WEIGHTS,
  GACHA_ITEMS,
  PITY_RULES,
  RARITY_ORDER,
  itemsByRarity,
} from './gachaCatalog';

/** Mulberry32 — deterministic seeded RNG, used for tests. */
export function seededRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Roll one rarity using normalized weights. */
function rollRarity(weights, rng) {
  const entries = RARITY_ORDER.map((r) => [r, weights[r] ?? 0]);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) return 'common';
  let n = rng() * total;
  for (const [rarity, w] of entries) {
    n -= w;
    if (n <= 0) return rarity;
  }
  return entries[entries.length - 1][0];
}

/** Pick a uniformly-random item of a given rarity. Falls back down rarity ladder. */
function pickItemAtRarity(rarity, byRarity, rng) {
  let idx = RARITY_ORDER.indexOf(rarity);
  while (idx >= 0) {
    const pool = byRarity[RARITY_ORDER[idx]] || [];
    if (pool.length) return pool[Math.floor(rng() * pool.length)];
    idx -= 1;
  }
  return null;
}

/** Find the highest pity floor that this pull index satisfies. */
function pityFloor(pityCounter, rules) {
  let floor = null;
  for (const rule of rules) {
    if (pityCounter > 0 && pityCounter % rule.everyN === 0) {
      if (!floor || RARITY_ORDER.indexOf(rule.floor) > RARITY_ORDER.indexOf(floor)) {
        floor = rule.floor;
      }
    }
  }
  return floor;
}

/** Apply the pity floor: if the rolled rarity is below floor, bump it up. */
function applyFloor(rolled, floor) {
  if (!floor) return rolled;
  return RARITY_ORDER.indexOf(rolled) >= RARITY_ORDER.indexOf(floor) ? rolled : floor;
}

/**
 * pull — perform `count` rolls.
 *
 * @param {object} opts
 * @param {Array}  [opts.catalog]        — defaults to GACHA_ITEMS
 * @param {object} [opts.weights]        — rarity → weight; defaults to DEFAULT_WEIGHTS
 * @param {Array}  [opts.pity]           — pity rule list; defaults to PITY_RULES
 * @param {number} [opts.pityCounter=0]  — pulls performed since last reset
 * @param {number} [opts.count=1]        — how many capsules to pop
 * @param {() => number} [opts.rng]      — defaults to Math.random
 * @returns {{ items: Array, nextPityCounter: number }}
 */
export function pull({
  catalog = GACHA_ITEMS,
  weights = DEFAULT_WEIGHTS,
  pity = PITY_RULES,
  pityCounter = 0,
  count = 1,
  rng = Math.random,
} = {}) {
  const byRarity = itemsByRarity(catalog);
  const items = [];
  let counter = pityCounter;

  for (let i = 0; i < count; i++) {
    counter += 1;
    const rolled = rollRarity(weights, rng);
    const floor = pityFloor(counter, pity);
    const finalRarity = applyFloor(rolled, floor);
    const item = pickItemAtRarity(finalRarity, byRarity, rng);
    if (item) items.push({ ...item, rolledRarity: rolled, awardedRarity: finalRarity });
    // Reset pity counter when a high-tier rule triggered, so each rule
    // ladder operates independently.
    for (const rule of pity) {
      if (counter > 0 && counter % rule.everyN === 0) {
        // No-op for now: we keep a single counter so the cadence stays
        // predictable. If we later split counters per rule, do it here.
      }
    }
  }

  return { items, nextPityCounter: counter };
}

/**
 * mergeIntoInventory — given an existing `inventory` map and an array of
 * pulled items, return the new inventory. Duplicates increment `count`.
 *
 * @param {Record<string, { id:string, kind:string, rarity:string, ref:string, count:number, firstPulledAt:string }>} inventory
 * @param {Array} pulled
 * @returns {object} new inventory (same shape)
 */
export function mergeIntoInventory(inventory, pulled, now = new Date().toISOString()) {
  const next = { ...inventory };
  for (const item of pulled) {
    const existing = next[item.id];
    if (existing) {
      next[item.id] = { ...existing, count: (existing.count || 1) + 1, lastPulledAt: now };
    } else {
      next[item.id] = {
        id: item.id,
        kind: item.kind,
        rarity: item.rarity,
        ref: item.ref,
        name: item.name,
        count: 1,
        firstPulledAt: now,
        lastPulledAt: now,
      };
    }
  }
  return next;
}
