/**
 * PlaceholderQR — decorative QR-shaped SVG. Replace with a real QR
 * (e.g. via `qrcode` npm) before shipping; the real share URL should
 * point to your share-route (e.g. /id/<userId>).
 */
import React from 'react';

export default function PlaceholderQR({ size = 120 }) {
  return (
    <svg viewBox="0 0 33 33" width={size} height={size} shapeRendering="crispEdges">
      {Array.from({ length: 11 }).flatMap((_, r) =>
        Array.from({ length: 11 }).map((_, c) => {
          const seed = (r * 7 + c * 3 + r * c) % 7;
          if (seed < 3) {
            return <rect key={`${r}-${c}`} x={c * 3} y={r * 3} width="3" height="3" fill="#2A1E22" />;
          }
          return null;
        })
      )}
      <rect x="0"  y="0"  width="9" height="9" fill="none" stroke="#2A1E22" strokeWidth="1.5"/>
      <rect x="3"  y="3"  width="3" height="3" fill="#2A1E22"/>
      <rect x="24" y="0"  width="9" height="9" fill="none" stroke="#2A1E22" strokeWidth="1.5"/>
      <rect x="27" y="3"  width="3" height="3" fill="#2A1E22"/>
      <rect x="0"  y="24" width="9" height="9" fill="none" stroke="#2A1E22" strokeWidth="1.5"/>
      <rect x="3"  y="27" width="3" height="3" fill="#2A1E22"/>
    </svg>
  );
}
