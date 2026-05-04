// Shared avatar layer composition.
// AvatarCustomizer.jsx still inlines this logic for its own preview;
// when convenient, refactor it to call buildAvatarLayers below so the
// rule of "what shows on the canvas" lives in one place.

const faceModules = import.meta.glob('@/assets/avatar/face/*.webp', { eager: true });
const earModules = import.meta.glob('@/assets/avatar/face/ears/*.webp', { eager: true });
const clothesModules = import.meta.glob('@/assets/avatar/clothes/*.webp', { eager: true });
const hairFrontModules = import.meta.glob('@/assets/avatar/hair_front/**/*.webp', { eager: true });
const hairBackModules = import.meta.glob('@/assets/avatar/hair_back/**/*.webp', { eager: true });
const eyeColorModules = import.meta.glob('@/assets/avatar/eyes/colors/*.webp', { eager: true });
const eyeOverlayModules = import.meta.glob('@/assets/avatar/eyes/eye_overlay.webp', { eager: true });
const doubleEyelidModules = import.meta.glob('@/assets/avatar/eyes/double_eyelid.webp', { eager: true });
const eyebrowModules = import.meta.glob('@/assets/avatar/eyebrows/*.webp', { eager: true });
const hatModules = import.meta.glob('@/assets/avatar/hat/*.webp', { eager: true });
const noseModules = import.meta.glob('@/assets/avatar/nose/*.webp', { eager: true });
const mouthModules = import.meta.glob('@/assets/avatar/mouth/*.webp', { eager: true });
const accessoryModules = import.meta.glob('@/assets/avatar/accessories/*.webp', { eager: true });
const blushModules = import.meta.glob('@/assets/avatar/blush/*.webp', { eager: true });

function buildMap(modules) {
  const map = {};
  for (const path in modules) {
    const filename = path.split('/').pop().replace(/\.webp$/, '');
    map[filename] = modules[path].default;
  }
  return map;
}

const FACE = buildMap(faceModules);
const EAR = buildMap(earModules);
const CLOTHES = buildMap(clothesModules);
const HAIR_FRONT = {};
for (const path in hairFrontModules) {
  const parts = path.split('/');
  const style = parts[parts.length - 2];
  const filename = parts[parts.length - 1].replace(/\.webp$/, '');
  const color = filename.split(/[-_]/)[0];
  if (!HAIR_FRONT[style]) HAIR_FRONT[style] = {};
  HAIR_FRONT[style][color] = hairFrontModules[path].default;
}
const EYE_COLOR = buildMap(eyeColorModules);
const EYE_OVERLAY = Object.values(eyeOverlayModules)[0]?.default;
const DOUBLE_EYELID = Object.values(doubleEyelidModules)[0]?.default;
const EYEBROW = buildMap(eyebrowModules);
const HAT = buildMap(hatModules);
const NOSE = buildMap(noseModules);
const MOUTH = buildMap(mouthModules);
const ACCESSORY = buildMap(accessoryModules);
const BLUSH = buildMap(blushModules);

const HAIR_BACK = {};
for (const path in hairBackModules) {
  const parts = path.split('/');
  const style = parts[parts.length - 2];
  const filename = parts[parts.length - 1].replace(/\.webp$/, '');
  const color = filename.split(/[-_]/)[0];
  if (!HAIR_BACK[style]) HAIR_BACK[style] = {};
  HAIR_BACK[style][color] = hairBackModules[path].default;
}

export const DEFAULT_AVATAR = {
  background: '#FFE4EC',
  skin: 'fair',
  hairColor: 'brown',
  hairBackStyle: 'straight',
  hairFrontStyle: 'default',
  eyeColor: 'brown',
  doubleEyelid: false,
  clothes: 'sweater',
  eyebrows: 'normal',
  nose: 'nose',
  mouth: 'mouth',
  hat: 'none',
  accessory: 'none',
  blush: false,
};

export function buildAvatarLayers(avatar = DEFAULT_AVATAR) {
  const items = [];
  items.push({ key: 'face', src: FACE[`${avatar.skin}_profile`] });
  // Straight hair drapes behind the body, so it goes under clothes.
  // Pigtails/braids sit on top of the shoulders, so they stay above clothes.
  const backStyle = HAIR_BACK[avatar.hairBackStyle];
  const backSrc = backStyle && backStyle[avatar.hairColor];
  if (backSrc && avatar.hairBackStyle === 'straight') {
    items.push({ key: 'hair_back', src: backSrc });
  }
  const frontStyle = avatar.hairFrontStyle ?? (avatar.hairFront === false ? 'none' : 'default');
  if (frontStyle && frontStyle !== 'none') {
    const frontSrc = HAIR_FRONT[frontStyle]?.[avatar.hairColor];
    if (frontSrc) items.push({ key: 'hair_front', src: frontSrc });
  }
  items.push({ key: 'clothes', src: CLOTHES[avatar.clothes] });
  if (backSrc && avatar.hairBackStyle !== 'straight') {
    items.push({ key: 'hair_back', src: backSrc });
  }
  items.push({ key: 'ear', src: EAR[`${avatar.skin}_ear`] });
  if (avatar.doubleEyelid && DOUBLE_EYELID) items.push({ key: 'double_eyelid', src: DOUBLE_EYELID });
  items.push({ key: 'eye_color', src: EYE_COLOR[avatar.eyeColor] });
  if (EYE_OVERLAY) items.push({ key: 'eye_overlay', src: EYE_OVERLAY });
  items.push({ key: 'eyebrows', src: EYEBROW[avatar.eyebrows] });
  if (avatar.hat !== 'none') items.push({ key: 'hat', src: HAT[avatar.hat] });
  items.push({ key: 'nose', src: NOSE[avatar.nose] });
  items.push({ key: 'mouth', src: MOUTH[avatar.mouth] });
  if (avatar.blush) items.push({ key: 'blush', src: BLUSH.blush });
  if (avatar.accessory !== 'none') items.push({ key: 'accessory', src: ACCESSORY[avatar.accessory] });
  return items.filter((l) => l.src);
}
