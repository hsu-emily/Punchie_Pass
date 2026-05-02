/**
 * unlockRules — declarative table of progression-gated rewards.
 *
 * Borders were removed: the studentId card no longer uses border art.
 * The active reward kinds are:
 *   • cursor — app-wide CSS cursor variants
 *   • icon   — punch-stamp icons used on punch cards
 *
 * For *gacha* rewards (stickers, decorations, avatar decorations), see
 * @/features/gacha/gachaCatalog.js — that pool is rolled, not unlocked.
 *
 * Each rule:
 *   id          — stable, used as the document id under unlockedRewards
 *   kind        — 'cursor' | 'icon' | 'pass-template'
 *   ref         — asset slug; the client maps slug → CDN URL
 *   condition   — pure (progress) => boolean
 *   hint        — short string shown on locked tiles
 */

export const UNLOCK_KINDS = ['cursor', 'icon', 'pass-template'];

export const UNLOCK_RULES = [
  // === Cursors — defaults only. Other cursors are gacha drops. ===
  { id: 'cursor.pointer',    kind: 'cursor', ref: 'pointer',
    condition: () => true, hint: 'Default app cursor' },
  { id: 'cursor.holepuncher', kind: 'cursor', ref: 'holepuncher',
    condition: () => true, hint: 'Default punch cursor' },

  // === Punch icons — three free defaults; the rest are gacha drops. ===
  { id: 'icon.water',   kind: 'icon', ref: 'pixle/19', condition: () => true, hint: 'Default' },
  { id: 'icon.book',    kind: 'icon', ref: 'pixle/20', condition: () => true, hint: 'Default' },
  { id: 'icon.sparkle', kind: 'icon', ref: 'pixle/17', condition: () => true, hint: 'Default' },
];

/**
 * Compute which rules a user has unlocked.
 * @param {{ totalPunches:number, completedPasses:number, currentStreak:number, longestStreak:number }} progress
 * @returns {Array<typeof UNLOCK_RULES[0]>}
 */
export function evaluateUnlocks(progress) {
  return UNLOCK_RULES.filter((r) => {
    try { return r.condition(progress); } catch { return false; }
  });
}

/** Just the unlocked refs grouped by kind: { cursor:[...], icon:[...] } */
export function unlockedByKind(progress) {
  const out = Object.fromEntries(UNLOCK_KINDS.map((k) => [k, []]));
  for (const r of evaluateUnlocks(progress)) out[r.kind]?.push(r.ref);
  return out;
}
