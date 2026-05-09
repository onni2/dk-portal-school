import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import type { CardDef } from "../store/dashboard.store";
import { CardPreview } from "./CardPreviews";

export function SortableDashboardCard({ card }: { card: CardDef }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

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
        "group flex flex-col rounded-lg border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) transition-shadow hover:shadow-(--shadow-md)",
        isDragging && "ring-2 ring-primary/30",
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 px-5 pt-4 pb-3">
        <h3 className="text-base font-semibold text-(--color-text)">{card.title}</h3>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none select-none text-(--color-text-muted) opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          title="Draga til að endurraða"
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
      </div>

      {/* Live preview area */}
      <div className="min-h-12 flex-1 px-5 pb-3">
        <CardPreview id={card.id} fallback={
          <p className="text-sm text-(--color-text-muted)">{card.description}</p>
        } />
      </div>

      {/* Footer link */}
      <div className="border-t border-(--color-border) px-5 py-3">
        <Link
          to={card.to}
          className="text-sm font-medium text-(--color-primary) transition-colors hover:text-(--color-primary-hover)"
        >
          Skoða →
        </Link>
      </div>
    </div>
  );
}
