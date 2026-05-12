import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLangStore } from "@/shared/store/lang.store";
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

const ROUTE_LABELS: Record<string, { is: string; en: string }> = {
  "/invoices":        { is: "Reikningar",     en: "Invoices" },
  "/invoices/":       { is: "Reikningar",     en: "Invoices" },
  "/askrift":         { is: "Áskrift",         en: "Subscription" },
  "/askrift/yfirlit": { is: "Áskrift",         en: "Subscription" },
  "/hosting":         { is: "Hýsing",          en: "Hosting" },
  "/pos":             { is: "POS",             en: "POS" },
  "/dkone":           { is: "dkOne",           en: "dkOne" },
  "/dkplus":          { is: "dkPlus",          en: "dkPlus" },
  "/timeclock":       { is: "Stimpilklukka",  en: "Timeclock" },
  "/timeclock/":      { is: "Stimpilklukka",  en: "Timeclock" },
  "/notendur":        { is: "Notendur",        en: "Users" },
  "/god":             { is: "Kerfisstjórnun", en: "System Admin" },
  "/god/":            { is: "Kerfisstjórnun", en: "System Admin" },
};

function MaintenanceBanner() {
  const { data: locks } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });
  const lang = useLangStore((s) => s.lang);

  if (!locks || locks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-(--color-warning) bg-(--color-warning-bg) p-4">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-(--color-warning)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--color-warning)">
            {lang === "EN"
              ? `Maintenance in progress — ${locks.length} ${locks.length === 1 ? "service" : "services"} unavailable`
              : `Viðhald í gangi — ${locks.length} ${locks.length === 1 ? "þjónusta" : "þjónustur"} óaðgengileg`}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {locks.map((lock) => (
              <li key={lock.route} className="text-sm text-(--color-warning)">
                <span className="font-medium">
                  {ROUTE_LABELS[lock.route]?.[lang === "EN" ? "en" : "is"] ?? lock.route}
                </span>
                {lock.message && (
                  <span className="opacity-75 before:mx-1.5 before:opacity-40 before:content-['—']">{lock.message}</span>
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
  compactIds,
  onToggle,
  onCompactToggle,
  onClose,
  lang,
}: {
  available: CardDef[];
  cardIds: string[];
  compactIds: string[];
  onToggle: (id: string) => void;
  onCompactToggle: (id: string) => void;
  onClose: () => void;
  lang: string;
}) {
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-(--color-text)">
          {lang === "EN" ? "Choose sections to display" : "Veldu hluta til að birta"}
        </p>
        <button
          onClick={onClose}
          className="text-xs text-(--color-text-muted) transition-colors hover:text-(--color-text)"
        >
          {lang === "EN" ? "Close" : "Loka"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {available.map((card) => {
          const active = cardIds.includes(card.id);
          const compact = compactIds.includes(card.id);
          return (
            <div key={card.id} className="relative">
              <button
                onClick={() => onToggle(card.id)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-primary/30 bg-(--color-primary-light)"
                    : "border-(--color-border) hover:border-(--color-text-muted) hover:bg-(--color-surface-hover)",
                )}
              >
                <span className={cn("mt-0.5 shrink-0 text-xs font-bold", active ? "text-(--color-primary)" : "text-(--color-text-muted)")}>
                  {active ? "✓" : "+"}
                </span>
                <div className="min-w-0 pr-5">
                  <p className={cn("text-sm font-medium", active ? "text-(--color-primary)" : "text-(--color-text)")}>
                    {lang === "EN" ? card.titleEn : card.title}
                  </p>
                  <p className="truncate text-xs text-(--color-text-muted)">
                    {lang === "EN" ? card.descriptionEn : card.description}
                  </p>
                </div>
              </button>
              {active && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCompactToggle(card.id); }}
                  className={cn(
                    "absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                    compact
                      ? "bg-(--color-primary-light) text-(--color-primary)"
                      : "text-(--color-text-muted) hover:text-(--color-primary)",
                  )}
                >
                  {compact ? (lang === "EN" ? "Compact" : "Þjappað") : (lang === "EN" ? "Compact" : "Þjappa")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Info popover ─────────────────────────────────────────────────────────────

function InfoPopover({ lang }: { lang: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={lang === "EN" ? "About this dashboard" : "Um þetta yfirlit"}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
          open
            ? "border-primary/50 bg-(--color-primary-light) text-(--color-primary)"
            : "border-(--color-border) bg-(--color-surface) text-(--color-text-muted) hover:border-(--color-text-muted) hover:text-(--color-text)",
        )}
      >
        i
      </button>

      {open && (
        <div className="absolute left-0 top-7 z-50 w-72 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-lg">
          <p className="mb-2 text-sm font-semibold text-(--color-text)">
            {lang === "EN" ? "About this dashboard" : "Um þetta yfirlit"}
          </p>
          <ul className="space-y-2 text-xs text-(--color-text-secondary)">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-(--color-primary)">▪</span>
              {lang === "EN"
                ? "Each card shows a live summary of a feature you have access to."
                : "Hvert kort sýnir stöðu einnar þjónustu sem þú hefur aðgang að."}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-(--color-primary)">▪</span>
              {lang === "EN"
                ? 'Use the "Customise" button to add or remove cards and toggle compact mode.'
                : 'Notaðu „Sérsníða" hnappinn til að bæta við eða fjarlægja kort og kveikja á þjöppuðu ham.'}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-(--color-primary)">▪</span>
              {lang === "EN"
                ? "Drag any card by its handle (⠿ top-right) to reorder them."
                : "Dragðu hvaða kort sem er í þjöppunarmerki (⠿ efst til hægri) til að raða þeim upp á nýtt."}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-(--color-primary)">▪</span>
              {lang === "EN"
                ? "Click the footer link on a card to navigate to that feature."
                : "Smelltu á hlekk neðst á korti til að fara á viðkomandi þjónustu."}
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-(--color-text-muted)">
            {lang === "EN"
              ? "Layout is saved per company."
              : "Útlit er vistað fyrir hvert fyrirtæki sérstaklega."}
          </p>
        </div>
      )}
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
  const { cardIds, setCardIds, addCard, removeCard, compactIds, toggleCompact } = useDashboardLayout();
  const { data: maintenanceLocks = [] } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });
  const [customizing, setCustomizing] = useState(false);
  const lang = useLangStore((s) => s.lang);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const membership = companies.find((c) => c.id === user?.companyId);
  const companyRole = membership?.role;
  const isSystemAdmin = user?.role === "god" || user?.role === "super_admin";
  const isCompanyAdmin = companyRole === "admin";

  // Role hierarchy: system admins and company admins have full access to all modules.
  // Regular users only see what their permission flags explicitly grant.
  const permissions: UserPermissions =
    isSystemAdmin || isCompanyAdmin ? FULL_PERMISSIONS : authPermissions;

  const hour = new Date().getHours();
  const greeting = lang === "EN"
    ? (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening")
    : (hour < 12 ? "Góðan daginn" : hour < 18 ? "Góðan dag" : "Gott kvöld");
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
            <InfoPopover lang={lang} />
            {user?.role === "god" && (
              <span className="rounded-full bg-(--color-error-bg) px-2.5 py-0.5 text-xs font-semibold text-(--color-error)">
                {lang === "EN" ? "System Admin" : "Kerfisstjóri"}
              </span>
            )}
            {user?.role === "super_admin" && (
              <span className="rounded-full bg-(--color-warning-bg) px-2.5 py-0.5 text-xs font-semibold text-(--color-warning)">
                {lang === "EN" ? "Super Admin" : "Yfirstjórnandi"}
              </span>
            )}
            {companyRole === "admin" && user?.role === "user" && (
              <span className="rounded-full bg-(--color-primary-light) px-2.5 py-0.5 text-xs font-semibold text-(--color-primary)">
                {lang === "EN" ? "Admin" : "Stjórnandi"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {maintenanceLocks.length > 0
              ? lang === "EN"
                ? `${maintenanceLocks.length} ${maintenanceLocks.length === 1 ? "service is" : "services are"} under maintenance.`
                : `${maintenanceLocks.length} ${maintenanceLocks.length === 1 ? "þjónusta er" : "þjónustur eru"} í viðhaldi.`
              : (lang === "EN" ? "Here is your overview of the system status today." : "Hér er yfirlit þitt yfir stöðu kerfisins í dag.")}
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
          {lang === "EN" ? "Customise" : "Sérsníða"}
        </button>
      </div>

      {/* Customize panel */}
      {customizing && (
        <CustomizePanel
          available={available}
          cardIds={cardIds}
          compactIds={compactIds}
          onToggle={toggleCard}
          onCompactToggle={toggleCompact}
          onClose={() => setCustomizing(false)}
          lang={lang}
        />
      )}

      {/* Maintenance banner */}
      <MaintenanceBanner />

      {/* Card grid */}
      {licenceLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 auto-rows-[16rem]">
          {Array.from({ length: Math.min(Math.max(cardIds.length, 2), 6) }).map((_, i) => (
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
            {customizing && (
              <div className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
                {lang === "EN" ? "Drag cards to reorder" : "Dragðu kort til að endurraða"}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 auto-rows-[16rem]">
              {visibleCards.map((card) => {
                const isLocked = !!card.to && maintenanceLocks.some(
                  (l) => card.to!.startsWith(l.route),
                );
                return <SortableDashboardCard key={card.id} card={card} isLocked={isLocked} isCustomizing={customizing} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--color-border) py-16 text-center">
          <p className="text-sm font-medium text-(--color-text-muted)">
            {lang === "EN" ? "No sections selected" : "Engir hlutar valdir"}
          </p>
          <button
            onClick={() => setCustomizing(true)}
            className="text-xs text-(--color-primary) hover:underline"
          >
            {lang === "EN" ? "Open settings" : "Opna stillingar"}
          </button>
        </div>
      )}
    </div>
  );
}
