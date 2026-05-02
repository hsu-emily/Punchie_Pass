/**
 * gacha sounds — wired via Vite's `import.meta.glob`, so adding/replacing
 * audio is a file-system change with no code edit needed.
 *
 * Audio lives at:
 *   src/features/gacha/sounds/gatcha.mp3   (loops while the machine winds up)
 *   src/features/gacha/sounds/reveal.mp3   (one-shot when the capsule cracks)
 *
 * Browsers block autoplay until the user has interacted with the page —
 * since these only fire on a button click, that's already satisfied.
 */
const windupModules = import.meta.glob(
  './sounds/{gatcha,gacha}.{mp3,wav,ogg}',
  { eager: true, import: 'default', query: '?url' }
);
const popModules = import.meta.glob(
  './sounds/{reveal,pop}.{mp3,wav,ogg}',
  { eager: true, import: 'default', query: '?url' }
);

export const WINDUP_URL = Object.values(windupModules)[0] || null;
export const POP_URL = Object.values(popModules)[0] || null;

/**
 * Plays a one-shot sound. Returns the Audio element so callers can stop it
 * early. Safe to call when URL is null (no-op).
 */
export function playOneShot(url, { volume = 0.7 } = {}) {
  if (!url) return null;
  try {
    const a = new Audio(url);
    a.volume = volume;
    a.play().catch(() => {});
    return a;
  } catch {
    return null;
  }
}

/**
 * Starts a looping music bed. Returns a stop() function that fades out and
 * cleans up the audio element. Safe to call when URL is null.
 */
export function playLoop(url, { volume = 0.45, fadeOutMs = 250 } = {}) {
  if (!url) return () => {};
  let a;
  try {
    a = new Audio(url);
    a.loop = true;
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    return () => {};
  }
  return () => {
    if (!a) return;
    const startVol = a.volume;
    const steps = 8;
    const tick = fadeOutMs / steps;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (!a) return clearInterval(id);
      a.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        clearInterval(id);
        try { a.pause(); a.src = ''; } catch { /* noop */ }
      }
    }, tick);
  };
}
