/**
 * HumanAvatar — procedurally-rendered pixel-art human "two-sides" avatar
 * for a bunny's owner. Colors and layers are derived from an `avatar`
 * config object so the avatar can be saved and restored from any store.
 *
 * @param {Object} props.avatar
 * @param {'light'|'medium'|'deep'} props.avatar.skin
 * @param {'short'|'long'|'bun'|'ponytail'} props.avatar.hair
 * @param {string} props.avatar.hairColor   — any hex
 * @param {'tee'|'hoodie'|'sundress'|'cardigan'} props.avatar.outfit
 * @param {'none'|'glasses'|'bow'|'beanie'}      props.avatar.accessory
 * @param {number} props.size — width in px (height auto = 1.3×)
 *
 * The rendered SVG has a soft drop shadow built in. To omit it, override
 * via the `style` prop or wrap and clip parent overflow.
 */
import React from 'react';

const SKIN = { light: '#FFE4D0', medium: '#E8B795', deep: '#9C6A4A' };
const OUTFIT = {
  tee:      '#F472B6',
  hoodie:   '#C5B8FF',
  sundress: '#FBCFE8',
  cardigan: '#F3D279',
};

export default function HumanAvatar({ avatar, size = 200, style }) {
  const skinHex   = SKIN[avatar.skin]    ?? SKIN.light;
  const outfitHex = OUTFIT[avatar.outfit] ?? OUTFIT.tee;
  const hairColor = avatar.hairColor || '#3B2A2A';
  const showAcc   = (k) => avatar.accessory === k;

  return (
    <svg
      viewBox="0 0 80 130"
      width={size}
      height={size * 1.3}
      shapeRendering="crispEdges"
      style={{ filter: 'drop-shadow(0 6px 8px rgba(220,60,130,0.18))', ...style }}
    >
      {/* Body / outfit */}
      <rect x="22" y="68" width="36" height="50" fill={outfitHex} stroke="#2A1E22" strokeWidth="1"/>
      {avatar.outfit === 'cardigan' && <>
        <rect x="22" y="68" width="6"  height="50" fill="#E8B428"/>
        <rect x="52" y="68" width="6"  height="50" fill="#E8B428"/>
      </>}
      {avatar.outfit === 'hoodie' && (
        <rect x="20" y="62" width="40" height="14" fill={outfitHex} stroke="#2A1E22" strokeWidth="1"/>
      )}
      {avatar.outfit === 'sundress' && (
        <polygon points="22,68 58,68 64,118 16,118" fill={outfitHex} stroke="#2A1E22" strokeWidth="1"/>
      )}

      {/* Arms / Neck / Head */}
      <rect x="14" y="70" width="10" height="30" fill={skinHex} stroke="#2A1E22" strokeWidth="1"/>
      <rect x="56" y="70" width="10" height="30" fill={skinHex} stroke="#2A1E22" strokeWidth="1"/>
      <rect x="34" y="60" width="12" height="10" fill={skinHex} stroke="#2A1E22" strokeWidth="1"/>
      <rect x="22" y="20" width="36" height="44" fill={skinHex} stroke="#2A1E22" strokeWidth="1"/>

      {/* Hair (back layer) */}
      {avatar.hair === 'long' && <rect x="20" y="22" width="40" height="40" fill={hairColor}/>}
      {avatar.hair === 'ponytail' && <rect x="58" y="28" width="6"  height="22" fill={hairColor}/>}
      {avatar.hair === 'long' && <rect x="24" y="26" width="32" height="34" fill={skinHex}/>}

      {/* Hair (front layer) */}
      {avatar.hair === 'short' && <>
        <rect x="20" y="18" width="40" height="14" fill={hairColor}/>
        <rect x="20" y="32" width="6"  height="14" fill={hairColor}/>
        <rect x="54" y="32" width="6"  height="14" fill={hairColor}/>
      </>}
      {avatar.hair === 'long' && <>
        <rect x="20" y="18" width="40" height="12" fill={hairColor}/>
        <rect x="18" y="22" width="6"  height="44" fill={hairColor}/>
        <rect x="56" y="22" width="6"  height="44" fill={hairColor}/>
      </>}
      {avatar.hair === 'bun' && <>
        <rect x="20" y="20" width="40" height="10" fill={hairColor}/>
        <rect x="32" y="10" width="16" height="12" fill={hairColor}/>
        <rect x="34" y="6"  width="12" height="6"  fill={hairColor}/>
      </>}
      {avatar.hair === 'ponytail' && <>
        <rect x="20" y="18" width="40" height="14" fill={hairColor}/>
        <rect x="20" y="32" width="6"  height="10" fill={hairColor}/>
      </>}

      {/* Face */}
      <rect x="28" y="36" width="4" height="4" fill="#2A1E22"/>
      <rect x="48" y="36" width="4" height="4" fill="#2A1E22"/>
      <rect x="29" y="36" width="1" height="1" fill="#FFFFFF"/>
      <rect x="49" y="36" width="1" height="1" fill="#FFFFFF"/>
      <rect x="26" y="46" width="4" height="2" fill="#F9A8D4"/>
      <rect x="50" y="46" width="4" height="2" fill="#F9A8D4"/>
      <rect x="36" y="50" width="8" height="2" fill="#EC4899"/>

      {/* Accessories */}
      {showAcc('glasses') && <>
        <rect x="26" y="34" width="10" height="8" fill="none" stroke="#2A1E22" strokeWidth="2"/>
        <rect x="44" y="34" width="10" height="8" fill="none" stroke="#2A1E22" strokeWidth="2"/>
        <rect x="36" y="37" width="8"  height="2" fill="#2A1E22"/>
      </>}
      {showAcc('bow') && <>
        <rect x="36" y="14" width="8" height="6" fill="#EC4899"/>
        <rect x="32" y="16" width="4" height="4" fill="#EC4899"/>
        <rect x="44" y="16" width="4" height="4" fill="#EC4899"/>
        <rect x="38" y="16" width="4" height="2" fill="#FFFFFF"/>
      </>}
      {showAcc('beanie') && <>
        <rect x="20" y="10" width="40" height="14" fill="#C5B8FF"/>
        <rect x="20" y="22" width="40" height="4"  fill="#9F8AE8"/>
        <rect x="38" y="4"  width="4"  height="6"  fill="#9F8AE8"/>
      </>}
    </svg>
  );
}

export const AVATAR_DEFAULTS = {
  skin: 'medium',
  hair: 'short',
  hairColor: '#3B2A2A',
  outfit: 'tee',
  accessory: 'none',
};
