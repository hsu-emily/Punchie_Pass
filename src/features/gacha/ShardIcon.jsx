import shardUrl from '@/assets/shard.webp';

export default function ShardIcon({ size = 14, style, className }) {
  return (
    <img
      src={shardUrl}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: '-2px',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
}
