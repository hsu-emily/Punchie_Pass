/**
 * TokenIcon — renders the Punchie token (coin.png) at any size.
 * Single source so swapping art is one file edit.
 */
import coinUrl from '@/assets/coin.webp';

export default function TokenIcon({ size = 16, style, className }) {
  return (
    <img
      src={coinUrl}
      alt="token"
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: '-0.18em',
        imageRendering: 'auto',
        ...style,
      }}
    />
  );
}
