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
import { DEFAULT_PERMISSIONS } from "@/features/users/api/permissions.api";
import { useUserPermissions } from "@/features/users/api/users.queries";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import { cn } from "@/shared/utils/cn";

function isModuleLicenced(
  licence: LicenceResponse | undefined,
  module: keyof LicenceResponse,
): boolean {
  const entry = licence?.[module];
  return !!(entry && typeof entry === "object" && "Enabled" in entry && entry.Enabled);
}

function AddCardTile() {
  const { cardIds, addCard, removeCard } = useDashboardLayout();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: userPermissions = DEFAULT_PERMISSIONS } = useUserPermissions(user?.id);
  const { data: licence } = useLicence();

  const availableCards = ALL_CARDS.filter((card) => {
    if (card.licenceModule && !isModuleLicenced(licence, card.licenceModule)) return false;
    if (!card.permission) return true;
    return userPermissions[card.permission] === true;
  });

  return (
    <div className="flex flex-col rounded-lg border-2 border-dashed border-(--color-border) bg-(--color-surface) transition-colors hover:border-primary/40">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-sm font-medium">Bæta við spjaldi</span>
        </button>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-(--color-text)">Veldu spjöld</p>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-(--color-text-muted) transition-colors hover:text-(--color-text)"
            >
              Loka
            </button>
          </div>
          <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
            {availableCards.map((card) => {
              const isAdded = cardIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => isAdded ? removeCard(card.id) : addCard(card.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    isAdded
                      ? "bg-(--color-primary-light) text-(--color-primary)"
                      : "text-(--color-text-secondary) hover:bg-(--color-surface-hover)",
                  )}
                >
                  <span className="w-4 shrink-0 text-center text-xs">
                    {isAdded ? "✓" : "+"}
                  </span>
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

export function DashboardGrid() {
  const { cardIds, setCardIds } = useDashboardLayout();
  const user = useAuthStore((s) => s.user);
  const { data: userPermissions = DEFAULT_PERMISSIONS } = useUserPermissions(user?.id);
  const { data: licence } = useLicence();

  const sensors = useSensors(useSensor(PointerSensor));

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
    .filter((card) => {
      if (card!.licenceModule && !isModuleLicenced(licence, card!.licenceModule)) return false;
      if (!card!.permission) return true;
      return userPermissions[card!.permission] === true;
    }) as typeof ALL_CARDS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-(--color-text)">Yfirlit</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          Dragðu spjöldin til að endurraða. Smelltu á + til að bæta við eða fjarlægja.
        </p>
      </div>

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
