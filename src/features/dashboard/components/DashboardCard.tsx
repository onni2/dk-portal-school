/**
 * Sortable dashboard card component. Wraps the card content in a dnd-kit sortable node
 * and shows a drag handle, card preview, and a footer link to the feature page.
 * Uses: @dnd-kit/sortable, @dnd-kit/utilities, ../store/dashboard.store, @/shared/utils/cn
 * Exports: SortableDashboardCard
 */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import type { CardDef } from "../store/dashboard.store";
import { useDashboardLayout } from "../store/dashboard.store";
import { useLangStore } from "@/shared/store/lang.store";
import { CardPreview } from "./CardPreviews";

/** Dashboard card with dnd-kit drag support. Shows a lock icon instead of content when `isLocked` is true. */
export function SortableDashboardCard({
  card,
  isLocked = false,
  isCustomizing = false,
}: {
  card: CardDef;
  isLocked?: boolean;
  isCustomizing?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const compactIds = useDashboardLayout((s) => s.compactIds);
  const compact = compactIds.includes(card.id);
  const lang = useLangStore((s) => s.lang);
  const title = lang === "EN" ? card.titleEn : card.title;
  // fall back to a generic label if none was specified in the card definition
  const footerLabel = lang === "EN"
    ? (card.footerLabelEn ?? `Open ${card.titleEn}`)
    : (card.footerLabel ?? `Opna ${card.title}`);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1, // dim the card while it's being dragged
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)",
        "shadow-(--shadow-sm) transition-shadow hover:shadow-(--shadow-md)",
        isDragging && "ring-2 ring-primary/30",
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-0 top-0 z-10 flex h-full w-7 cursor-grab touch-none select-none flex-col items-center justify-center gap-0.5 rounded-l-2xl transition-colors active:cursor-grabbing",
          isCustomizing
            ? "bg-primary/5 text-(--color-primary) hover:bg-primary/10"
            : "text-(--color-text-muted) opacity-40 hover:bg-(--color-surface-hover) hover:opacity-100",
        )}
        title={lang === "EN" ? "Drag to reorder" : "Draga til að endurraða"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 pl-9 pr-4 pt-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted)">
          {title}
        </p>
        <div className="min-h-0 flex-1 overflow-hidden">
          {isLocked ? (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-(--color-text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-(--color-text-muted)">
                {lang === "EN" ? "Under maintenance" : "Í viðhaldi"}
              </p>
            </div>
          ) : (
            <CardPreview
              id={card.id}
              compact={compact}
              fallback={<p className="text-sm text-(--color-text-secondary)">{lang === "EN" ? card.descriptionEn : card.description}</p>}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      {card.to && (
        <Link
          to={card.to}
          className="flex items-center justify-between border-t border-(--color-border) pl-9 pr-4 pt-3 pb-4 text-sm font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-primary)"
        >
          <span>{footerLabel}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
