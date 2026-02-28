/**
 * Small live-data preview components, one per dashboard card type.
 * Each fetches just enough data to show a useful snapshot inside the card.
 * Uses: @tanstack/react-query, feature api functions
 * Exports: CardPreview
 */
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerTransactions } from "@/features/invoices/api/invoices.api";
import { fetchTimeclockEmployees } from "@/features/timeclock/api/timeclock.api";
import { fetchEmployees } from "@/features/employees/api/employees.api";
import { fetchCustomers } from "@/features/customers/api/customers.api";
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

/**
 *
 */
function Loading() {
  return <p className="text-xs text-gray-400">Hleð...</p>;
}

/**
 *
 */
function Err() {
  return <p className="text-xs text-red-300">Tókst ekki að sækja gögn</p>;
}

/**
 *
 */
function ReikningarPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: fetchCustomerTransactions,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const unsettled = data.filter((t) => !t.Settled);
  const recent = data.slice(0, 3);

  return (
    <div className="space-y-1">
      {unsettled.length > 0 && (
        <p className="text-xs font-medium text-orange-500">
          {unsettled.length} ógreiddir reikningar
        </p>
      )}
      {recent.map((t) => (
        <div key={t.ID} className="flex justify-between text-xs text-gray-600">
          <span className="truncate">{t.InvoiceNumber || t.Text}</span>
          <span className="ml-2 shrink-0 font-medium">
            {t.Amount.toLocaleString("is-IS")} kr.
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 *
 */
function StimpilklukkaPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeclock-preview"],
    queryFn: fetchTimeclockEmployees,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const clockedIn = data.filter((e) => e.StampStatus === 1);
  const clockedOut = data.filter((e) => e.StampStatus !== 1);

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400">
        {clockedIn.length} inni · {clockedOut.length} úti
      </p>
      {clockedIn.slice(0, 3).map((e) => (
        <div key={e.Number} className="flex items-center gap-1.5 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-gray-700">{e.Name}</span>
        </div>
      ))}
      {clockedIn.length > 3 && (
        <p className="text-xs text-gray-400">+{clockedIn.length - 3} fleiri</p>
      )}
    </div>
  );
}

/**
 *
 */
function StarfsmennPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees-preview"],
    queryFn: fetchEmployees,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  const active = data.filter((e) => e.Status === 0);

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400">{active.length} starfsmenn</p>
      {active.slice(0, 3).map((e) => (
        <p key={e.Number} className="text-xs text-gray-700">
          {e.Name}
        </p>
      ))}
      {active.length > 3 && (
        <p className="text-xs text-gray-400">+{active.length - 3} fleiri</p>
      )}
    </div>
  );
}

/**
 *
 */
function VidskiptavinirPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers-preview"],
    queryFn: fetchCustomers,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <Err />;

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400">{data.length} viðskiptavinir</p>
      {data.slice(0, 3).map((c) => (
        <p key={c.Number} className="text-xs text-gray-700">
          {c.Name}
        </p>
      ))}
      {data.length > 3 && (
        <p className="text-xs text-gray-400">+{data.length - 3} fleiri</p>
      )}
    </div>
  );
}

/**
 *
 */
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
    return ("Enabled" in mod && mod.Enabled) || ("PurchaseOrders" in mod && mod.PurchaseOrders);
  });

  return (
    <div className="flex flex-wrap gap-1">
      {active.map(([key, label]) => (
        <span
          key={key}
          className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
        >
          {label}
        </span>
      ))}
      {active.length === 0 && (
        <p className="text-xs text-gray-400">Engin virk leyfi</p>
      )}
    </div>
  );
}

/**
 * Dispatches to the correct preview component based on card id.
 * Returns null for cards with no live preview.
 */
export function CardPreview({ id }: { id: string }) {
  switch (id) {
    case "reikningar":
      return <ReikningarPreview />;
    case "stimpilklukka":
      return <StimpilklukkaPreview />;
    case "starfsmenn":
      return <StarfsmennPreview />;
    case "vidskiptavinir":
      return <VidskiptavinirPreview />;
    case "leyfi":
      return <LeyfиPreview />;
    default:
      return null;
  }
}
