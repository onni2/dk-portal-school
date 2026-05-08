import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerTransactions } from "@/features/invoices/api/invoices.api";
import { fetchDkOneUsers } from "@/features/dkone/api/dkone.api";
import { fetchPosServices, fetchPosRestServices } from "@/features/pos/api/pos.api";
import { fetchUsers } from "@/features/users/api/users.api";
import { fetchTimeclockConfig } from "@/features/timeclock/api/timeclock.api";
import { fetchLicence } from "@/features/licence/api/licence.api";

const MODULE_LABELS: Record<string, string> = {
  GeneralLedger: "Fjárhagur",
  Customer: "Viðskiptavinir",
  Vendor: "Lánardrottnar",
  Sales: "Sölureikningar",
  Product: "Vörur",
  Project: "Verk",
  Payroll: "Laun",
  Member: "Félagar",
  Purchase: "Innkaup",
};

function Loading() {
  return <p className="text-sm text-(--color-text-muted)">Hleð...</p>;
}

function Err() {
  return <p className="text-sm text-(--color-error)">Tókst ekki að sækja gögn</p>;
}

function ReikningarPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: fetchCustomerTransactions,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  if (data.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">Engar færslur fundust.</p>;
  }

  const unsettled = data.filter((t) => !t.Settled && t.Amount > 0);
  const totalUnpaid = unsettled.reduce((sum, t) => sum + t.Amount, 0);
  const mostRecent = [...data].sort((a, b) => b.JournalDate.localeCompare(a.JournalDate))[0];
  const recentDate = mostRecent
    ? new Date(mostRecent.JournalDate).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="space-y-3">
      {/* Hero: unpaid summary or all-clear */}
      {unsettled.length > 0 ? (
        <div>
          <span className="inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {unsettled.length} ógreiddir
          </span>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-(--color-text)">
            {totalUnpaid.toLocaleString("is-IS")} kr.
          </p>
          <p className="text-xs text-(--color-text-muted)">ógreiddar skuldir</p>
        </div>
      ) : (
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
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">Reikningar alls</p>
          <p className="text-sm font-semibold text-(--color-text)">{data.length}</p>
        </div>
        {recentDate && (
          <div>
            <p className="text-xs text-(--color-text-muted)">Nýjasti</p>
            <p className="text-sm font-semibold text-(--color-text)">{recentDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StimpilklukkaPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeclock-config"],
    queryFn: fetchTimeclockConfig,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-(--color-text)">{data.companyName}</p>
      {data.timeclockUrl && (
        <p className="truncate text-sm text-(--color-primary)">{data.timeclockUrl}</p>
      )}
    </div>
  );
}

function LeyfиPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["licence-preview"],
    queryFn: fetchLicence,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const active = Object.entries(MODULE_LABELS).filter(([key]) => {
    const mod = data[key as keyof typeof data];
    if (!mod || typeof mod !== "object") return false;
    return (
      ("Enabled" in mod && mod.Enabled) ||
      ("PurchaseOrders" in mod && mod.PurchaseOrders)
    );
  });

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map(([key, label]) => (
        <span
          key={key}
          className="rounded-md bg-(--color-primary-light) px-2 py-0.5 text-xs font-medium text-(--color-primary)"
        >
          {label}
        </span>
      ))}
      {active.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">Engin virk leyfi</p>
      )}
    </div>
  );
}

function DkOnePreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dkone-users"],
    queryFn: fetchDkOneUsers,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const active = data.filter((u) => u.status === "active");
  const invited = data.filter((u) => u.status === "invited");
  const owners = active.filter((u) => u.role === "owner").length;
  const admins = active.filter((u) => u.role === "admin").length;
  const users = active.filter((u) => u.role === "user").length;

  if (data.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">Engir notendur skráðir.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div>
        {invited.length > 0 && (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {invited.length} í bið
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">virkir notendur í dkOne</p>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-3 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">Eigendur</p>
          <p className="text-sm font-semibold text-(--color-text)">{owners}</p>
        </div>
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

function PosPreview() {
  const dkpos = useQuery({ queryKey: ["pos-services-preview"], queryFn: fetchPosServices });
  const rest = useQuery({ queryKey: ["pos-rest-preview"], queryFn: fetchPosRestServices });

  if (dkpos.isLoading || rest.isLoading) return <Loading />;
  if (dkpos.isError || rest.isError) return <Err />;

  const dkposServices = dkpos.data ?? [];
  const restServices = rest.data ?? [];
  const all = [...dkposServices, ...restServices];

  const running = all.filter((s) => s.state === "running").length;
  const stopped = all.filter((s) => s.state === "stopped").length;

  const dkposRunning = dkposServices.filter((s) => s.state === "running").length;
  const restRunning = restServices.filter((s) => s.state === "running").length;

  if (all.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">Engar POS þjónustur skráðar.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div>
        {stopped > 0 && (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-error-bg) px-2 py-0.5 text-xs font-semibold text-(--color-error)">
            {stopped} stöðvuð
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">
          {running} af {all.length}
        </p>
        <p className="text-xs text-(--color-text-muted)">þjónustur í gangi</p>
      </div>

      {/* Split by type */}
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2.5">
        <div>
          <p className="text-xs text-(--color-text-muted)">dkPOS</p>
          <p className={`text-sm font-semibold ${dkposRunning < dkposServices.length ? "text-(--color-error)" : "text-(--color-text)"}`}>
            {dkposRunning} / {dkposServices.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">REST POS</p>
          <p className={`text-sm font-semibold ${restRunning < restServices.length ? "text-(--color-error)" : "text-(--color-text)"}`}>
            {restRunning} / {restServices.length}
          </p>
        </div>
      </div>
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

  const active = data.filter((u) => u.status === "active");
  const pending = data.filter((u) => u.status === "pending");
  const admins = active.filter((u) => u.companyRole === "admin").length;
  const users = active.filter((u) => u.companyRole === "user").length;

  if (data.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">Engir notendur skráðir.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div>
        {pending.length > 0 && (
          <span className="mb-1.5 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {pending.length} í bið
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">virkir notendur</p>
      </div>

      {/* Role breakdown */}
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

export function CardPreview({ id, fallback }: { id: string; fallback: ReactNode }) {
  switch (id) {
    case "reikningar":
      return <ReikningarPreview />;
    case "dkone":
      return <DkOnePreview />;
    case "pos":
      return <PosPreview />;
    case "notendur":
      return <NotendurPreview />;
    case "stimpilklukka":
      return <StimpilklukkaPreview />;
    case "leyfi":
      return <LeyfиPreview />;
    default:
      return <>{fallback}</>;
  }
}
