import mascotUrl from '@/assets/logo.png';

/**
 * MascotBunny — the hand-drawn pink-bow bunny used as the brand mascot
 * on Home, auth pages, loading, 404, and empty states.
 */
export default function MascotBunny({ size = 140, className = '', style }) {
  return (
    <img
      src={mascotUrl}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: 'auto',
        objectFit: 'contain',
        userSelect: 'none',
        ...style,
      }}
      draggable={false}
    />
  );
}
