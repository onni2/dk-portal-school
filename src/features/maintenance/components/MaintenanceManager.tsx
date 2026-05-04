import { useState } from "react";
import { Card } from "@/shared/components/Card";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { useMaintenanceLocks, useInvalidateMaintenance } from "../api/maintenance.queries";
import { lockRoute, unlockRoute } from "../api/maintenance.api";
import { NAV_ITEMS } from "@/features/licence/config/nav-items";

const LOCKABLE_ROUTES = NAV_ITEMS.filter(
  (item) =>
    item.access.type !== "copOnly" &&
    item.access.type !== "accountantOnly" &&
    item.access.type !== "godOnly",
).flatMap((item) => [
  { label: item.label, to: item.to },
  ...(item.children ?? []).map((c) => ({ label: `  ${c.label}`, to: c.to })),
]);

export function MaintenanceManager() {
  const { data: locks } = useMaintenanceLocks();
  const invalidate = useInvalidateMaintenance();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const lockedRoutes = new Set(locks.map((l) => l.route));

  async function toggle(route: string, currentlyLocked: boolean) {
    setSaving(route);
    try {
      if (currentlyLocked) {
        await unlockRoute(route);
      } else {
        await lockRoute(route, messages[route] || "Þjónusta er tímabundið ekki tiltæk.");
      }
      await invalidate();
    } finally {
      setSaving(null);
    }
  }

  async function updateMessage(route: string) {
    if (!lockedRoutes.has(route)) return;
    setSaving(route);
    try {
      await lockRoute(route, messages[route] || "Þjónusta er tímabundið ekki tiltæk.");
      await invalidate();
    } finally {
      setSaving(null);
    }
  }

  return (
    <PageTemplate title="Kerfisstjórn — Viðhald">
      <p className="mb-4 text-sm text-(--color-text-muted)">
        Slökktu á hlutum kerfisins meðan þú ert að vinna í þeim. Notendur sjá skilaboð þegar þeir reyna að opna lokaða hluta.
      </p>
      <div className="space-y-3">
        {LOCKABLE_ROUTES.map(({ label, to }) => {
          const isLocked = lockedRoutes.has(to);
          const isBusy = saving === to;
          const currentMessage = locks.find((l) => l.route === to)?.message ?? "";

          return (
            <Card key={to} padding="none">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--color-text)">{label.trim()}</p>
                  <p className="text-xs text-(--color-text-muted)">{to}</p>
                </div>

                {isLocked && (
                  <input
                    type="text"
                    placeholder="Skilaboð til notenda..."
                    defaultValue={currentMessage}
                    onChange={(e) => setMessages((p) => ({ ...p, [to]: e.target.value }))}
                    onBlur={() => updateMessage(to)}
                    className="w-64 rounded-lg border border-(--color-border) bg-(--color-background) px-3 py-1.5 text-xs text-(--color-text) outline-none focus:border-(--color-primary)"
                  />
                )}

                <button
                  onClick={() => toggle(to, isLocked)}
                  disabled={isBusy}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                    isLocked ? "bg-red-500" : "bg-(--color-border)"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isLocked ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {isLocked && (
                <div className="border-t border-(--color-border) bg-red-50 px-5 py-2">
                  <p className="text-xs font-medium text-red-600">Lokað — notendur sjá viðhaldsskilaboð</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </PageTemplate>
  );
}
