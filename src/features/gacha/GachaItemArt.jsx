/**
 * GachaItemArt — renders the right artwork for a gacha item by kind.
 *
 * Kinds with real on-disk art today: cursor, icon, pass-template, egg.
 * Kinds where art is pending: sticker, decoration, avatar-decoration —
 * those fall back to a kawaii "?" placeholder tile so the pull system is
 * fully usable before the art ships.
 */
import HatchedBunny from '@/features/bunny/HatchedBunny';
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
      // Templates are wider than tall; fit in a rounded thumb instead of square.
      return src
        ? (
          <div style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            <img src={src} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )
        : <PlaceholderTile size={size} label="📜" />;
    }
    case 'egg': {
      // Eggs hatch into a bunny variant — preview the bunny inside an egg shape.
      return (
        <div style={{
          width: size, height: size * 1.18, position: 'relative',
          background: 'linear-gradient(180deg, #fff8eb 30%, #fbcfe8 100%)',
          borderRadius: '50% 50% 48% 48% / 60% 60% 40% 40%',
          boxShadow: 'inset 0 -6px 0 rgba(220,60,130,0.18), 0 4px 10px rgba(220,60,130,0.18)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{ opacity: 0.55, transform: 'translateY(8%)' }}>
            <HatchedBunny kind={item.ref} size={size * 0.92} />
          </div>
        </div>
      );
    }
    case 'sticker':
    case 'decoration':
    case 'avatar-decoration':
    default:
      return <PlaceholderTile size={size} label={kindEmoji(item.kind)} />;
  }
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
