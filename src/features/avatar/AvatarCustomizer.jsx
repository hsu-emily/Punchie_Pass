import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { BUNNY_KINDS, BUNNY_VARIANTS } from '@/features/bunny/bunnyVariants';
import HatchedBunny from '@/features/bunny/HatchedBunny';
import StudentIdCard from '@/features/studentId/StudentIdCard';
import '@/features/studentId/StudentIdPage.css';
import './AvatarCustomizer.css';

// Tile thumbnails for the option panel. Avatar layer composition itself lives
// in @/features/avatar/avatarLayers.js (used by AvatarPreview).
const clothesModules = import.meta.glob('@/assets/avatar/clothes/*.png', { eager: true });
const hairBackModules = import.meta.glob('@/assets/avatar/hair_back/**/*.png', { eager: true });
const hairFrontModules = import.meta.glob('@/assets/avatar/hair_front/**/*.png', { eager: true });
const eyebrowModules = import.meta.glob('@/assets/avatar/eyebrows/*.png', { eager: true });
const hatModules = import.meta.glob('@/assets/avatar/hat/*.png', { eager: true });
const noseModules = import.meta.glob('@/assets/avatar/nose/*.png', { eager: true });
const mouthModules = import.meta.glob('@/assets/avatar/mouth/*.png', { eager: true });
const accessoryModules = import.meta.glob('@/assets/avatar/accessories/*.png', { eager: true });

function buildMap(modules) {
  const map = {};
  for (const path in modules) {
    const filename = path.split('/').pop().replace(/\.png$/, '');
    map[filename] = modules[path].default;
  }
  return map;
}

const CLOTHES = buildMap(clothesModules);
const EYEBROW = buildMap(eyebrowModules);
const HAT = buildMap(hatModules);
const NOSE = buildMap(noseModules);
const MOUTH = buildMap(mouthModules);
const ACCESSORY = buildMap(accessoryModules);

const HAIR_BACK = {};
for (const path in hairBackModules) {
  const parts = path.split('/');
  const style = parts[parts.length - 2];
  const filename = parts[parts.length - 1].replace(/\.png$/, '');
  const color = filename.split(/[-_]/)[0];
  if (!HAIR_BACK[style]) HAIR_BACK[style] = {};
  HAIR_BACK[style][color] = hairBackModules[path].default;
}

const HAIR_FRONT = {};
for (const path in hairFrontModules) {
  const parts = path.split('/');
  const style = parts[parts.length - 2];
  const filename = parts[parts.length - 1].replace(/\.png$/, '');
  const color = filename.split(/[-_]/)[0];
  if (!HAIR_FRONT[style]) HAIR_FRONT[style] = {};
  HAIR_FRONT[style][color] = hairFrontModules[path].default;
}

const SKIN_TONES = ['fair', 'ivory', 'dark'];
const HAIR_COLORS = ['black', 'blonde', 'brown'];
const HAIR_BACK_STYLES = ['braids', 'pigtails', 'straight'];
const HAIR_FRONT_STYLES = ['default', 'bangs'];
const EYE_COLORS = ['blue', 'brown', 'pink'];
const CLOTHES_OPTIONS = ['bow', 'hoodie', 'sweater'];
const EYEBROW_OPTIONS = ['normal', 'downward'];
const NOSE_OPTIONS = ['nose', 'bandage'];
const MOUTH_OPTIONS = ['mouth', 'mouthp', 'mouthtooth'];
const HAT_OPTIONS = ['none', 'bunny_hat', 'headband', 'pink_hat'];
const ACCESSORY_OPTIONS = ['none', 'glasses'];

const BACKGROUND_PRESETS = [
  '#FBCFE8', '#BCD2F0', '#FFE9C7', '#C5EBD3',
  '#DCD3FF', '#FFD3BB', '#C7E5FF', '#FFC1D5',
];

const SKIN_SWATCH = { fair: '#F8DCC4', ivory: '#E8C5A4', dark: '#8B5A3C' };
const HAIR_SWATCH = { black: '#2C2418', blonde: '#E5C97B', brown: '#7B4F2A' };
const EYE_SWATCH = { blue: '#5BA3D0', brown: '#6B4423', pink: '#E8A4B8' };

const DEFAULT_AVATAR = {
  background: '#FBCFE8',
  skin: 'fair',
  hairColor: 'brown',
  hairBackStyle: 'straight',
  hairFrontStyle: 'default',
  eyeColor: 'brown',
  doubleEyelid: false,
  clothes: 'sweater',
  eyebrows: 'normal',
  nose: 'nose',
  mouth: 'mouth',
  hat: 'none',
  accessory: 'none',
  blush: false,
  name: '',
  tier: 'Regular Member',
};

const TIERS = ['Regular Member', 'Premium Guest'];

const ICON_STROKE = '#EC4899';
const ICONS = {
  background: (
    <svg viewBox="0 0 22 22" fill="none">
      <rect x="2" y="2" width="18" height="18" rx="2" stroke={ICON_STROKE} strokeWidth="2" />
      <rect x="5" y="5" width="3" height="3" fill={ICON_STROKE} />
      <rect x="11" y="5" width="3" height="3" fill={ICON_STROKE} />
      <rect x="14" y="11" width="3" height="3" fill={ICON_STROKE} />
      <rect x="5" y="14" width="3" height="3" fill={ICON_STROKE} />
    </svg>
  ),
  skin: (
    <svg viewBox="0 0 22 22" fill="none">
      <ellipse cx="11" cy="10" rx="6" ry="6.5" stroke={ICON_STROKE} strokeWidth="2" />
      <circle cx="8.5" cy="10" r="1" fill={ICON_STROKE} />
      <circle cx="13.5" cy="10" r="1" fill={ICON_STROKE} />
      <path d="M8 13 Q11 15 14 13" stroke={ICON_STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  hair: (
    <svg viewBox="0 0 22 22" fill="none">
      <path
        d="M3 11 Q3 4 11 4 Q19 4 19 11 L19 14 L17 12 L17 13 L15 11 L15 13 L13 11 L13 13 L11 11 L11 13 L9 11 L9 13 L7 11 L7 13 L5 11 L5 13 L3 11 Z"
        fill={ICON_STROKE}
      />
    </svg>
  ),
  eyes: (
    <svg viewBox="0 0 22 22" fill="none">
      <ellipse cx="7" cy="11" rx="3" ry="2.5" stroke={ICON_STROKE} strokeWidth="2" />
      <ellipse cx="15" cy="11" rx="3" ry="2.5" stroke={ICON_STROKE} strokeWidth="2" />
      <circle cx="7" cy="11" r="1.2" fill={ICON_STROKE} />
      <circle cx="15" cy="11" r="1.2" fill={ICON_STROKE} />
    </svg>
  ),
  eyebrows: (
    <svg viewBox="0 0 22 22" fill="none">
      <path d="M3 9 Q7 6 11 9" stroke={ICON_STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 9 Q15 6 19 9" stroke={ICON_STROKE} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  nose: (
    <svg viewBox="0 0 22 22" fill="none">
      <path d="M11 5 L11 13 Q11 15 13 15" stroke={ICON_STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  mouth: (
    <svg viewBox="0 0 22 22" fill="none">
      <path d="M5 10 Q11 16 17 10" stroke={ICON_STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9 11 Q11 13 13 11" fill={ICON_STROKE} />
    </svg>
  ),
  clothes: (
    <svg viewBox="0 0 22 22" fill="none">
      <path
        d="M4 7 L8 4 L11 6 L14 4 L18 7 L17 18 L5 18 Z"
        stroke={ICON_STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="11" r="0.8" fill={ICON_STROKE} />
    </svg>
  ),
  hat: (
    <svg viewBox="0 0 22 22" fill="none">
      <path
        d="M4 14 L5 8 Q5 4 11 4 Q17 4 17 8 L18 14 Z"
        stroke={ICON_STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="3" y="13" width="16" height="2.5" rx="1" fill={ICON_STROKE} />
    </svg>
  ),
  bunny: (
    <svg viewBox="0 0 22 22" fill="none">
      <ellipse cx="7" cy="6" rx="1.6" ry="3.5" stroke={ICON_STROKE} strokeWidth="2" />
      <ellipse cx="15" cy="6" rx="1.6" ry="3.5" stroke={ICON_STROKE} strokeWidth="2" />
      <circle cx="11" cy="13" r="5.5" stroke={ICON_STROKE} strokeWidth="2" />
      <circle cx="9" cy="13" r="0.9" fill={ICON_STROKE} />
      <circle cx="13" cy="13" r="0.9" fill={ICON_STROKE} />
    </svg>
  ),
  accessory: (
    <svg viewBox="0 0 22 22" fill="none">
      <path
        d="M11 4 L13 9 L18 9 L14 12 L16 17 L11 14 L6 17 L8 12 L4 9 L9 9 Z"
        stroke={ICON_STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  blush: (
    <svg viewBox="0 0 22 22" fill="none">
      <circle cx="7" cy="11" r="3" fill={ICON_STROKE} opacity="0.4" />
      <circle cx="15" cy="11" r="3" fill={ICON_STROKE} opacity="0.4" />
      <circle cx="7" cy="11" r="1.5" fill={ICON_STROKE} />
      <circle cx="15" cy="11" r="1.5" fill={ICON_STROKE} />
    </svg>
  ),
};

const BASE_TABS = [
  { id: 'background', label: 'Backdrop' },
  { id: 'skin', label: 'Skin' },
  { id: 'hair', label: 'Hair' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'eyebrows', label: 'Brows' },
  { id: 'nose', label: 'Nose' },
  { id: 'mouth', label: 'Mouth' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'hat', label: 'Hat' },
  { id: 'accessory', label: 'Accessory' },
  { id: 'blush', label: 'Blush' },
];
const BUNNY_TAB = { id: 'bunny', label: 'Bunny' };

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AvatarCustomizer({
  initial,
  onChange,
  onConfirm,
  onBack,
  bunnyKind: bunnyKindProp,
  onBunnyKindChange,
  unlockedBunnies,
  confirmLabel,
  title: pageTitle,
} = {}) {
  const [avatar, setAvatar] = useState({ ...DEFAULT_AVATAR, ...(initial || {}) });
  const [activeTab, setActiveTab] = useState('skin');
  const { profile } = useAuth?.() || { user: null, profile: null };
  const [internalBunnyKind, setInternalBunnyKind] = useState(
    bunnyKindProp ?? profile?.bunny?.kind ?? 'bun'
  );
  const bunnyKind = bunnyKindProp ?? internalBunnyKind;
  const setBunnyKind = (k) => {
    if (bunnyKindProp === undefined) setInternalBunnyKind(k);
    onBunnyKindChange?.(k);
  };
  const showBunnyTab = Array.isArray(unlockedBunnies);
  const TABS = showBunnyTab ? [...BASE_TABS, BUNNY_TAB] : BASE_TABS;

  const update = (patch) => setAvatar((a) => ({ ...a, ...patch }));

  useEffect(() => {
    const onboardedName = profile?.bunny?.name;
    if (onboardedName && !avatar.name) {
      setAvatar((a) => (a.name ? a : { ...a, name: onboardedName }));
    }
  }, [profile?.bunny?.name, avatar.name]);

  useEffect(() => {
    onChange?.(avatar);
  }, [avatar, onChange]);

  const shuffle = () => {
    update({
      background: pickRandom(BACKGROUND_PRESETS),
      skin: pickRandom(SKIN_TONES),
      hairColor: pickRandom(HAIR_COLORS),
      hairBackStyle: pickRandom(HAIR_BACK_STYLES),
      hairFrontStyle: pickRandom(HAIR_FRONT_STYLES),
      eyeColor: pickRandom(EYE_COLORS),
      doubleEyelid: Math.random() < 0.5,
      clothes: pickRandom(CLOTHES_OPTIONS),
      eyebrows: pickRandom(EYEBROW_OPTIONS),
      nose: pickRandom(NOSE_OPTIONS),
      mouth: pickRandom(MOUTH_OPTIONS),
      hat: pickRandom(HAT_OPTIONS),
      accessory: pickRandom(ACCESSORY_OPTIONS),
      blush: Math.random() < 0.5,
    });
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);
  const cycleTier = () => {
    const i = TIERS.indexOf(avatar.tier);
    update({ tier: TIERS[(i + 1) % TIERS.length] || TIERS[0] });
  };

  return (
    <div className="av">
      <div className="av-page">
        {/* Header */}
        <div className="av-header">
          <span className="av-eyebrow">★ PUNCHIE WORLD MEMBER ★</span>
          <h1 className="av-title">
            <span className="deco">✦</span>
            {pageTitle || 'MAKE YOUR CUTIE'}
            <span className="deco">✦</span>
          </h1>
        </div>

        {/* Category bar */}
        <div className="av-cat-bar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`av-cat ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="av-cat-ico">{ICONS[t.id]}</span>
              <span className="av-cat-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Builder */}
        <div className="av-builder">
          <div className="av-id-slot">
            <StudentIdCard
              bunnyName={avatar.name}
              bunnyKind={bunnyKind}
              avatar={avatar}
              tier={avatar.tier || 'Regular Member'}
              level={1}
              title="Sprout"
              progressPct={0}
              totalPunches={0}
              streakDays={0}
              onNameChange={(name) => update({ name })}
            />
            <button
              type="button"
              className="av-tier-toggle"
              onClick={cycleTier}
              title="Cycle membership tier"
            >
              ✦ Tier: {avatar.tier || 'Regular Member'}
            </button>
          </div>

          {/* Option panel */}
          <div className="av-panel">
            <div className="av-panel-header">
              <span className="av-panel-header-ico">{ICONS[activeTab]}</span>
              <span className="av-panel-title">{activeTabMeta?.label}</span>
              <span className="av-option-count">
                {countOptions(activeTab)} OPTIONS
              </span>
            </div>
            <ActivePanel
              activeTab={activeTab}
              avatar={avatar}
              update={update}
              bunnyKind={bunnyKind}
              setBunnyKind={setBunnyKind}
              unlockedBunnies={unlockedBunnies}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="av-actions">
          {onBack ? (
            <button className="av-btn av-btn-ghost" onClick={onBack}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button className="av-shuffle" onClick={shuffle}>
            ✦ SHUFFLE ALL ✦
          </button>
          {onConfirm ? (
            <button className="av-btn av-btn-primary" onClick={() => onConfirm(avatar, bunnyKind)}>
              {confirmLabel || 'Looks cute → Next'}
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

function countOptions(tab) {
  switch (tab) {
    case 'background': return BACKGROUND_PRESETS.length;
    case 'skin': return SKIN_TONES.length;
    case 'hair': return HAIR_COLORS.length + HAIR_BACK_STYLES.length + HAIR_FRONT_STYLES.length;
    case 'eyes': return EYE_COLORS.length + 2;
    case 'eyebrows': return EYEBROW_OPTIONS.length;
    case 'nose': return NOSE_OPTIONS.length;
    case 'mouth': return MOUTH_OPTIONS.length;
    case 'clothes': return CLOTHES_OPTIONS.length;
    case 'hat': return HAT_OPTIONS.length;
    case 'accessory': return ACCESSORY_OPTIONS.length;
    case 'blush': return 2;
    case 'bunny': return BUNNY_KINDS.length;
    default: return 0;
  }
}

function ActivePanel({ activeTab, avatar, update, bunnyKind, setBunnyKind, unlockedBunnies }) {
  switch (activeTab) {
    case 'background':
      return (
        <Grid>
          {BACKGROUND_PRESETS.map((c) => (
            <SwatchTile
              key={c}
              color={c}
              active={avatar.background === c}
              onClick={() => update({ background: c })}
            />
          ))}
        </Grid>
      );
    case 'skin':
      return (
        <Grid>
          {SKIN_TONES.map((s) => (
            <SwatchTile
              key={s}
              color={SKIN_SWATCH[s]}
              active={avatar.skin === s}
              onClick={() => update({ skin: s })}
            />
          ))}
        </Grid>
      );
    case 'hair':
      return (
        <>
          <div className="av-sub-label">Color</div>
          <Grid>
            {HAIR_COLORS.map((c) => (
              <SwatchTile
                key={c}
                color={HAIR_SWATCH[c]}
                active={avatar.hairColor === c}
                onClick={() => update({ hairColor: c })}
              />
            ))}
          </Grid>
          <div className="av-sub-label">Back style</div>
          <Grid>
            {HAIR_BACK_STYLES.map((s) => {
              const src = HAIR_BACK[s]?.[avatar.hairColor];
              return (
                <ImageTile
                  key={s}
                  src={src}
                  active={avatar.hairBackStyle === s}
                  onClick={() => update({ hairBackStyle: s })}
                />
              );
            })}
          </Grid>
          <div className="av-sub-label">Front style</div>
          <Grid>
            {HAIR_FRONT_STYLES.map((s) => {
              const current = avatar.hairFrontStyle ?? 'default';
              const src = HAIR_FRONT[s]?.[avatar.hairColor];
              return (
                <ImageTile
                  key={s}
                  src={src}
                  active={current === s}
                  onClick={() => update({ hairFrontStyle: s })}
                />
              );
            })}
          </Grid>
        </>
      );
    case 'eyes':
      return (
        <>
          <div className="av-sub-label">Color</div>
          <Grid>
            {EYE_COLORS.map((c) => (
              <SwatchTile
                key={c}
                color={EYE_SWATCH[c]}
                active={avatar.eyeColor === c}
                onClick={() => update({ eyeColor: c })}
              />
            ))}
          </Grid>
          <div className="av-sub-label">Double eyelid</div>
          <Grid>
            <ToggleTile
              label="Off"
              active={!avatar.doubleEyelid}
              onClick={() => update({ doubleEyelid: false })}
            />
            <ToggleTile
              label="On"
              active={avatar.doubleEyelid}
              onClick={() => update({ doubleEyelid: true })}
            />
          </Grid>
        </>
      );
    case 'eyebrows':
      return (
        <Grid>
          {EYEBROW_OPTIONS.map((opt) => (
            <ImageTile
              key={opt}
              src={EYEBROW[opt]}
              active={avatar.eyebrows === opt}
              onClick={() => update({ eyebrows: opt })}
            />
          ))}
        </Grid>
      );
    case 'nose':
      return (
        <Grid>
          {NOSE_OPTIONS.map((opt) => (
            <ImageTile
              key={opt}
              src={NOSE[opt]}
              active={avatar.nose === opt}
              onClick={() => update({ nose: opt })}
            />
          ))}
        </Grid>
      );
    case 'mouth':
      return (
        <Grid>
          {MOUTH_OPTIONS.map((opt) => (
            <ImageTile
              key={opt}
              src={MOUTH[opt]}
              active={avatar.mouth === opt}
              onClick={() => update({ mouth: opt })}
            />
          ))}
        </Grid>
      );
    case 'clothes':
      return (
        <Grid>
          {CLOTHES_OPTIONS.map((opt) => (
            <ImageTile
              key={opt}
              src={CLOTHES[opt]}
              active={avatar.clothes === opt}
              onClick={() => update({ clothes: opt })}
            />
          ))}
        </Grid>
      );
    case 'hat':
      return (
        <Grid>
          {HAT_OPTIONS.map((opt) => (
            opt === 'none' ? (
              <NoneTile
                key={opt}
                active={avatar.hat === 'none'}
                onClick={() => update({ hat: 'none' })}
              />
            ) : (
              <ImageTile
                key={opt}
                src={HAT[opt]}
                active={avatar.hat === opt}
                onClick={() => update({ hat: opt })}
              />
            )
          ))}
        </Grid>
      );
    case 'accessory':
      return (
        <Grid>
          {ACCESSORY_OPTIONS.map((opt) => (
            opt === 'none' ? (
              <NoneTile
                key={opt}
                active={avatar.accessory === 'none'}
                onClick={() => update({ accessory: 'none' })}
              />
            ) : (
              <ImageTile
                key={opt}
                src={ACCESSORY[opt]}
                active={avatar.accessory === opt}
                onClick={() => update({ accessory: opt })}
              />
            )
          ))}
        </Grid>
      );
    case 'blush':
      return (
        <Grid>
          <ToggleTile
            label="Off"
            active={!avatar.blush}
            onClick={() => update({ blush: false })}
          />
          <ToggleTile
            label="On"
            active={avatar.blush}
            onClick={() => update({ blush: true })}
          />
        </Grid>
      );
    case 'bunny': {
      const unlocked = new Set(unlockedBunnies || BUNNY_KINDS);
      return (
        <Grid>
          {BUNNY_KINDS.map((k) => {
            const variant = BUNNY_VARIANTS[k];
            const isUnlocked = unlocked.has(k);
            return (
              <button
                key={k}
                className={`av-option bunny-tile ${bunnyKind === k ? 'active' : ''} ${isUnlocked ? '' : 'locked'}`}
                onClick={() => isUnlocked && setBunnyKind?.(k)}
                disabled={!isUnlocked}
                title={isUnlocked ? variant.name : `${variant.name} — ${variant.hint}`}
              >
                <HatchedBunny kind={k} size={64} />
                <span className="av-toggle-label">
                  {isUnlocked ? variant.name : '🔒'}
                </span>
              </button>
            );
          })}
        </Grid>
      );
    }
    default:
      return null;
  }
}

function Grid({ children }) {
  return <div className="av-option-grid">{children}</div>;
}

function SwatchTile({ color, active, onClick }) {
  return (
    <button
      className={`av-option swatch ${active ? 'active' : ''}`}
      style={{ '--swatch-color': color }}
      onClick={onClick}
      title={color}
    />
  );
}

function ImageTile({ src, active, onClick }) {
  return (
    <button
      className={`av-option ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {src ? <img src={src} alt="" /> : null}
    </button>
  );
}

function NoneTile({ active, onClick }) {
  return (
    <button
      className={`av-option ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="av-none">NONE</span>
    </button>
  );
}

function ToggleTile({ label, active, onClick }) {
  return (
    <button
      className={`av-option ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="av-toggle-label">{label.toUpperCase()}</span>
    </button>
  );
}

