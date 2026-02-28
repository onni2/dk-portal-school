/**
 * A single dashboard card — shows title, a live data preview, and a link. Supports drag-to-reorder via dnd-kit.
 * Uses: @dnd-kit/sortable, @dnd-kit/utilities, ../store/dashboard.store, ./CardPreviews
 * Exports: SortableDashboardCard
 */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardDef } from "../store/dashboard.store";
import { CardPreview } from "./CardPreviews";

/**
 *
 */
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded border border-gray-200 bg-white p-4 shadow-sm"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        title="Draga til að endurraða"
      >
        ⠿
      </div>

      <h3 className="mb-2 pr-6 text-base font-semibold text-gray-800">
        {card.title}
      </h3>

      <div className="mb-4 min-h-10">
        <CardPreview id={card.id} />
      </div>

      <a
        href={card.to}
        className="inline-block rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        Skoða
      </a>
    </div>
  );
}
