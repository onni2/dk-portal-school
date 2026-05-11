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
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ALL_CARDS, useDashboardLayout, type CardDef } from "../store/dashboard.store";
import { SortableDashboardCard } from "./DashboardCard";
import { useLicence } from "@/features/licence/api/licence.queries";
import { fetchMaintenanceLocks } from "@/features/maintenance/api/maintenance.api";
import { cn } from "@/shared/utils/cn";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "@/features/auth/types/auth.types";

function isLicenced(licence: LicenceResponse | undefined, module: keyof LicenceResponse): boolean {
  const entry = licence?.[module];
  return !!(entry && typeof entry === "object" && "Enabled" in entry && entry.Enabled);
}

// ─── Maintenance banner ───────────────────────────────────────────────────────

function MaintenanceBanner() {
  const { data: locks } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });

  if (!locks || locks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-(--color-warning) bg-(--color-warning-bg) p-4">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-(--color-warning)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--color-warning)">
            Viðhald í gangi — {locks.length} {locks.length === 1 ? "þjónusta" : "þjónustur"} óaðgengilegar
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {locks.map((lock) => (
              <li key={lock.route} className="text-sm text-(--color-warning)">
                <span className="font-mono opacity-70">{lock.route}</span>
                {lock.message && (
                  <span className="before:mx-1.5 before:opacity-40 before:content-['—']">{lock.message}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Customize panel ──────────────────────────────────────────────────────────

function CustomizePanel({
  available,
  cardIds,
  onToggle,
  onClose,
}: {
  available: CardDef[];
  cardIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-(--color-text)">Veldu hluta til að birta</p>
        <button
          onClick={onClose}
          className="text-xs text-(--color-text-muted) transition-colors hover:text-(--color-text)"
        >
          Loka
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {available.map((card) => {
          const active = cardIds.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => onToggle(card.id)}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-primary/30 bg-(--color-primary-light)"
                  : "border-(--color-border) hover:border-(--color-text-muted) hover:bg-(--color-surface-hover)",
              )}
            >
              <span className={cn("mt-0.5 shrink-0 text-xs font-bold", active ? "text-(--color-primary)" : "text-(--color-text-muted)")}>
                {active ? "✓" : "+"}
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", active ? "text-(--color-primary)" : "text-(--color-text)")}>
                  {card.title}
                </p>
                <p className="truncate text-xs text-(--color-text-muted)">{card.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const FULL_PERMISSIONS: UserPermissions = {
  invoices: true, subscription: true, hosting: true, pos: true,
  dkOne: true, dkPlus: true, timeclock: true, users: true,
};

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const authPermissions = useAuthStore((s) => s.permissions);
  const { data: licence, isLoading: licenceLoading } = useLicence();
  const { cardIds, setCardIds, addCard, removeCard } = useDashboardLayout();
  const { data: maintenanceLocks = [] } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });
  const [customizing, setCustomizing] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const membership = companies.find((c) => c.id === user?.companyId);
  const companyRole = membership?.role;
  const isSystemAdmin = user?.role === "god" || user?.role === "super_admin";
  const isCompanyAdmin = companyRole === "admin";

  // Role hierarchy: system admins and company admins have full access to all modules.
  // Regular users only see what their permission flags explicitly grant.
  const permissions: UserPermissions =
    isSystemAdmin || isCompanyAdmin ? FULL_PERMISSIONS : authPermissions;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Góðan daginn" : hour < 18 ? "Góðan dag" : "Gott kvöld";
  const firstName = user?.name?.split(" ")[0];

  const available = ALL_CARDS.filter((card) => {
    if (card.requireSystemAdmin && !isSystemAdmin) return false;
    if (card.permission && !permissions[card.permission]) return false;
    // Never show a licenced module card until we know the licence state
    if (card.licenceModule && licenceLoading) return false;
    if (card.licenceModule && !isLicenced(licence, card.licenceModule)) return false;
    return true;
  });

  const visibleCards = cardIds
    .map((id) => ALL_CARDS.find((c) => c.id === id))
    .filter(Boolean)
    .filter((card) => available.some((a) => a.id === card!.id)) as CardDef[];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cardIds.indexOf(active.id as string);
      const newIndex = cardIds.indexOf(over.id as string);
      setCardIds(arrayMove(cardIds, oldIndex, newIndex));
    }
  }

  function toggleCard(id: string) {
    if (cardIds.includes(id)) removeCard(id);
    else addCard(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-(--color-text)">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
            {user?.role === "god" && (
              <span className="rounded-full bg-(--color-error-bg) px-2.5 py-0.5 text-xs font-semibold text-(--color-error)">
                Kerfisstjóri
              </span>
            )}
            {user?.role === "super_admin" && (
              <span className="rounded-full bg-(--color-warning-bg) px-2.5 py-0.5 text-xs font-semibold text-(--color-warning)">
                Yfirstjórnandi
              </span>
            )}
            {companyRole === "admin" && user?.role === "user" && (
              <span className="rounded-full bg-(--color-primary-light) px-2.5 py-0.5 text-xs font-semibold text-(--color-primary)">
                Stjórnandi
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Hér er yfirlit þitt yfir stöðu kerfisins í dag.
          </p>
        </div>
        <button
          onClick={() => setCustomizing((v) => !v)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
            customizing
              ? "border-primary/40 bg-(--color-primary-light) text-(--color-primary)"
              : "border-(--color-border) bg-(--color-surface) text-(--color-text-muted) hover:border-(--color-text-muted) hover:text-(--color-text)",
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Sérsníða
        </button>
      </div>

      {/* Customize panel */}
      {customizing && (
        <CustomizePanel
          available={available}
          cardIds={cardIds}
          onToggle={toggleCard}
          onClose={() => setCustomizing(false)}
        />
      )}

      {/* Maintenance banner */}
      <MaintenanceBanner />

      {/* Card grid */}
      {licenceLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 auto-rows-[14rem]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-full animate-pulse rounded-2xl bg-(--color-surface-hover)" />
          ))}
        </div>
      ) : visibleCards.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cardIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 auto-rows-[14rem]">
              {visibleCards.map((card) => {
                const isLocked = !!card.to && maintenanceLocks.some(
                  (l) => card.to!.startsWith(l.route),
                );
                return <SortableDashboardCard key={card.id} card={card} isLocked={isLocked} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--color-border) py-16 text-center">
          <p className="text-sm font-medium text-(--color-text-muted)">Engir hlutar valdir</p>
          <button
            onClick={() => setCustomizing(true)}
            className="text-xs text-(--color-primary) hover:underline"
          >
            Opna stillingar
          </button>
        </div>
      )}
    </div>
  );
}
