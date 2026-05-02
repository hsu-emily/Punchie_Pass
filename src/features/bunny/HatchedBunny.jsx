import { useEffect, useState } from 'react';
import { loadBunnySvg } from './bunnyVariants';

export default function HatchedBunny({ kind, size = 220, className, style }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadBunnySvg(kind).then((text) => {
      if (!cancelled) setSvg(text);
    });
    return () => { cancelled = true; };
  }, [kind]);

  return (
    <div
      className={`pp-hatched-bunny ${className || ''}`}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
