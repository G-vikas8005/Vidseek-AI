/**
 * Format seconds into a human-readable timestamp string.
 *
 * Examples:
 *   65  → "01:05"
 *   135 → "02:15"
 *   342 → "05:42"
 *   3735 → "01:02:15"
 *
 * @param {number} totalSeconds — time in seconds
 * @returns {string} formatted time string (MM:SS or HH:MM:SS)
 */
export function formatTime(totalSeconds) {
  // Make sure we're working with a non-negative integer
  const safe = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  // Pad minutes and seconds to always show two digits (e.g. 05, 09)
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  // Only include hours when the time is 1 hour or more
  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}
