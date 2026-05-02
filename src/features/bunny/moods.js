/**
 * moods — the bunny's mood derived from app state.
 * Use this to drive Bunny's `mood` prop everywhere it's rendered.
 */

/**
 * @param {Object} state
 * @param {number} state.streak           — current streak in days
 * @param {number} state.totalPunches     — lifetime punches
 * @param {number} [state.hoursSincePunch] — for "sleepy" gating
 * @returns {'celebrating'|'happy'|'sleepy'|'sad'}
 */
export function moodFromState({ streak = 0, totalPunches = 0, hoursSincePunch = 0 } = {}) {
  if (streak >= 7) return 'celebrating';
  if (totalPunches === 0) return 'sleepy';
  if (hoursSincePunch > 36 && streak === 0) return 'sad';
  return 'happy';
}

/** Friendly label for the mood (for the side card). */
export function moodLabel(mood) {
  switch (mood) {
    case 'celebrating': return 'on fire 🔥';
    case 'sleepy':      return 'sleepy';
    case 'sad':         return 'missing you';
    case 'happy':
    default:            return 'happy';
  }
}
