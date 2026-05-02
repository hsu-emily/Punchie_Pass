/**
 * Bunny — pixel-art bunny rendered as scalable SVG.
 *
 * @param {Object}  props
 * @param {'happy'|'sleepy'|'sad'|'celebrating'} props.mood
 * @param {'small'|'normal'|'large'}             props.size
 * @param {boolean} props.bobbing  — gentle idle bob (default true)
 * @param {boolean} props.popIn    — play pop-in entrance once on mount
 *
 * Place a corresponding `bunny.css` next to it (see styles/bunny.css)
 * or import the bundled stylesheet at app root.
 */
import React from 'react';

const SIZE_PX = { small: 48, normal: 80, large: 140 };

export default function Bunny({
  mood = 'happy',
  size = 'normal',
  bobbing = true,
  popIn = false,
}) {
  const px = SIZE_PX[size] ?? SIZE_PX.normal;

  const eyes =
    mood === 'sleepy'      ? 'sleepy' :
    mood === 'sad'         ? 'sad' :
    mood === 'celebrating' ? 'happy-wide' :
                             'happy';

  const animation = [
    bobbing && 'pp-bunny-bob 2.4s ease-in-out infinite',
    popIn   && 'pp-pop-in 0.5s var(--pp-ease-bounce) both',
  ].filter(Boolean).join(', ');

  return (
    <div
      className="pp-bunny"
      style={{
        width: px,
        height: px * (65 / 60),
        animation: animation || undefined,
      }}
    >
      <svg
        viewBox="0 0 60 65"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        width="100%"
        height="100%"
      >
        {/* Ears */}
        <rect x="13" y="2"  width="8"  height="22" fill="#FFFFFF" stroke="#F9A8D4" strokeWidth="1.5"/>
        <rect x="39" y="2"  width="8"  height="22" fill="#FFFFFF" stroke="#F9A8D4" strokeWidth="1.5"/>
        <rect x="15" y="6"  width="4"  height="14" fill="#FBCFE8"/>
        <rect x="41" y="6"  width="4"  height="14" fill="#FBCFE8"/>
        {/* Body / Head */}
        <rect x="10" y="38" width="40" height="22" fill="#FFFFFF" stroke="#F9A8D4" strokeWidth="1.5"/>
        <rect x="8"  y="20" width="44" height="26" fill="#FFFFFF" stroke="#F9A8D4" strokeWidth="1.5"/>
        {/* Cheeks */}
        <rect x="14" y="32" width="6"  height="3"  fill="#F9A8D4"/>
        <rect x="40" y="32" width="6"  height="3"  fill="#F9A8D4"/>
        {/* Eyes */}
        {eyes === 'happy' && <>
          <rect x="20" y="27" width="4" height="4" fill="#2A1E22"/>
          <rect x="36" y="27" width="4" height="4" fill="#2A1E22"/>
          <rect x="21" y="27" width="2" height="2" fill="#FFFFFF"/>
          <rect x="37" y="27" width="2" height="2" fill="#FFFFFF"/>
        </>}
        {eyes === 'happy-wide' && <>
          <rect x="19" y="26" width="6" height="6" fill="#2A1E22"/>
          <rect x="35" y="26" width="6" height="6" fill="#2A1E22"/>
          <rect x="20" y="27" width="2" height="2" fill="#FFFFFF"/>
          <rect x="36" y="27" width="2" height="2" fill="#FFFFFF"/>
        </>}
        {eyes === 'sleepy' && <>
          <rect x="19" y="29" width="6" height="2" fill="#2A1E22"/>
          <rect x="35" y="29" width="6" height="2" fill="#2A1E22"/>
        </>}
        {eyes === 'sad' && <>
          <rect x="20" y="28" width="4" height="3" fill="#2A1E22"/>
          <rect x="36" y="28" width="4" height="3" fill="#2A1E22"/>
        </>}
        {/* Mouth */}
        <rect x="28" y="36" width="4" height="2" fill="#EC4899"/>
        <rect x="29" y="38" width="2" height="1" fill="#EC4899"/>
        {/* Tail + feet */}
        <rect x="48" y="42" width="4" height="4" fill="#FBCFE8"/>
        <rect x="14" y="58" width="8" height="3" fill="#FBCFE8"/>
        <rect x="38" y="58" width="8" height="3" fill="#FBCFE8"/>
      </svg>
    </div>
  );
}
