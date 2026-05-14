/**
 * Generic pill-style tab switcher. Used inside the hosting pages for Duo/history tabs.
 * Uses: @/shared/utils/cn
 * Exports: TabSwitcher
 */
import { cn } from "@/shared/utils/cn";

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabSwitcherProps<T extends string> {
  tabs: readonly TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Renders a row of pill tabs; the active tab gets the primary colour. Fully generic over tab value types. */
export function TabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: TabSwitcherProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full rounded-lg border border-(--color-border) bg-(--color-surface-hover) ",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-(--color-primary) text-white shadow-sm"
                : "text-(--color-text-secondary) hover:text-(--color-text)",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}