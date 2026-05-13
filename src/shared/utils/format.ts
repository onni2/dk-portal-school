/**
 * Shared number and date formatting utilities.
 * Exports: formatISK
 */

/**
 * Formats a number as Icelandic króna — rounds to nearest integer and
 * uses periods as thousands separators (Icelandic convention).
 * Does NOT append "kr." — callers add that themselves.
 */
export function formatISK(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
