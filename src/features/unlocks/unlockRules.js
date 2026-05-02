/**
 * unlockRules — declarative table of every reward and the condition that
 * unlocks it. Evaluated against an aggregated `progress` summary.
 *
 * Where to put this in your app:
 *   • Read on the client to show progress bars (e.g. "3 / 10 punches"
 *     under a locked border in BorderPicker).
 *   • Run on the server via a Cloud Function that triggers on every
 *     `users/{uid}/punches/{punchId}` write, so unlocks are tamper-proof
 *     and ride a single source of truth.
 *
 * Each rule:
 *   id          — stable, used as the document id under unlockedRewards
 *   kind        — 'border' | 'cursor' | 'icon' | 'pass-template'
 *   ref         — asset slug; the client maps slug → CDN URL
 *   condition   — pure (progress) => boolean
 *   hint        — short string shown on locked tiles
 */

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

  // === Borders ===
  { id: 'border.dotted', kind: 'border', ref: '1',
    condition: () => true, hint: 'Default' },
  { id: 'border.lacy',   kind: 'border', ref: '3',
    condition: () => true, hint: 'Default' },
  { id: 'border.hearts', kind: 'border', ref: '5',
    condition: () => true, hint: 'Default' },
  { id: 'border.floral', kind: 'border', ref: '7',
    condition: (p) => p.completedPasses >= 1,
    hint: 'Complete first pass' },
  { id: 'border.pearl',  kind: 'border', ref: '8',
    condition: (p) => p.completedPasses >= 3,
    hint: 'Complete 3 passes' },
  { id: 'border.royal',  kind: 'border', ref: '10',
    condition: (p) => p.longestStreak >= 14,
    hint: '14-day streak' },

  // === Punch icons (visual variety on the card) ===
  { id: 'icon.water',     kind: 'icon', ref: '19', condition: () => true, hint: 'Default' },
  { id: 'icon.book',      kind: 'icon', ref: '20', condition: () => true, hint: 'Default' },
  { id: 'icon.sparkle',   kind: 'icon', ref: '17', condition: () => true, hint: 'Default' },
  { id: 'icon.crown',     kind: 'icon', ref: '26',
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

/** Just the unlocked refs grouped by kind: { border:[...], cursor:[...], icon:[...] } */
export function unlockedByKind(progress) {
  const out = { border: [], cursor: [], icon: [], 'pass-template': [] };
  for (const r of evaluateUnlocks(progress)) out[r.kind]?.push(r.ref);
  return out;
}
