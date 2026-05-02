# Gacha + Unlock Implementation Plan

A roadmap for finishing the Punchie Machine, grounded in the assets that
actually exist on disk today.

---

## 0. Asset inventory (what we have right now)

### `src/assets/cursors/` — usable today
Each folder = one cursor (`cursor.png`, `click.png`, optional `sound.mp3`).

| Folder | Status today | Suggested role |
| --- | --- | --- |
| `pointer` | default app cursor | **stays default** (free, never locked) |
| `holepuncher` | default punch cursor | **stays default** (free, never locked) |
| `star` | available | **gacha** — cute |
| `wand` | available | **gacha** — rare |

That's only two gacha-eligible cursors today. Adding more = drop a new
folder under `cursors/` with the three files; `cursors.js` picks them up
automatically. Cursor-pool grows free.

### `src/assets/icons/` — punch stamps, 27 PNGs already organized by tier
The folder taxonomy maps perfectly to rarity:

| Subfolder | Files | Rarity |
| --- | --- | --- |
| `pink/` | 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 28 (11) | common |
| `blue/` | 1, 2 (2) | cute |
| `metal/` | 14, 15, 16 (3) | rare |
| `pixle/` | 9, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27 (11) | cute / rare / holo (split by feel) |

Three of the pixle icons (17 sparkle, 19 water, 20 book) are already in
`unlockRules.js` as defaults — keep those free, move the rest into the
gacha pool.

### `src/assets/punch_cards/` — card templates, 9 PNGs ready
| File | Suggested rarity |
| --- | --- |
| `WindowsPink.png` | common (current default) |
| `WindowsGreen.png` | common |
| `WindowsPurple.png` | cute |
| `PlaidBlue.png` | cute |
| `PlaidGreen.png` | cute |
| `LacePink.png` | rare |
| `LaceRed.png` | rare |
| `DigiCam.png` | holo |
| `FilmCam.png` | holo |

A "template" is just `{ cardImage }` — could expand later to also lock the
icon set or card palette. Renderer already exists in `CreatePunchCard.jsx`.

### `src/assets/bunnies/bun.svg` — palette-swap engine
One SVG, infinite variants via the `palette` field in `bunnyVariants.js`.
Already shipping `bun`, `seabun`, `chocobun`, `stardustbun`, `goldbun` —
new pets cost ~5 hex codes each, no new art.

### `src/assets/borders/` — exists on disk but **deprecated**
10 PNGs. The user removed borders from the system. Don't reintroduce.
(Leave the files in case they get repurposed as decorations later.)

### Folders that don't exist yet (need art)
- `src/assets/stickers/` — the bulk of the gacha pool, by your own design.
- `src/assets/decorations/` — frame stickers for the Student ID.
- `src/assets/avatar_decorations/` — equippable avatar layers.
- `src/assets/eggs/` — the visual capsule a sticker hatches from. Right
  now eggs only have `name`/`rarity`; they should have art for the
  reveal animation.

---

## 1. Rewrite `gachaCatalog.js` to use real refs

Today the catalog seeds fictional refs (`heart`, `cloud`, `bow`, etc.) that
have no art behind them. Replace with the real-asset-backed entries below.

### Cursor pool
```js
{ id: 'cursor.star', kind: 'cursor', rarity: 'cute', ref: 'star', name: 'Star Cursor' }
{ id: 'cursor.wand', kind: 'cursor', rarity: 'rare', ref: 'wand', name: 'Wand Cursor' }
```
`ref` matches the folder name `cursors.js` reads.

### Icon pool (the workhorse — 24 items minus the 3 free defaults)
```js
// pink/* — common (8 items, excluding any kept as default)
{ id: 'icon.pink.3',  kind: 'icon', rarity: 'common', ref: '3',  name: 'Pink Stamp 3' }
// ... 4, 5, 6, 7, 8, 10, 11, 12, 13, 28

// blue/* — cute
{ id: 'icon.blue.1',  kind: 'icon', rarity: 'cute',   ref: '1',  name: 'Blue Stamp 1' }
{ id: 'icon.blue.2',  kind: 'icon', rarity: 'cute',   ref: '2',  name: 'Blue Stamp 2' }

// metal/* — rare
{ id: 'icon.metal.14', kind: 'icon', rarity: 'rare',  ref: '14', name: 'Metal Stamp 14' }
// ... 15, 16

// pixle/* — split (9, 18, 21, 22 cute; 23, 24, 27 rare; 26 holo) — your call
{ id: 'icon.pixle.26', kind: 'icon', rarity: 'holo',  ref: '26', name: 'Crown Stamp' }
```

Note: `ref` is the bare filename without `.png`. The icon resolver will
need a small lookup that searches all four subfolders by filename. The
existing icon glob in `PunchCard.jsx` already loads them; extract that
resolver into `iconRegistry.js` so both the punch-card renderer and the
gacha reveal can use it.

### Template pool (new gacha kind, populated)
```js
{ id: 'tpl.windowsGreen',  kind: 'pass-template', rarity: 'common', ref: 'WindowsGreen.png',  name: 'Window · Mint' }
{ id: 'tpl.windowsPurple', kind: 'pass-template', rarity: 'cute',   ref: 'WindowsPurple.png', name: 'Window · Lilac' }
{ id: 'tpl.plaidBlue',     kind: 'pass-template', rarity: 'cute',   ref: 'PlaidBlue.png',     name: 'Plaid · Blue' }
{ id: 'tpl.plaidGreen',    kind: 'pass-template', rarity: 'cute',   ref: 'PlaidGreen.png',    name: 'Plaid · Green' }
{ id: 'tpl.lacePink',      kind: 'pass-template', rarity: 'rare',   ref: 'LacePink.png',      name: 'Lace · Pink' }
{ id: 'tpl.laceRed',       kind: 'pass-template', rarity: 'rare',   ref: 'LaceRed.png',       name: 'Lace · Red' }
{ id: 'tpl.digiCam',       kind: 'pass-template', rarity: 'holo',   ref: 'DigiCam.png',       name: 'Digi-Cam Memory' }
{ id: 'tpl.filmCam',       kind: 'pass-template', rarity: 'holo',   ref: 'FilmCam.png',       name: 'Film-Cam Memory' }
```
`WindowsPink.png` stays as the free default; all 8 others go to the pool.

### Pet eggs (already correct — keep as-is)
```js
{ id: 'egg.stardust', kind: 'egg', rarity: 'holo',   ref: 'stardustbun', name: 'Stardust Egg' }
{ id: 'egg.golden',   kind: 'egg', rarity: 'secret', ref: 'goldbun',     name: 'Golden Egg' }
```

### Art-pending kinds (stub now, fill in when art lands)
```js
// Stickers — bulk of the pool. Suggested file plan:
//   src/assets/stickers/{ref}.png   (square 256×256 PNG with transparency)
// Seed catalog with art-pending refs so the pull system is live; renderer
// shows a `?` tile until the file is added.
{ id: 'sticker.tba.heart', kind: 'sticker', rarity: 'common', ref: 'heart', name: 'Lil Heart', _art: 'pending' }
// ... etc.

// Decorations (Student ID frame stickers). Plan: src/assets/decorations/{ref}.png
// Avatar decorations. Plan: src/assets/avatar_decorations/{ref}.png
```

Add a `_art: 'pending'` flag and have the gacha reveal renderer fall back
to a generic "?" tile (with the rarity glow). Pulls still work; users see
the name and rarity, and once art ships nothing else has to change.

---

## 2. What changes outside the catalog

### a. Default-icon list shrinks
[unlockRules.js](src/features/unlocks/unlockRules.js): keep three free
icons (water `19`, book `20`, sparkle `17`) and remove `icon.crown` (`26`)
— that's now `icon.pixle.26` in the gacha as a holo drop.

### b. Default cursors stay; new ones move to gacha
Keep `cursor.holePunch` (it's the default punch interaction). Move
`cursor.star`, `cursor.heart`, `cursor.crown` *out* of `unlockRules.js` —
but only after their corresponding asset folders exist. **Right now we
only have `star` and `wand`** for non-default cursors, so:

- `cursor.star`: move to gacha (cute), drop from `unlockRules.js`.
- `cursor.heart`, `cursor.crown`: leave in `unlockRules.js` for now (no
  art) and **either** ship the art folders **or** delete the rules. I'd
  vote delete — they're aspirational unlocks pointing at nothing.

### c. Build an `iconRegistry.js`
The icon glob in `PunchCard.jsx` and a new gacha-icon-renderer should
read from one place. Sketch:

```js
// src/features/icons/iconRegistry.js
const all = import.meta.glob('@/assets/icons/*/*.png', { eager: true });
const ICONS = {}; // by filename without .png
for (const path in all) {
  const name = path.split('/').pop().replace('.png', '');
  ICONS[name] = all[path].default;
}
export function getIconUrl(ref) { return ICONS[ref] || null; }
export const ALL_ICON_REFS = Object.keys(ICONS);
```

### d. Build a `templateRegistry.js`
Same pattern for `punch_cards/`. `CreatePunchCard.jsx` already imports
similarly — just consolidate into one shared module so the gacha reveal
shows a real preview.

### e. Equipped-template gating
When the user has gacha templates, the `CreatePunchCard` template picker
should:
1. Always show the free default (`WindowsPink.png`).
2. Show owned templates from `useGacha().inventoryList` filtered by
   `kind === 'pass-template'`.
3. Show locked templates as greyscale tiles with a "Pull from Punchie
   Machine" tooltip.

### f. Equipped-cursor + equipped-icon
Profile additions:
```
users/{uid}.equipped = {
  cursor: 'pointer',           // cursor folder name
  punchCursor: 'holepuncher',  // override holepuncher with gacha cursors
  iconSet: ['19', '20', '17']  // user's currently-active stamp choices
}
```
Existing code already reads cursor settings from the profile — just plug
this in.

---

## 3. Bonuses (pets actually do something)

Unchanged from the previous plan:

| Bonus | File to wire it | Effect |
| --- | --- | --- |
| `xpMultiplier` | [useUserLevel.js](src/features/progress/useUserLevel.js) | scale punches contribution by `BUNNY_VARIANTS[active].bonus.xpMultiplier` |
| `tokenChance`  | [useGacha.js](src/features/gacha/useGacha.js) | track `users/{uid}.bonusTokens`; on each completed pass roll `tokenChance` and `increment(bonusTokens, 1)` if it hits |
| `streakShield` | [useStreak.js](src/features/habits/useStreak.js) | allow up to N missed-day gaps before breaking the streak |

`tokensAvailable` becomes `completedPasses + bonusTokens − pullsUsed`.

---

## 4. Punchie Machine UI (kawaii pass)

The `/gacha` page is a plain scaffold. Replace markup, keep the hook
contract. Animation outline:

1. **Idle** — pixel SVG of the machine, crank still. Token pill above it.
2. **Pull click** — `pulling=true`; crank wiggles 1.2s.
3. **Capsule down chute** — capsule shape, shell colored
   `RARITY_META[item.awardedRarity].accent`. CSS keyframes only.
4. **Crack open** — capsule splits, contents scale in with confetti
   (reuse `pp-confetti-burst` already in `HatchScene` CSS).
5. **Reveal** — same `gacha-reveal-card` data, wrapped in `motion.div`.
6. **10× pulls** — stagger reveals 250ms.

The reveal renderer has to know how to draw each kind:
- `cursor`: show `cursor.png` thumbnail from `cursors/{ref}/cursor.png`.
- `icon`: show `getIconUrl(ref)` thumbnail.
- `pass-template`: show a tiny `<img>` of `punch_cards/{ref}`.
- `egg`: show egg art (or `?` until art lands) and CTA "Hatch in Pets".
- `sticker` / `decoration` / `avatar-decoration`: until art lands, show
  a placeholder tile with the name + rarity.

---

## 5. Sequencing — what to build next

Each step is independently shippable; nothing here blocks anything.

1. **Build the registries** (`iconRegistry.js`, `templateRegistry.js`).
   No UI change. Foundational.
2. **Wire pet bonuses** (xpMultiplier, tokenChance, streakShield).
   Tiny diffs, makes pets matter today.
3. **Rewrite `gachaCatalog.js`** with the real cursor / icon / template
   refs from §1. Ship the migration of `cursor.star` /
   `icon.pixle.26` out of `unlockRules.js` at the same time.
4. **Add equipped-cursor + equipped-icon-set + equipped-template
   pickers**. Now pulls have somewhere to *land* in the rest of the app.
5. **Replace `/gacha` UI** with the kawaii machine animation (§4).
6. **Commission sticker art** + add `src/assets/stickers/` + flip
   sticker entries from `_art: 'pending'` to live.
7. **Decorations + avatar-decorations** rendering — last, art-heaviest.

After step 3 the gacha is *real*: every pull either gives a usable cursor,
a usable icon, a usable template, or an egg. Stickers/decorations land
later as content, not infrastructure.

---

## 6. Pity / weights (already tunable)

- Weights: 60/28/9/2.5/0.5 (common/cute/rare/holo/secret).
- Pity: rare floor every 10, holo floor every 50.
- 10× pulls share the pity counter.

With the real catalog in §1, pull math at 10×:
- ~6 common icons (mostly pink stamps)
- ~3 cute (blue icons or cute templates)
- ~1 rare (metal icon, lace template, or wand cursor)
- pity ensures rare+ at the 10th roll.

If that feels light: bump `cute` from 28 → 35, drop `common` to 53. Or
add a "10× sweetener" that forces the last roll to ≥ cute (one-line
special case in `gachaService.pull` at `i === count - 1`).

---

## 7. Open design questions

- **Duplicate stamp icons**: pulling a stamp you already own should
  probably auto-convert to a token-shard (e.g. 5 dupes = 1 token). Worth
  doing? Reduces pity feel of late-game pulls.
- **Template duplicates**: similar — but templates are only 8 items, so
  duplicates come fast. Same shard-conversion idea applies.
- **Cursor sounds**: each cursor has an optional `sound.mp3`. Should the
  gacha reveal play it on hover? Tiny detail, big charm.
- **Egg variants**: right now stardust egg → stardust bun is 1:1. Do you
  want a generic "Mystery Egg" that hatches into a random pet, or is the
  named-egg → named-bun pairing better for collection feel? (Current is
  the right call for a kawaii collection app, IMO.)

---

## 8. Bugs caught and fixed in earlier passes (kept for reference)

- `pickRandomBunny` could roll egg-only pets for new users → restricted
  to `source: 'progress'` starters.
- Onboarding starter wasn't added to `pets.hatched` → fixed.
- `evaluateUnlockedBunnies` now treats `hatched` as a permanent override.
- Pity counter UI now shows "next rare+ guaranteed in N".
- Egg pulls show a "Hatch in Your Pets ▸" CTA on the reveal screen.
- Removed the placeholder Collection grid from the Student ID page —
  card + actions are centered, no fake unlocks.
