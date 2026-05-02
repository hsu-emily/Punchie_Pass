/**
 * GachaItemArt — renders the right artwork for a gacha item by kind.
 *
 * Kinds with real on-disk art today: cursor, icon, pass-template, egg.
 * Kinds where art is pending: sticker, decoration, avatar-decoration —
 * those fall back to a kawaii "?" placeholder tile so the pull system is
 * fully usable before the art ships.
 */
import HatchedBunny from '@/features/bunny/HatchedBunny';
import { BUNNY_VARIANTS } from '@/features/bunny/bunnyVariants';
import { getCursor } from '@/assets/cursors/cursors';
import { getCardImageUrl, resolveIcon } from '@/features/punchpass/PunchCard';

export default function GachaItemArt({ item, size = 72 }) {
  if (!item) return null;
  const dim = { width: size, height: size };

  if (item._artPending) {
    return <PlaceholderTile size={size} label="?" />;
  }

  switch (item.kind) {
    case 'cursor': {
      const cur = getCursor(item.ref);
      const src = cur?.cursor || cur?.click;
      return src
        ? <img src={src} alt={item.name} style={{ ...dim, objectFit: 'contain' }} />
        : <PlaceholderTile size={size} label="✦" />;
    }
    case 'icon': {
      const src = resolveIcon(item.ref);
      return src
        ? <img src={src} alt={item.name} style={{ ...dim, objectFit: 'contain', imageRendering: 'pixelated' }} />
        : <PlaceholderTile size={size} label="🎫" />;
    }
    case 'pass-template': {
      const src = getCardImageUrl(item.ref);
      // Templates have their own aspect ratio; fit the whole card inside a
      // wider rounded thumb so the entire design reads at a glance.
      const w = Math.round(size * 1.25);
      const h = size;
      return src
        ? (
          <div
            style={{
              width: w,
              height: h,
              borderRadius: 10,
              overflow: 'hidden',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(220, 60, 130, 0.12)',
            }}
          >
            <img
              src={src}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )
        : <PlaceholderTile size={size} label="📜" />;
    }
    case 'egg': {
      // Tint the shell from the bunny variant's own palette so each egg
      // reads as "this kind of bunny" before you hatch it.
      const variant = BUNNY_VARIANTS[item.ref];
      const top = variant?.palette?.cream || '#fff8eb';
      const bottom = variant?.palette?.cheek || '#fbcfe8';
      const shadow = variant?.palette?.dark || '#61283B';
      return (
        <div style={{
          width: size, height: size * 1.18, position: 'relative',
          background: `linear-gradient(180deg, ${top} 30%, ${bottom} 100%)`,
          borderRadius: '50% 50% 48% 48% / 60% 60% 40% 40%',
          boxShadow: `inset 0 -6px 0 ${shadow}22, 0 4px 10px rgba(220,60,130,0.18)`,
          overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{ opacity: 0.55, transform: 'translateY(8%)' }}>
            <HatchedBunny kind={item.ref} size={size * 0.92} />
          </div>
        </div>
      );
    }
    case 'idSkin': {
      return <IdSkinTile size={size} skin={item.ref} />;
    }
    case 'sticker':
    case 'decoration':
    case 'avatar-decoration':
    default:
      return <PlaceholderTile size={size} label={kindEmoji(item.kind)} />;
  }
}

function IdSkinTile({ size, skin }) {
  const bg = skin === 'gold'
    ? 'linear-gradient(135deg, #FFF6D6 0%, #F0C75A 50%, #E5B845 100%)'
    : 'linear-gradient(135deg, #FBCFE8 0%, #C5B8FF 50%, #A5C2F0 100%)';
  return (
    <div
      style={{
        width: Math.round(size * 1.25),
        height: size,
        borderRadius: 10,
        background: bg,
        boxShadow: 'inset 0 0 0 1.5px rgba(220,60,130,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#5B1B36',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: Math.round(size / 6),
        letterSpacing: '0.05em',
      }}
    >
      ★ ID ★
    </div>
  );
}

function kindEmoji(kind) {
  switch (kind) {
    case 'sticker':           return '✿';
    case 'decoration':        return '❀';
    case 'avatar-decoration': return '♡';
    default:                  return '✦';
  }
}

function PlaceholderTile({ size, label }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #FFE4F0, #DCEAFE)',
        border: '1.5px dashed #F9A8D4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#EC4899',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: Math.round(size / 3),
      }}
    >
      {label}
    </div>
  );
}
