/**
 * Dashboard home grid — shows user-selected cards in a draggable grid.
 * Users can add/remove cards via a "+" card at the end and drag to reorder.
 * Layout is saved to localStorage.
 * Uses: @dnd-kit/core, @dnd-kit/sortable, ../store/dashboard.store, ./DashboardCard
 * Exports: DashboardGrid
 */
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ALL_CARDS, useDashboardLayout } from "../store/dashboard.store";
import { SortableDashboardCard } from "./DashboardCard";

/**
 * The "+" card at the end of the grid — click to add or remove cards.
 */
function AddCardTile() {
  const { cardIds, addCard, removeCard } = useDashboardLayout();
  const [open, setOpen] = useState(false);
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const availableCards = ALL_CARDS.filter((card) => !card.adminOnly || isAdmin);

  return (
    <div className="relative rounded border-2 border-dashed border-gray-300 bg-white p-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600"
        >
          <span className="text-3xl leading-none">+</span>
          <span className="text-sm">Bæta við spjaldi</span>
        </button>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Veldu spjöld:</p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Loka
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {availableCards.map((card) => {
              const isAdded = cardIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() =>
                    isAdded ? removeCard(card.id) : addCard(card.id)
                  }
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                    isAdded
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="w-4 text-center">{isAdded ? "✓" : "+"}</span>
                  {card.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 *
 */
export function DashboardGrid() {
  const { cardIds, setCardIds } = useDashboardLayout();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const sensors = useSensors(useSensor(PointerSensor));

  /**
   *
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cardIds.indexOf(active.id as string);
      const newIndex = cardIds.indexOf(over.id as string);
      setCardIds(arrayMove(cardIds, oldIndex, newIndex));
    }
  }

  const visibleCards = cardIds
    .map((id) => ALL_CARDS.find((c) => c.id === id))
    .filter(Boolean)
    .filter((card) => !card!.adminOnly || isAdmin) as typeof ALL_CARDS;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Yfirlit</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cardIds} strategy={rectSortingStrategy}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCards.map((card) => (
              <SortableDashboardCard key={card.id} card={card} />
            ))}
            <AddCardTile />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
