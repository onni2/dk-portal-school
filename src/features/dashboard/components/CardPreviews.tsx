import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { fetchCustomerTransactions } from "@/features/invoices/api/invoices.api";
import { fetchDkOneUsers } from "@/features/dkone/api/dkone.api";
import { fetchPosServices, fetchPosRestServices } from "@/features/pos/api/pos.api";
import { fetchUsers } from "@/features/users/api/users.api";
import { fetchHostingAccounts } from "@/features/hosting/api/hosting.api";
import { fetchSubscriptionOverview, buildOverview } from "@/features/subscription/api/overview.api";
import { fetchAuthTokens } from "@/features/dkplus/api/dkplus.api";
import { fetchTimeclockConfig, fetchIpWhitelist, fetchEmployeePhones } from "@/features/timeclock/api/timeclock.api";
import { fetchSubCompanies } from "@/features/dkone/api/dkone.api";
import { fetchDashboardSummary } from "@/features/dashboard/api/dashboard.api";
import { getNotifications } from "@/features/notifications/api/notifications.api";
import { fetchMaintenanceLocks } from "@/features/maintenance/api/maintenance.api";

function Loading() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-24 animate-pulse rounded-lg bg-(--color-surface-hover)" />
      <div className="h-3.5 w-16 animate-pulse rounded-lg bg-(--color-surface-hover)" />
    </div>
  );
}

function Err() {
  return <p className="text-sm text-(--color-error)">Tókst ekki að sækja gögn</p>;
}

// ─── Previews ─────────────────────────────────────────────────────────────────

function CompanyPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const modules = data.leyfi.virk;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-2xl font-bold tabular-nums text-(--color-text)">{modules.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {modules.length === 1 ? "virkur eining" : "virkar einingar"} · {data.company.name}
        </p>
      </div>
      {modules.length > 0 ? (
        <div className="flex flex-wrap gap-1 border-t border-(--color-border) pt-2.5">
          {modules.map((m) => (
            <span
              key={m}
              className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)"
            >
              {m}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-(--color-text-muted)">Engar einingar virkar</p>
      )}
    </div>
  );
}

function ReikningarPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: fetchCustomerTransactions,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engar færslur fundust.</p>;

  const unsettled = data.filter((t) => !t.Settled && t.Amount > 0);
  const totalUnpaid = unsettled.reduce((sum, t) => sum + t.Amount, 0);

  if (unsettled.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-success-bg)">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-(--color-success)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-(--color-success)">Allt greitt</p>
          <p className="text-xs text-(--color-text-muted)">Engir ógreiddir reikningar</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
        {unsettled.length} ógreiddir
      </span>
      <p className="text-2xl font-bold tabular-nums text-(--color-text)">
        {totalUnpaid.toLocaleString("is-IS")} kr.
      </p>
      <p className="text-xs text-(--color-text-muted)">ógreiddar skuldir</p>
    </div>
  );
}

function PosPreview() {
  const dkpos = useQuery({ queryKey: ["pos-services-preview"], queryFn: fetchPosServices });
  const rest = useQuery({ queryKey: ["pos-rest-preview"], queryFn: fetchPosRestServices });

  if (dkpos.isLoading || rest.isLoading) return <Loading />;
  if (dkpos.isError || rest.isError) return <Err />;

  const all = [...(dkpos.data ?? []), ...(rest.data ?? [])];
  const running = all.filter((s) => s.state === "running").length;
  const stopped = all.filter((s) => s.state === "stopped").length;

  if (all.length === 0) return <p className="text-sm text-(--color-text-muted)">Engar POS þjónustur skráðar.</p>;

  return (
    <div className="space-y-3">
      {/* One dot per service */}
      <div className="flex flex-wrap gap-1.5">
        {all.map((s) => (
          <span
            key={s.id}
            title={s.display}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              s.state === "running" ? "bg-(--color-success)" : "bg-(--color-error)",
            )}
          />
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-2xl font-bold text-(--color-success)">{running}</p>
          <p className="text-xs text-(--color-text-muted)">í gangi</p>
        </div>
        <div>
          <p className={cn("text-2xl font-bold", stopped > 0 ? "text-(--color-error)" : "text-(--color-text-muted)")}>
            {stopped}
          </p>
          <p className="text-xs text-(--color-text-muted)">stöðvuð</p>
        </div>
      </div>
    </div>
  );
}

function DkOnePreview() {
  const users = useQuery({ queryKey: ["dkone-users"], queryFn: fetchDkOneUsers });
  const subs = useQuery({ queryKey: ["dkone-sub-companies"], queryFn: fetchSubCompanies });

  if (users.isLoading) return <Loading />;
  if (users.isError || !users.data) return <Err />;
  if (users.data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engir notendur skráðir.</p>;

  const active = users.data.filter((u) => u.status === "active");
  const invited = users.data.filter((u) => u.status === "invited");
  const subList = subs.data ?? [];

  return (
    <div className="space-y-3">
      <div>
        {invited.length > 0 && (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {invited.length} í bið
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">virkir notendur</p>
      </div>
      {subList.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-(--color-border) pt-2.5">
          {subList.map((c) => (
            <span
              key={c.id}
              className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function HysingPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hosting-accounts-preview"],
    queryFn: fetchHostingAccounts,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engir hýsingaraðgangar skráðir.</p>;

  const withoutMfa = data.filter((a) => !a.hasMfa).length;

  const withMfa = data.length - withoutMfa;

  return (
    <div className="space-y-3">
      <div>
        {withoutMfa > 0 ? (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {withoutMfa} án MFA
          </span>
        ) : (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-semibold text-(--color-success)">
            Allt með MFA
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{data.length}</p>
        <p className="text-xs text-(--color-text-muted)">hýsingaraðgangar</p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">Með MFA</p>
          <p className="text-sm font-semibold text-(--color-success)">{withMfa}</p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Án MFA</p>
          <p className={cn("text-sm font-semibold", withoutMfa > 0 ? "text-(--color-warning)" : "text-(--color-text-muted)")}>
            {withoutMfa}
          </p>
        </div>
      </div>
    </div>
  );
}

function AskriftPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subscription-overview-preview"],
    queryFn: fetchSubscriptionOverview,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engar áskriftarpantanir fundust.</p>;

  const { packageLines, groups } = buildOverview(data);
  const grandTotal =
    packageLines.reduce((s, l) => s + (l.TotalAmountWithTax ?? 0), 0) +
    groups.reduce((s, g) => s + g.total, 0);

  return (
    <div>
      <p className="text-2xl font-bold tabular-nums text-(--color-primary)">
        {Math.round(grandTotal).toLocaleString("is-IS")} kr.
      </p>
      <p className="text-xs text-(--color-text-muted)">mánaðarlegt m. vsk</p>
    </div>
  );
}

function DkPlusPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dkplus-tokens-preview"],
    queryFn: fetchAuthTokens,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engin API tókn skráð.</p>;

  const byCompany = Object.values(
    data.reduce<Record<string, { name: string; count: number }>>((acc, t) => {
      if (!acc[t.companyId]) acc[t.companyId] = { name: t.companyName, count: 0 };
      acc[t.companyId].count++;
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-2xl font-bold text-(--color-text)">{data.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          API tókn · {byCompany.length} {byCompany.length === 1 ? "fyrirtæki" : "fyrirtæki"}
        </p>
      </div>
      <ul className="space-y-1.5 border-t border-(--color-border) pt-2.5">
        {byCompany.slice(0, 4).map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-(--color-text-secondary)">{c.name}</span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-(--color-text)">
              {c.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StimpilklukkaPreview() {
  const config = useQuery({ queryKey: ["timeclock-config"], queryFn: fetchTimeclockConfig });
  const ips = useQuery({ queryKey: ["timeclock-ips-preview"], queryFn: fetchIpWhitelist });
  const phones = useQuery({ queryKey: ["timeclock-phones-preview"], queryFn: fetchEmployeePhones });

  if (config.isLoading) return <Loading />;
  if (config.isError || !config.data) return <Err />;

  const { timeclockUrl } = config.data;
  const ipList = ips.data ?? [];
  const phoneCount = phones.data?.length ?? 0;

  return (
    <div className="space-y-3">
      <div>
        {!timeclockUrl && (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            Slóð ekki stillt
          </span>
        )}
        <p className={timeclockUrl ? "truncate text-sm font-medium text-(--color-primary)" : "text-sm text-(--color-text-muted)"}>
          {timeclockUrl ?? "Engin stimpilklukkuslóð"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">Skráðir símar</p>
          <p className="text-sm font-semibold text-(--color-text)">{phoneCount}</p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Leyfðar staðsetningar</p>
          <p className="text-sm font-semibold text-(--color-text)">{ipList.length}</p>
        </div>
      </div>
      {ipList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ipList.map((entry) => (
            <span
              key={entry.id}
              title={entry.ip}
              className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)"
            >
              {entry.label || entry.ip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NotendurPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-users-preview"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engir notendur skráðir.</p>;

  const active = data.filter((u) => u.status === "active");
  const pending = data.filter((u) => u.status === "pending");
  const needsReset = active.filter((u) => u.mustResetPassword);
  const admins = active.filter((u) => u.companyRole === "admin").length;
  const users = active.filter((u) => u.companyRole === "user").length;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {pending.length > 0 && (
            <span className="rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
              {pending.length} í bið
            </span>
          )}
          {needsReset.length > 0 && (
            <span className="rounded-md bg-(--color-error-bg) px-2 py-0.5 text-xs font-semibold text-(--color-error)">
              {needsReset.length} endursetja lykilorð
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">virkir notendur</p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">Stjórnendur</p>
          <p className="text-sm font-semibold text-(--color-text)">{admins}</p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Notendur</p>
          <p className="text-sm font-semibold text-(--color-text)">{users}</p>
        </div>
      </div>
    </div>
  );
}

function TilkynningarPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30_000,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;
  if (data.length === 0) return <p className="text-sm text-(--color-text-muted)">Engar tilkynningar.</p>;

  const unread = data.filter((n) => !n.read);

  return (
    <div>
      {unread.length > 0 && (
        <span className="mb-1.5 inline-block rounded-md bg-(--color-primary-light) px-2 py-0.5 text-xs font-semibold text-(--color-primary)">
          {unread.length} ólesnar
        </span>
      )}
      <p className="text-2xl font-bold text-(--color-text)">{data.length}</p>
      <p className="text-xs text-(--color-text-muted)">tilkynningar</p>
    </div>
  );
}


function SystemPreview() {
  const { data: locks, isLoading } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });

  if (isLoading) return <Loading />;

  const activeLocks = locks ?? [];

  return (
    <div>
      {activeLocks.length > 0 ? (
        <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
          {activeLocks.length} {activeLocks.length === 1 ? "lás" : "lásir"} virkir
        </span>
      ) : (
        <span className="mb-1.5 inline-block rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-semibold text-(--color-success)">
          Ekkert viðhald
        </span>
      )}
      <p className="text-2xl font-bold text-(--color-text)">{activeLocks.length}</p>
      <p className="text-xs text-(--color-text-muted)">virkir viðhaldslásir</p>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function CardPreview({ id, fallback }: { id: string; fallback: ReactNode }) {
  switch (id) {
    case "company":       return <CompanyPreview />;
    case "reikningar":    return <ReikningarPreview />;
    case "pos":           return <PosPreview />;
    case "dkone":         return <DkOnePreview />;
    case "hysing":        return <HysingPreview />;
    case "askrift":       return <AskriftPreview />;
    case "dkplus":        return <DkPlusPreview />;
    case "stimpilklukka": return <StimpilklukkaPreview />;
    case "notendur":      return <NotendurPreview />;
    case "tilkynningar":  return <TilkynningarPreview />;
    case "system":        return <SystemPreview />;
    default:              return <>{fallback}</>;
  }
}
