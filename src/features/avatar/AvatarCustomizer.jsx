import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';

const faceModules = import.meta.glob('@/assets/avatar/face/*.png', { eager: true });
const earModules = import.meta.glob('@/assets/avatar/face/ears/*.png', { eager: true });
const clothesModules = import.meta.glob('@/assets/avatar/clothes/*.png', { eager: true });
const hairFrontModules = import.meta.glob('@/assets/avatar/hair_front/*.png', { eager: true });
const hairBackModules = import.meta.glob('@/assets/avatar/hair_back/**/*.png', { eager: true });
const eyeColorModules = import.meta.glob('@/assets/avatar/eyes/colors/*.png', { eager: true });
const eyeOverlayModules = import.meta.glob('@/assets/avatar/eyes/eye_overlay.png', { eager: true });
const doubleEyelidModules = import.meta.glob('@/assets/avatar/eyes/double_eyelid.png', { eager: true });
const eyebrowModules = import.meta.glob('@/assets/avatar/eyebrows/*.png', { eager: true });
const hatModules = import.meta.glob('@/assets/avatar/hat/*.png', { eager: true });
const noseModules = import.meta.glob('@/assets/avatar/nose/*.png', { eager: true });
const mouthModules = import.meta.glob('@/assets/avatar/mouth/*.png', { eager: true });
const accessoryModules = import.meta.glob('@/assets/avatar/accessories/*.png', { eager: true });
const blushModules = import.meta.glob('@/assets/avatar/blush/*.png', { eager: true });

function buildMap(modules) {
  const map = {};
  for (const path in modules) {
    const filename = path.split('/').pop().replace(/\.png$/, '');
    map[filename] = modules[path].default;
  }
  return map;
}

const FACE = buildMap(faceModules);
const EAR = buildMap(earModules);
const CLOTHES = buildMap(clothesModules);
const HAIR_FRONT = buildMap(hairFrontModules);
const EYE_COLOR = buildMap(eyeColorModules);
const EYE_OVERLAY = Object.values(eyeOverlayModules)[0]?.default;
const DOUBLE_EYELID = Object.values(doubleEyelidModules)[0]?.default;
const EYEBROW = buildMap(eyebrowModules);
const HAT = buildMap(hatModules);
const NOSE = buildMap(noseModules);
const MOUTH = buildMap(mouthModules);
const ACCESSORY = buildMap(accessoryModules);
const BLUSH = buildMap(blushModules);

const HAIR_BACK = {};
for (const path in hairBackModules) {
  const parts = path.split('/');
  const style = parts[parts.length - 2];
  const filename = parts[parts.length - 1].replace(/\.png$/, '');
  const color = filename.split(/[-_]/)[0];
  if (!HAIR_BACK[style]) HAIR_BACK[style] = {};
  HAIR_BACK[style][color] = hairBackModules[path].default;
}

const SKIN_TONES = ['fair', 'ivory', 'dark'];
const HAIR_COLORS = ['black', 'blonde', 'brown'];
const HAIR_BACK_STYLES = ['braids', 'pigtails', 'straight'];
const EYE_COLORS = ['blue', 'brown', 'pink'];
const CLOTHES_OPTIONS = ['bow', 'hoodie', 'sweater'];
const EYEBROW_OPTIONS = ['normal', 'downward'];
const NOSE_OPTIONS = ['nose', 'bandage'];
const MOUTH_OPTIONS = ['mouth', 'mouthp', 'mouthtooth'];
const HAT_OPTIONS = ['none', 'bunny_hat', 'headband', 'pink_hat'];
const ACCESSORY_OPTIONS = ['none', 'glasses'];

const BACKGROUND_PRESETS = [
  '#FFE4EC', '#FFF1B8', '#D4F4DD', '#CDE7FF', '#E5D4FF',
  '#FFD6BA', '#FFFFFF', '#FFCBE1', '#B8E0D2', '#FFF6E5',
];

const SKIN_SWATCH = { fair: '#F8DCC4', ivory: '#E8C5A4', dark: '#8B5A3C' };
const HAIR_SWATCH = { black: '#2C2418', blonde: '#E5C97B', brown: '#7B4F2A' };
const EYE_SWATCH = { blue: '#5BA3D0', brown: '#6B4423', pink: '#E8A4B8' };

const DEFAULT_AVATAR = {
  background: '#FFE4EC',
  skin: 'fair',
  hairColor: 'brown',
  hairBackStyle: 'straight',
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
  school: "Punchie's Habit Academy",
  yearLevel: 'lv1',
};

const TABS = [
  { id: 'background', label: 'Background', icon: '🎨' },
  { id: 'skin', label: 'Skin', icon: '🧑' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'eyes', label: 'Eyes', icon: '👀' },
  { id: 'eyebrows', label: 'Brows', icon: '🤨' },
  { id: 'nose', label: 'Nose', icon: '👃' },
  { id: 'mouth', label: 'Mouth', icon: '👄' },
  { id: 'clothes', label: 'Clothes', icon: '👕' },
  { id: 'hat', label: 'Hat', icon: '👒' },
  { id: 'accessory', label: 'Accessory', icon: '🕶️' },
  { id: 'blush', label: 'Blush', icon: '🌸' },
];

function formatBirthday(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export default function AvatarCustomizer({ initial, onChange, onConfirm } = {}) {
  const [avatar, setAvatar] = useState({ ...DEFAULT_AVATAR, ...(initial || {}) });
  const [activeTab, setActiveTab] = useState('skin');
  const { user, profile } = useAuth?.() || { user: null, profile: null };

  const update = (patch) => setAvatar((a) => ({ ...a, ...patch }));

  // Auto-fill name from onboarding (profile.bunny.name) if not already set.
  useEffect(() => {
    const onboardedName = profile?.bunny?.name;
    if (onboardedName && !avatar.name) {
      setAvatar((a) => (a.name ? a : { ...a, name: onboardedName }));
    }
  }, [profile?.bunny?.name, avatar.name]);

  useEffect(() => {
    onChange?.(avatar);
  }, [avatar, onChange]);

  const birthday = useMemo(() => {
    return formatBirthday(user?.metadata?.creationTime);
  }, [user]);

  const layers = useMemo(() => {
    const items = [];
    items.push({ key: 'face', src: FACE[`${avatar.skin}_profile`] });
    {
      const style = HAIR_BACK[avatar.hairBackStyle];
      if (style && style[avatar.hairColor]) items.push({ key: 'hair_back', src: style[avatar.hairColor] });
    }
    items.push({ key: 'hair_front', src: HAIR_FRONT[`${avatar.hairColor}_front`] });
    items.push({ key: 'clothes', src: CLOTHES[avatar.clothes] });
    items.push({ key: 'ear', src: EAR[`${avatar.skin}_ear`] });
    if (avatar.doubleEyelid && DOUBLE_EYELID) items.push({ key: 'double_eyelid', src: DOUBLE_EYELID });
    items.push({ key: 'eye_color', src: EYE_COLOR[avatar.eyeColor] });
    if (EYE_OVERLAY) items.push({ key: 'eye_overlay', src: EYE_OVERLAY });
    items.push({ key: 'eyebrows', src: EYEBROW[avatar.eyebrows] });
    if (avatar.hat !== 'none') items.push({ key: 'hat', src: HAT[avatar.hat] });
    items.push({ key: 'nose', src: NOSE[avatar.nose] });
    items.push({ key: 'mouth', src: MOUTH[avatar.mouth] });
    if (avatar.blush) items.push({ key: 'blush', src: BLUSH.blush });
    if (avatar.accessory !== 'none') items.push({ key: 'accessory', src: ACCESSORY[avatar.accessory] });
    return items.filter((l) => l.src);
  }, [avatar]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          <span style={styles.titleSparkle}>✦</span> Make Your Cutie <span style={styles.titleSparkle}>✦</span>
        </h1>

        {/* Category tab bar */}
        <div style={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tab,
                ...(activeTab === t.id ? styles.tabActive : null),
              }}
            >
              <span style={styles.tabIcon}>{t.icon}</span>
              <span style={styles.tabLabel}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Student ID Card preview */}
        <div style={{ ...styles.idCard, background: avatar.background }}>
          <div style={styles.idAvatar}>
            {layers.map((layer, i) => (
              <img
                key={layer.key}
                src={layer.src}
                alt={layer.key}
                style={{ ...styles.layerImg, zIndex: i + 1 }}
              />
            ))}
          </div>

          <div style={styles.idBody}>
            <div style={styles.idTitleRow}>
              <span style={styles.idTitle}>Student ID</span>
              <span style={styles.idStar}>✦</span>
            </div>
            <div style={styles.idDivider} />

            <div style={styles.idGrid}>
              <div style={styles.idField}>
                <div style={styles.idFieldLabel}>NAME</div>
                <input
                  value={avatar.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Your name"
                  style={styles.idInput}
                />
              </div>
              <div style={styles.idField}>
                <div style={styles.idFieldLabel}>BIRTHDAY</div>
                <div style={styles.idValue}>{birthday}</div>
              </div>
              <div style={styles.idField}>
                <div style={styles.idFieldLabel}>SCHOOL</div>
                <input
                  value={avatar.school}
                  onChange={(e) => update({ school: e.target.value })}
                  placeholder="School name"
                  style={styles.idInput}
                />
              </div>
              <div style={styles.idField}>
                <div style={styles.idFieldLabel}>YEAR LEVEL</div>
                <input
                  value={avatar.yearLevel}
                  onChange={(e) => update({ yearLevel: e.target.value })}
                  placeholder="Year level"
                  style={styles.idInput}
                />
              </div>
            </div>

            <div style={styles.barcode}>
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.barcodeBar,
                    width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active option panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            {TABS.find((t) => t.id === activeTab)?.icon}{' '}
            {TABS.find((t) => t.id === activeTab)?.label}
          </div>
          <div style={styles.panelBody}>
            <ActivePanel activeTab={activeTab} avatar={avatar} update={update} />
          </div>
        </div>

        {onConfirm && (
          <div style={styles.confirmRow}>
            <button style={styles.confirmBtn} onClick={() => onConfirm(avatar)}>
              Looks good ♡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivePanel({ activeTab, avatar, update }) {
  switch (activeTab) {
    case 'background':
      return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <ColorRow
            colors={BACKGROUND_PRESETS}
            value={avatar.background}
            onChange={(c) => update({ background: c })}
          />
          <label style={styles.customColorLabel}>
            <input
              type="color"
              value={avatar.background}
              onChange={(e) => update({ background: e.target.value })}
              style={styles.colorPicker}
            />
            <span>Custom</span>
          </label>
        </div>
      );
    case 'skin':
      return (
        <SwatchRow
          options={SKIN_TONES}
          value={avatar.skin}
          swatchMap={SKIN_SWATCH}
          onChange={(v) => update({ skin: v })}
        />
      );
    case 'hair':
      return (
        <div style={styles.subStack}>
          <SubLabel>Color</SubLabel>
          <SwatchRow
            options={HAIR_COLORS}
            value={avatar.hairColor}
            swatchMap={HAIR_SWATCH}
            onChange={(v) => update({ hairColor: v })}
          />
          <SubLabel>Back style</SubLabel>
          <PillRow
            options={HAIR_BACK_STYLES}
            value={avatar.hairBackStyle}
            onChange={(v) => update({ hairBackStyle: v })}
          />
        </div>
      );
    case 'eyes':
      return (
        <div style={styles.subStack}>
          <SubLabel>Color</SubLabel>
          <SwatchRow
            options={EYE_COLORS}
            value={avatar.eyeColor}
            swatchMap={EYE_SWATCH}
            onChange={(v) => update({ eyeColor: v })}
          />
          <SubLabel>Double eyelid</SubLabel>
          <PillRow
            options={['off', 'on']}
            value={avatar.doubleEyelid ? 'on' : 'off'}
            onChange={(v) => update({ doubleEyelid: v === 'on' })}
          />
        </div>
      );
    case 'eyebrows':
      return <PillRow options={EYEBROW_OPTIONS} value={avatar.eyebrows} onChange={(v) => update({ eyebrows: v })} />;
    case 'nose':
      return <PillRow options={NOSE_OPTIONS} value={avatar.nose} onChange={(v) => update({ nose: v })} />;
    case 'mouth':
      return <PillRow options={MOUTH_OPTIONS} value={avatar.mouth} onChange={(v) => update({ mouth: v })} />;
    case 'clothes':
      return <PillRow options={CLOTHES_OPTIONS} value={avatar.clothes} onChange={(v) => update({ clothes: v })} />;
    case 'hat':
      return <PillRow options={HAT_OPTIONS} value={avatar.hat} onChange={(v) => update({ hat: v })} />;
    case 'accessory':
      return (
        <PillRow
          options={ACCESSORY_OPTIONS}
          value={avatar.accessory}
          onChange={(v) => update({ accessory: v })}
        />
      );
    case 'blush':
      return (
        <PillRow
          options={['off', 'on']}
          value={avatar.blush ? 'on' : 'off'}
          onChange={(v) => update({ blush: v === 'on' })}
        />
      );
    default:
      return null;
  }
}

function SubLabel({ children }) {
  return <div style={styles.subLabel}>{children}</div>;
}

function PillRow({ options, value, onChange }) {
  return (
    <div style={styles.pillRow}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            ...styles.pill,
            ...(value === opt ? styles.pillActive : null),
          }}
        >
          {opt.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}

function SwatchRow({ options, value, swatchMap, onChange }) {
  return (
    <div style={styles.swatchRow}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          title={opt}
          style={{
            ...styles.swatch,
            background: swatchMap[opt],
            ...(value === opt ? styles.swatchActive : null),
          }}
        />
      ))}
    </div>
  );
}

function ColorRow({ colors, value, onChange }) {
  return (
    <div style={styles.swatchRow}>
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            ...styles.swatch,
            background: c,
            ...(value === c ? styles.swatchActive : null),
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 20% 0%, rgba(255, 209, 230, 0.7) 0%, transparent 60%), radial-gradient(circle at 80% 100%, rgba(255, 240, 200, 0.7) 0%, transparent 60%), #FFF7FB',
    padding: '2rem 1rem',
  },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#FF1493',
    textAlign: 'center',
    margin: '0 0 1.25rem',
    letterSpacing: '0.02em',
    textShadow: '2px 2px 0 #fff, 4px 4px 0 rgba(255,20,147,0.15)',
  },
  titleSparkle: {
    fontSize: '1.4rem',
    color: '#FFB6D5',
    margin: '0 0.5rem',
  },

  tabBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    padding: '0.6rem',
    background: 'white',
    borderRadius: '999px',
    boxShadow: '0 4px 14px rgba(255, 105, 180, 0.15)',
    marginBottom: '1.25rem',
    justifyContent: 'center',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.15rem',
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderRadius: '1rem',
    background: 'transparent',
    cursor: 'pointer',
    minWidth: '64px',
    transition: 'background 0.15s ease, transform 0.15s ease',
    color: '#a4476a',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #FFD1E8, #FFE4F1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(255, 105, 180, 0.25)',
  },
  tabIcon: { fontSize: '1.4rem', lineHeight: 1 },
  tabLabel: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em' },

  idCard: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '1.5rem',
    borderRadius: '1.25rem',
    padding: '1.5rem',
    boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
    marginBottom: '1.25rem',
    alignItems: 'center',
    transition: 'background 0.2s ease',
  },
  idAvatar: {
    position: 'relative',
    width: '200px',
    height: '260px',
    aspectRatio: '3 / 4',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  layerImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    pointerEvents: 'none',
  },
  idBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: 0,
  },
  idTitleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  idTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#222',
    letterSpacing: '0.01em',
  },
  idStar: { fontSize: '1.1rem', color: '#FF69B4' },
  idDivider: {
    height: '2px',
    background:
      'repeating-linear-gradient(to right, #333 0 6px, transparent 6px 10px)',
    margin: '0 0 0.4rem',
    width: '60%',
  },
  idGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem 1rem',
  },
  idField: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  idFieldLabel: {
    fontSize: '0.65rem',
    color: '#888',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  idValue: { fontSize: '0.95rem', fontWeight: 600, color: '#222' },
  idInput: {
    border: 'none',
    borderBottom: '1.5px dashed #f0c2d4',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#222',
    padding: '0.15rem 0',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
  },
  barcode: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1px',
    height: '28px',
    marginTop: '0.5rem',
  },
  barcodeBar: { display: 'inline-block', height: '100%', background: '#222' },

  panel: {
    background: 'white',
    borderRadius: '1.25rem',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    border: '1px solid #FFE4F1',
  },
  panelHeader: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#FF1493',
    marginBottom: '0.85rem',
    textTransform: 'capitalize',
  },
  panelBody: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' },

  subStack: { display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' },
  subLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#a4476a',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },

  pillRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  pill: {
    padding: '0.45rem 1rem',
    border: '2px solid #FFD1E8',
    borderRadius: '999px',
    background: 'white',
    color: '#a4476a',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'capitalize',
    transition: 'all 0.15s ease',
  },
  pillActive: {
    background: 'linear-gradient(135deg, #FF94C2, #FF1493)',
    color: 'white',
    borderColor: '#FF1493',
    boxShadow: '0 3px 8px rgba(255, 20, 147, 0.3)',
  },

  swatchRow: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem' },
  swatch: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #f0e0e8',
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  swatchActive: {
    transform: 'scale(1.15)',
    boxShadow: '0 0 0 2px white, 0 0 0 4px #FF1493',
  },

  customColorLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#a4476a',
    cursor: 'pointer',
  },
  colorPicker: {
    width: '36px',
    height: '36px',
    border: '2px solid #f0e0e8',
    borderRadius: '50%',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },

  confirmRow: { display: 'flex', justifyContent: 'center', marginTop: '1.25rem' },
  confirmBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #FF94C2, #FF1493)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(255, 20, 147, 0.35)',
  },
};
