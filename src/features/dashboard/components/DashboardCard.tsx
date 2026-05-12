import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import type { CardDef } from "../store/dashboard.store";
import { useDashboardLayout } from "../store/dashboard.store";
import { useLangStore } from "@/shared/store/lang.store";
import { CardPreview } from "./CardPreviews";

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
  const footerLabel = lang === "EN"
    ? (card.footerLabelEn ?? `Open ${card.titleEn}`)
    : (card.footerLabel ?? `Opna ${card.title}`);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-(--color-surface)",
        "shadow-(--shadow-sm) transition-all hover:shadow-(--shadow-md)",
        isCustomizing
          ? "border-primary/30 ring-1 ring-primary/10"
          : "border-(--color-border)",
        isDragging && "ring-2 ring-primary/40 shadow-(--shadow-lg)",
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute right-3 top-3 z-10 cursor-grab touch-none select-none text-(--color-text-muted) transition-opacity active:cursor-grabbing",
          isCustomizing
            ? "opacity-50 hover:opacity-100"
            : "opacity-0 group-hover:opacity-60 active:opacity-100",
        )}
        title={lang === "EN" ? "Drag to reorder" : "Draga til að endurraða"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
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
          className="flex items-center justify-between border-t border-(--color-border) px-4 pt-3 pb-4 text-sm font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-primary)"
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
