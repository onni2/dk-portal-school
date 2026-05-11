import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { useLangStore } from "@/shared/store/lang.store";
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
import { fetchMaintenanceLocks } from "@/features/maintenance/api/maintenance.api";

type Lang = "IS" | "EN";

function Loading() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-24 animate-pulse rounded-lg bg-(--color-surface-hover)" />
      <div className="h-3.5 w-16 animate-pulse rounded-lg bg-(--color-surface-hover)" />
    </div>
  );
}

function Err({ lang }: { lang: Lang }) {
  return <p className="text-sm text-(--color-error)">{lang === "EN" ? "Failed to fetch data" : "Tókst ekki að sækja gögn"}</p>;
}

function more(n: number, lang: Lang) {
  return lang === "EN" ? `+${n} more` : `+${n} fleiri`;
}

function fmtDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "EN" ? "en-GB" : "is-IS", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Previews ─────────────────────────────────────────────────────────────────

function CompanyPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;

  const modules = data.leyfi.virk;

  return (
    <div className="space-y-2.5">
      <div>
        <p className="truncate text-xl font-bold text-(--color-text)" title={data.company.name}>
          {data.company.name}
        </p>
        <p className="text-xs text-(--color-text-muted)">
          {data.company.number}
          {data.company.owner && ` · ${data.company.owner}`}
        </p>
        {modules.length > 0 && (
          <p className="text-xs text-(--color-text-muted)">
            {modules.length} {modules.length === 1
              ? (lang === "EN" ? "module active" : "eining virk")
              : (lang === "EN" ? "modules active" : "einingar virkar")}
          </p>
        )}
      </div>
      {!compact && modules.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-(--color-border) pt-2">
          {modules.map((m) => (
            <span key={m} className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)">
              {m}
            </span>
          ))}
        </div>
      )}
      {!compact && modules.length === 0 && (
        <p className="border-t border-(--color-border) pt-2 text-xs text-(--color-text-muted)">
          {lang === "EN" ? "No active modules" : "Engar einingar virkar"}
        </p>
      )}
    </div>
  );
}

function ReikningarPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: fetchCustomerTransactions,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;
  if (data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No transactions found." : "Engar færslur fundust."}
    </p>
  );

  const unsettled = data.filter((t) => !t.Settled && t.Amount > 0);
  const totalUnpaid = unsettled.reduce((sum, t) => sum + t.Amount, 0);

  const sorted = data.map((t) => t.JournalDate).filter(Boolean).sort();
  const newestDate = sorted[sorted.length - 1];
  const unsettledSorted = unsettled.map((t) => t.JournalDate).filter(Boolean).sort();
  const oldestUnpaidDate = unsettledSorted[0];

  if (unsettled.length === 0) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-success-bg)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-(--color-success)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-(--color-success)">
              {lang === "EN" ? "All paid" : "Allt greitt"}
            </p>
            <p className="text-xs text-(--color-text-muted)">
              {lang === "EN" ? "No unpaid invoices" : "Engir ógreiddir reikningar"}
            </p>
          </div>
        </div>
        {!compact && newestDate && (
          <div className="border-t border-(--color-border) pt-2">
            <p className="text-xs text-(--color-text-muted)">
              {lang === "EN" ? "Latest invoice" : "Nýjasti reikningur"}
            </p>
            <p className="text-xs font-medium text-(--color-text-secondary)">{fmtDate(newestDate, lang)}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div>
        <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
          {unsettled.length} {lang === "EN" ? "unpaid" : "ógreiddir"}
        </span>
        <p className="text-2xl font-bold tabular-nums text-(--color-text)">
          {totalUnpaid.toLocaleString("is-IS")} kr.
        </p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "unpaid debt" : "ógreiddar skuldir"}
        </p>
      </div>
      {!compact && (newestDate || oldestUnpaidDate) && (
        <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2">
          {newestDate && (
            <div>
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Latest invoice" : "Nýjasti reikningur"}
              </p>
              <p className="text-xs font-medium text-(--color-text-secondary)">{fmtDate(newestDate, lang)}</p>
            </div>
          )}
          {oldestUnpaidDate && (
            <div>
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Oldest unpaid" : "Elsta ógreitt"}
              </p>
              <p className="text-xs font-medium text-(--color-warning)">{fmtDate(oldestUnpaidDate, lang)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PosPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const dkpos = useQuery({ queryKey: ["pos-services-preview"], queryFn: fetchPosServices });
  const rest = useQuery({ queryKey: ["pos-rest-preview"], queryFn: fetchPosRestServices });

  if (dkpos.isLoading || rest.isLoading) return <Loading />;
  if (dkpos.isError || rest.isError) return <Err lang={lang} />;

  const dkposServices = dkpos.data ?? [];
  const restServices = rest.data ?? [];
  const all = [...dkposServices, ...restServices];
  const running = all.filter((s) => s.state === "running").length;
  const stopped = all.filter((s) => s.state === "stopped").length;

  if (all.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No POS services registered." : "Engar POS þjónustur skráðar."}
    </p>
  );

  if (compact) {
    return (
      <div className="space-y-2.5">
        <div>
          <p className="text-2xl font-bold text-(--color-text)">
            <span className="text-(--color-success)">{running}</span>
            <span className="text-(--color-text-muted)"> / {all.length}</span>
          </p>
          <p className="text-xs text-(--color-text-muted)">
            {lang === "EN" ? "services running" : "þjónustur í gangi"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-(--color-border) pt-2">
          {all.map((s) => (
            <span
              key={s.id}
              title={s.display}
              className={cn("h-2 w-2 rounded-full", s.state === "running" ? "bg-(--color-success)" : "bg-(--color-error)")}
            />
          ))}
        </div>
      </div>
    );
  }

  const sortByState = (a: { state: string }, b: { state: string }) =>
    a.state === b.state ? 0 : a.state === "stopped" ? -1 : 1;

  const groups: { label: string; services: typeof all }[] = [];
  if (dkposServices.length > 0)
    groups.push({ label: "dkPOS", services: [...dkposServices].sort(sortByState) });
  if (restServices.length > 0)
    groups.push({ label: "REST", services: [...restServices].sort(sortByState) });

  let remaining = 4;
  let totalHidden = 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-semibold text-(--color-success)">
          {running} {lang === "EN" ? "running" : "í gangi"}
        </span>
        {stopped > 0 && (
          <span className="rounded-md bg-(--color-error-bg) px-2 py-0.5 text-xs font-semibold text-(--color-error)">
            {stopped} {lang === "EN" ? "stopped" : "stöðvuð"}
          </span>
        )}
      </div>
      <div className="space-y-2 border-t border-(--color-border) pt-2">
        {groups.map(({ label, services }) => {
          const shown = services.slice(0, remaining);
          const hidden = services.length - shown.length;
          totalHidden += hidden;
          remaining -= shown.length;
          if (shown.length === 0) return null;
          return (
            <div key={label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted)">{label}</p>
              <ul className="space-y-0.5">
                {shown.map((s) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.state === "running" ? "bg-(--color-success)" : "bg-(--color-error)")} />
                    <span className="min-w-0 truncate text-xs text-(--color-text)">{s.display}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {totalHidden > 0 && (
          <p className="text-xs text-(--color-text-muted)">{more(totalHidden, lang)}</p>
        )}
      </div>
    </div>
  );
}

function DkOnePreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const users = useQuery({ queryKey: ["dkone-users"], queryFn: fetchDkOneUsers });
  const subs = useQuery({ queryKey: ["dkone-sub-companies"], queryFn: fetchSubCompanies });

  if (users.isLoading) return <Loading />;
  if (users.isError || !users.data) return <Err lang={lang} />;
  if (users.data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No users registered." : "Engir notendur skráðir."}
    </p>
  );

  const active = users.data.filter((u) => u.status === "active");
  const invited = users.data.filter((u) => u.status === "invited");
  const owners = active.filter((u) => u.role === "owner");
  const admins = active.filter((u) => u.role === "admin");
  const subList = subs.isError ? [] : (subs.data ?? []);

  const roleLine = [
    owners.length > 0 && `${owners.length} ${lang === "EN"
      ? (owners.length === 1 ? "owner" : "owners")
      : (owners.length === 1 ? "eigandi" : "eigendur")}`,
    admins.length > 0 && `${admins.length} ${lang === "EN"
      ? (admins.length === 1 ? "admin" : "admins")
      : (admins.length === 1 ? "stjórnandi" : "stjórnendur")}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="space-y-2.5">
      <div>
        {invited.length > 0 && (
          <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {invited.length} {lang === "EN" ? "pending" : "í bið"}
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {active.length === 1
            ? (lang === "EN" ? "active user" : "virkur notandi")
            : (lang === "EN" ? "active users" : "virkir notendur")}
          {roleLine && <span className="ml-1 opacity-60">· {roleLine}</span>}
        </p>
      </div>
      {!compact && (
        <>
          {invited.length > 0 ? (
            <div className="space-y-1 border-t border-(--color-border) pt-2">
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Awaiting confirmation" : "Bíður staðfestingar"}
              </p>
              <div className="space-y-1">
                {invited.slice(0, 2).map((u) => (
                  <div key={u.id} className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-warning)" />
                    <p className="truncate text-xs text-(--color-text-secondary)">{u.fullName}</p>
                  </div>
                ))}
                {invited.length > 2 && (
                  <p className="text-xs text-(--color-text-muted)">{more(invited.length - 2, lang)}</p>
                )}
              </div>
            </div>
          ) : subList.length > 0 ? (
            <div className="space-y-1 border-t border-(--color-border) pt-2">
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Connected companies" : "Tengd fyrirtæki"}
              </p>
              <div className="flex flex-wrap gap-1">
                {subList.slice(0, 4).map((c) => (
                  <span
                    key={c.id}
                    title={c.name}
                    className="inline-block max-w-28 truncate rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)"
                  >
                    {c.name}
                  </span>
                ))}
                {subList.length > 4 && (
                  <span className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-muted)">
                    {more(subList.length - 4, lang)}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function HysingPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hosting-accounts-preview"],
    queryFn: fetchHostingAccounts,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;
  if (data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No hosting accounts registered." : "Engir hýsingaraðgangar skráðir."}
    </p>
  );

  const noMfa = data.filter((a) => !a.hasMfa);
  const withMfa = data.length - noMfa.length;

  return (
    <div className="space-y-2.5">
      <div>
        {noMfa.length > 0 ? (
          <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {noMfa.length} {lang === "EN" ? "without MFA" : "án MFA"}
          </span>
        ) : (
          <span className="mb-1 inline-block rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-semibold text-(--color-success)">
            {lang === "EN" ? "All with MFA" : "Allt með MFA"}
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{data.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "hosting accounts" : "hýsingaraðgangar"}
        </p>
      </div>
      {!compact && (
        <div className="border-t border-(--color-border) pt-2">
          {noMfa.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Missing MFA" : "Vantar MFA"}
              </p>
              {noMfa.slice(0, 2).map((a) => (
                <div key={a.id} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-warning)" />
                  <span className="truncate text-xs text-(--color-text-secondary)">{a.displayName || a.username}</span>
                </div>
              ))}
              {noMfa.length > 2 && (
                <p className="text-xs text-(--color-text-muted)">{more(noMfa.length - 2, lang)}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "With MFA" : "Með MFA"}
              </p>
              <p className="text-sm font-semibold text-(--color-success)">{withMfa}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AskriftPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subscription-overview-preview"],
    queryFn: fetchSubscriptionOverview,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;
  if (data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No subscription orders found." : "Engar áskriftarpantanir fundust."}
    </p>
  );

  const { packageLines, groups } = buildOverview(data);
  const grandTotal =
    packageLines.reduce((s, l) => s + (l.TotalAmountWithTax ?? 0), 0) +
    groups.reduce((s, g) => s + g.total, 0);

  const lineItems = [
    ...packageLines.map((l) => ({ title: l.Text ?? l.ItemCode ?? "Pakki", total: l.TotalAmountWithTax ?? 0 })),
    ...groups.map((g) => ({ title: g.title, total: g.total })),
  ];

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-2xl font-bold tabular-nums text-(--color-primary)">
          {Math.round(grandTotal).toLocaleString("is-IS")} kr.
        </p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "monthly incl. VAT" : "mánaðarlegt m. vsk"}
        </p>
      </div>
      {!compact && lineItems.length > 0 && (
        <ul className="space-y-1 border-t border-(--color-border) pt-2">
          {lineItems.slice(0, 3).map((item) => (
            <li key={item.title} className="flex items-center justify-between gap-2">
              <span className="truncate text-xs text-(--color-text-secondary)">{item.title}</span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-(--color-text)">
                {Math.round(item.total).toLocaleString("is-IS")} kr.
              </span>
            </li>
          ))}
          {lineItems.length > 3 && (
            <li className="text-xs text-(--color-text-muted)">{more(lineItems.length - 3, lang)}</li>
          )}
        </ul>
      )}
    </div>
  );
}

function DkPlusPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dkplus-tokens-preview"],
    queryFn: fetchAuthTokens,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;
  if (data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No API tokens registered." : "Engin API tókn skráð."}
    </p>
  );

  const byCompany = Object.values(
    data.reduce<Record<string, { name: string; count: number }>>((acc, t) => {
      const key = t.companyId ?? "__unknown__";
      if (!acc[key]) acc[key] = { name: t.companyName ?? key, count: 0 };
      acc[key].count++;
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-2xl font-bold text-(--color-text)">{data.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "API tokens" : "API tókn"} · {byCompany.length}{" "}
          {lang === "EN"
            ? (byCompany.length === 1 ? "company" : "companies")
            : "fyrirtæki"}
        </p>
      </div>
      {!compact && (
        <div className="border-t border-(--color-border) pt-2">
          <ul className="space-y-1">
            {byCompany.slice(0, 3).map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-(--color-text-secondary)">{c.name}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-(--color-text)">{c.count}</span>
              </li>
            ))}
          </ul>
          {byCompany.length > 3 && (
            <p className="mt-1 text-xs text-(--color-text-muted)">{more(byCompany.length - 3, lang)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function StimpilklukkaPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const config = useQuery({ queryKey: ["timeclock-config"], queryFn: fetchTimeclockConfig });
  const ips = useQuery({ queryKey: ["timeclock-ips-preview"], queryFn: fetchIpWhitelist });
  const phones = useQuery({ queryKey: ["timeclock-phones-preview"], queryFn: fetchEmployeePhones });

  if (config.isLoading) return <Loading />;
  if (config.isError || !config.data) return <Err lang={lang} />;

  const { timeclockUrl } = config.data;
  const ipList = ips.isError ? [] : (ips.data ?? []);
  const phoneCount = phones.isError ? 0 : (phones.data?.length ?? 0);

  return (
    <div className="space-y-2.5">
      <div>
        {!timeclockUrl && (
          <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {lang === "EN" ? "URL not configured" : "Slóð ekki stillt"}
          </span>
        )}
        <p className={timeclockUrl ? "truncate text-sm font-medium text-(--color-primary)" : "text-sm text-(--color-text-muted)"}>
          {timeclockUrl ?? (lang === "EN" ? "No timeclock URL" : "Engin stimpilklukkuslóð")}
        </p>
      </div>
      {!compact && (
        <>
          <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2">
            <div>
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Reg. phones" : "Skráðir símar"}
              </p>
              <p className="text-sm font-semibold text-(--color-text)">{phoneCount}</p>
            </div>
            <div>
              <p className="text-xs text-(--color-text-muted)">
                {lang === "EN" ? "Allowed loc." : "Leyfðar staðs."}
              </p>
              <p className="text-sm font-semibold text-(--color-text)">{ipList.length}</p>
            </div>
          </div>
          {ipList.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ipList.slice(0, 4).map((entry) => (
                <span
                  key={entry.id}
                  title={entry.ip}
                  className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-secondary)"
                >
                  {entry.label || entry.ip}
                </span>
              ))}
              {ipList.length > 4 && (
                <span className="rounded-md bg-(--color-surface-hover) px-2 py-0.5 text-xs text-(--color-text-muted)">
                  {more(ipList.length - 4, lang)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotendurPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-users-preview"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err lang={lang} />;
  if (data.length === 0) return (
    <p className="text-sm text-(--color-text-muted)">
      {lang === "EN" ? "No users registered." : "Engir notendur skráðir."}
    </p>
  );

  const active = data.filter((u) => u.status === "active");
  const pending = data.filter((u) => u.status === "pending");
  const needsReset = active.filter((u) => u.mustResetPassword);
  const admins = active.filter((u) => u.companyRole === "admin").length;
  const users = active.length - admins;

  const badge = pending.length > 0
    ? { label: `${pending.length} ${lang === "EN" ? "pending" : "í bið"}` }
    : needsReset.length > 0
    ? { label: `${needsReset.length} ${lang === "EN" ? "reset password" : "endursetja lykilorð"}` }
    : null;

  return (
    <div className="space-y-2.5">
      <div>
        {badge && (
          <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {badge.label}
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{active.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "active users" : "virkir notendur"}
        </p>
      </div>
      {!compact && (
        <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) pt-2">
          <div>
            <p className="text-xs text-(--color-text-muted)">
              {lang === "EN" ? "Admins" : "Stjórnendur"}
            </p>
            <p className="text-sm font-semibold text-(--color-text)">{admins}</p>
          </div>
          <div>
            <p className="text-xs text-(--color-text-muted)">
              {lang === "EN" ? "Users" : "Notendur"}
            </p>
            <p className="text-sm font-semibold text-(--color-text)">{users}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCK_ROUTE_LABELS: Record<string, { is: string; en: string }> = {
  "/invoices":       { is: "Reikningar",      en: "Invoices" },
  "/invoices/":      { is: "Reikningar",      en: "Invoices" },
  "/askrift":        { is: "Áskrift",          en: "Subscription" },
  "/askrift/yfirlit":{ is: "Áskrift",          en: "Subscription" },
  "/hosting":        { is: "Hýsing",           en: "Hosting" },
  "/pos":            { is: "POS",              en: "POS" },
  "/dkone":          { is: "dkOne",            en: "dkOne" },
  "/dkplus":         { is: "dkPlus",           en: "dkPlus" },
  "/timeclock":      { is: "Stimpilklukka",   en: "Timeclock" },
  "/timeclock/":     { is: "Stimpilklukka",   en: "Timeclock" },
  "/notendur":       { is: "Notendur",         en: "Users" },
  "/god":            { is: "Kerfisstjórnun",  en: "System Admin" },
  "/god/":           { is: "Kerfisstjórnun",  en: "System Admin" },
};

function SystemPreview({ compact, lang }: { compact?: boolean; lang: Lang }) {
  const { data: locks, isLoading, isError } = useQuery({
    queryKey: ["maintenance-locks"],
    queryFn: fetchMaintenanceLocks,
    refetchInterval: 30_000,
  });

  if (isLoading) return <Loading />;
  if (isError) return <Err lang={lang} />;

  const activeLocks = locks ?? [];

  return (
    <div className="space-y-2.5">
      <div>
        {activeLocks.length > 0 ? (
          <span className="mb-1 inline-block rounded-md bg-(--color-warning-bg) px-2 py-0.5 text-xs font-semibold text-(--color-warning)">
            {activeLocks.length} {activeLocks.length === 1
              ? (lang === "EN" ? "lock active" : "lás virkur")
              : (lang === "EN" ? "locks active" : "lásir virkir")}
          </span>
        ) : (
          <span className="mb-1 inline-block rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-semibold text-(--color-success)">
            {lang === "EN" ? "No maintenance" : "Ekkert viðhald"}
          </span>
        )}
        <p className="text-2xl font-bold text-(--color-text)">{activeLocks.length}</p>
        <p className="text-xs text-(--color-text-muted)">
          {lang === "EN" ? "active maintenance locks" : "virkir viðhaldslásir"}
        </p>
      </div>
      {!compact && activeLocks.length > 0 && (
        <ul className="space-y-1 border-t border-(--color-border) pt-2">
          {activeLocks.slice(0, 3).map((lock) => (
            <li key={lock.route} className="flex items-start gap-1.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-warning)" />
              <div className="min-w-0">
                <span className="text-xs font-medium text-(--color-text-secondary)">
                  {LOCK_ROUTE_LABELS[lock.route]?.[lang === "EN" ? "en" : "is"] ?? lock.route}
                </span>
                {lock.message && (
                  <p className="truncate text-xs text-(--color-text-muted)">{lock.message}</p>
                )}
              </div>
            </li>
          ))}
          {activeLocks.length > 3 && (
            <li className="text-xs text-(--color-text-muted)">{more(activeLocks.length - 3, lang)}</li>
          )}
        </ul>
      )}
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function CardPreview({ id, fallback, compact }: { id: string; fallback: ReactNode; compact?: boolean }) {
  const lang = useLangStore((s) => s.lang) as Lang;
  switch (id) {
    case "company":       return <CompanyPreview compact={compact} lang={lang} />;
    case "reikningar":    return <ReikningarPreview compact={compact} lang={lang} />;
    case "pos":           return <PosPreview compact={compact} lang={lang} />;
    case "dkone":         return <DkOnePreview compact={compact} lang={lang} />;
    case "hysing":        return <HysingPreview compact={compact} lang={lang} />;
    case "askrift":       return <AskriftPreview compact={compact} lang={lang} />;
    case "dkplus":        return <DkPlusPreview compact={compact} lang={lang} />;
    case "stimpilklukka": return <StimpilklukkaPreview compact={compact} lang={lang} />;
    case "notendur":      return <NotendurPreview compact={compact} lang={lang} />;
    case "system":        return <SystemPreview compact={compact} lang={lang} />;
    default:              return <>{fallback}</>;
  }
}
