/**
 * Inline info icon that reveals a tooltip on hover.
 * Uses: nothing — standalone component
 * Exports: InfoTooltip
 */
interface InfoTooltipProps {
  text: string;
}

/** Renders a circular ℹ icon; hovering shows the tooltip text in a popup below. */
export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="group relative flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 cursor-default text-(--color-text-muted) transition-colors group-hover:text-(--color-text-secondary)"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
      </svg>
      <span className="pointer-events-none absolute left-6 top-full z-50 mt-2 w-72 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs text-(--color-text-secondary) opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
