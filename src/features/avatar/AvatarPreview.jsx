import { useMemo } from 'react';
import { buildAvatarLayers, DEFAULT_AVATAR } from './avatarLayers';

export default function AvatarPreview({
  avatar,
  size = 200,
  background,
  rounded = true,
  className = '',
  style,
}) {
  const a = avatar || DEFAULT_AVATAR;
  const layers = useMemo(() => buildAvatarLayers(a), [a]);
  const bg = background ?? a.background ?? '#FFE4EC';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        background: bg,
        borderRadius: rounded ? '1.5rem' : 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      {layers.map((layer, i) => (
        <img
          key={layer.key}
          src={layer.src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: i + 1,
          }}
        />
      ))}
    </div>
  );
}
