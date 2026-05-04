// Each subfolder of src/assets/cursors/ that contains cursor.png + click.png
// becomes a selectable cursor. sound.mp3 (optional) plays on click.
const imageModules = import.meta.glob('@/assets/cursors/*/*.webp', { eager: true });
const soundModules = import.meta.glob('@/assets/cursors/*/sound.mp3', { eager: true });

const CURSORS = {};
for (const path in imageModules) {
  const parts = path.split('/');
  const filename = parts.pop();
  const id = parts.pop();
  if (!CURSORS[id]) CURSORS[id] = { id, label: id, cursor: null, click: null, sound: null };
  if (filename === 'cursor.webp') CURSORS[id].cursor = imageModules[path].default;
  else if (filename === 'click.webp') CURSORS[id].click = imageModules[path].default;
}
for (const path in soundModules) {
  const parts = path.split('/');
  parts.pop();
  const id = parts.pop();
  if (!CURSORS[id]) CURSORS[id] = { id, label: id, cursor: null, click: null, sound: null };
  CURSORS[id].sound = soundModules[path].default;
}

export const CURSOR_LIST = Object.values(CURSORS).filter((c) => c.cursor && c.click);

export function playCursorSound(id) {
  const c = CURSORS[id];
  if (!c?.sound) return;
  try {
    const audio = new Audio(c.sound);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {}
}

export const DEFAULT_CURSOR_ID = 'pointer';
export const DEFAULT_PUNCH_CURSOR_ID = 'holepuncher';

export function getCursor(id) {
  return CURSORS[id] || CURSORS[DEFAULT_CURSOR_ID] || CURSOR_LIST[0] || null;
}
