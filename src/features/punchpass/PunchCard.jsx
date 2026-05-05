import { forwardRef, memo, useMemo } from 'react';
import defaultPunchIcon from '@/assets/icons/punch.webp';
import { getCardLayout } from '@/features/punchpass/cardLayouts.config';
import PunchCardPreview from '@/features/punchpass/PunchCardPreview';

// Single source of truth for punch-card asset loading. Every render site
// (dashboard, create form, zoom modal, celebration, layout editor) goes
// through this component so the same config produces the same visual.

const cardModules = import.meta.glob('@/assets/punch_cards/*.webp', { eager: true });
const flatIconModules = import.meta.glob('@/assets/icons/*.webp', { eager: true });
const bucketIconModules = import.meta.glob('@/assets/icons/*/*.webp', { eager: true });

// Assets are .webp on disk, but user data and the gacha catalog reference
// them by their original `.png` filename (e.g. `'WindowsPink.png'`). Keys
// are stored in their `.png` form so existing data keeps resolving.
const toPngKey = (filename) => filename.replace(/\.webp$/i, '.png');

const CARD_MAP = {};
for (const path in cardModules) {
  const filename = path.split('/').pop();
  CARD_MAP[toPngKey(filename)] = cardModules[path].default;
}

const ICON_BY_FILENAME = {};
const ICON_BY_ID = {};
for (const path in flatIconModules) {
  const filename = path.split('/').pop();
  ICON_BY_FILENAME[toPngKey(filename)] = flatIconModules[path].default;
}
ICON_BY_ID['default/punch'] = defaultPunchIcon;
for (const path in bucketIconModules) {
  const parts = path.split('/');
  const filename = parts.pop();
  const bucket = parts.pop();
  const num = filename.replace(/\.webp$/i, '');
  ICON_BY_ID[`${bucket}/${num}`] = bucketIconModules[path].default;
}

export function getCardImageUrl(name) {
  if (!name) return Object.values(CARD_MAP)[0] || null;
  return CARD_MAP[name] || Object.values(CARD_MAP)[0] || null;
}

export function getCardImageName(habit) {
  return habit?.cardImage || habit?.punchCardImage || null;
}

function buildCustomIconMap(habit) {
  const m = {};
  (habit?.customIcons || []).forEach((c) => { m[c.id] = c.url; });
  return m;
}

export function resolveIcon(idOrName, customIconMap = {}) {
  if (!idOrName) return null;
  return (
    ICON_BY_ID[idOrName] ||
    customIconMap[idOrName] ||
    ICON_BY_FILENAME[idOrName] ||
    idOrName
  );
}

// Read icons from a habit/pass object, accepting both the new id-based
// fields and the legacy filename-based ones.
function resolveHabitIcons(habit) {
  const customMap = buildCustomIconMap(habit);
  const id1 = habit?.icon1Id || habit?.iconId || habit?.icon1;
  const id2 = habit?.icon2Id || habit?.icon2 || id1;
  return {
    icon1: resolveIcon(id1, customMap),
    icon2: resolveIcon(id2, customMap),
  };
}

const PunchCard = forwardRef(function PunchCard(
  {
    habit,
    // Optional overrides — used by the create form (live preview from form state)
    name,
    description,
    currentPunches,
    targetPunches,
    cursorId,
    showCursor = true,
    // When true, unfilled punch slots show as faint ghosts so layout is visible
    // while editing. Off by default — real use cases hide empty slots.
    editMode = false,
    // Container sizing — defaults match the design canvas in PunchCardPreview
    maxWidth = 600,
    className,
    style,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    ariaLabel,
  },
  ref,
) {
  const cardImageName = getCardImageName(habit);
  const cardImage = useMemo(() => getCardImageUrl(cardImageName), [cardImageName]);
  const layout = useMemo(() => getCardLayout(cardImageName), [cardImageName]);
  const { icon1, icon2 } = useMemo(() => resolveHabitIcons(habit), [habit]);

  const resolvedCurrent = currentPunches ?? habit?.currentPunches ?? 0;
  const resolvedTarget = targetPunches ?? habit?.targetPunches ?? 10;

  const punchGridLayout = useMemo(() => ({
    ...layout.punchGrid,
    filledPunches: resolvedCurrent,
    totalPunches: resolvedTarget,
  }), [layout, resolvedCurrent, resolvedTarget]);

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        aspectRatio: '1004 / 591',
        marginInline: 'auto',
        ...style,
      }}
    >
      {cardImage ? (
        <PunchCardPreview
          name={name ?? habit?.title ?? ''}
          description={description ?? habit?.description ?? ''}
          icon1={icon1}
          icon2={icon2}
          cardImage={cardImage}
          isDailyPunch={habit?.timeWindow === 'daily'}
          titlePlacement={layout.title}
          descriptionPlacement={layout.description}
          punchGridPlacement={punchGridLayout}
          currentPunches={resolvedCurrent}
          targetPunches={resolvedTarget}
          cursorId={cursorId ?? habit?.cursorId}
          showCursor={showCursor}
          editMode={editMode}
        />
      ) : (
        <div
          className="punch-card-fallback"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fce7f3, #ede9fe)',
            borderRadius: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {habit?.theme?.emoji || '⭐'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151' }}>
              {name ?? habit?.title ?? 'Punch Card'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
});

export default memo(PunchCard);
