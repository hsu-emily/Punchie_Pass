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
  // === Cursors ===
  { id: 'cursor.holePunch', kind: 'cursor', ref: 'holePunch',
    condition: () => true,
    hint: 'Default' },
  { id: 'cursor.star', kind: 'cursor', ref: 'star',
    condition: (p) => p.completedPasses >= 1,
    hint: 'Complete your first pass' },
  { id: 'cursor.heart', kind: 'cursor', ref: 'heart',
    condition: (p) => p.currentStreak >= 7,
    hint: 'Reach a 7-day streak' },
  { id: 'cursor.crown', kind: 'cursor', ref: 'crown',
    condition: (p) => p.totalPunches >= 100,
    hint: '100 lifetime punches' },

  // === Punch icons (visual variety on the card) ===
  { id: 'icon.water',   kind: 'icon', ref: '19', condition: () => true, hint: 'Default' },
  { id: 'icon.book',    kind: 'icon', ref: '20', condition: () => true, hint: 'Default' },
  { id: 'icon.sparkle', kind: 'icon', ref: '17', condition: () => true, hint: 'Default' },
  { id: 'icon.crown',   kind: 'icon', ref: '26',
    condition: (p) => p.totalPunches >= 50, hint: '50 lifetime punches' },
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
