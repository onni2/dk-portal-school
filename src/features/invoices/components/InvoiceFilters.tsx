import { cn } from "@/shared/utils/cn";
import { DatePicker } from "@/shared/components/DatePicker";
import { useInvoiceFilters } from "../store/invoices.store";

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

const PERIODS = [
  { key: "month" as const, label: "Mánuður" },
  { key: "6months" as const, label: "6 mánuðir" },
  { key: "thisYear" as const, label: "Þetta ár" },
  { key: "lastYear" as const, label: "Síðasta ár" },
];

export function InvoiceFilters() {
  const {
    dateFrom,
    dateTo,
    activePeriod,
    search,
    setDateFrom,
    setDateTo,
    setActivePeriod,
    setSearch,
    clearFilters,
  } = useInvoiceFilters();

  const hasFilters = !!(dateFrom || dateTo || search);

  function handlePeriod(key: (typeof PERIODS)[number]["key"]) {
    const now = new Date();
    let from: Date;
    let to: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (key === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (key === "6months") {
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    } else if (key === "thisYear") {
      from = new Date(now.getFullYear(), 0, 1);
    } else {
      from = new Date(now.getFullYear() - 1, 0, 1);
      to = new Date(now.getFullYear() - 1, 11, 31);
    }

    setDateFrom(toDateString(from));
    setDateTo(toDateString(to));
    setActivePeriod(key);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Period buttons */}
      <div>
        <p className="mb-2 text-sm font-bold text-(--color-primary)">Veldu tímabil</p>
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePeriod(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activePeriod === key
                  ? "bg-(--color-primary) text-white"
                  : "border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-hover)",
              )}
            >
              {label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-(--color-text-muted) transition-colors hover:text-(--color-text-secondary)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Hreinsaðu síur
            </button>
          )}
        </div>
      </div>

      {/* Date pickers + Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo || undefined}
          />
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom || undefined}
          />
        </div>
        <div className="relative w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Leita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-(--color-border) bg-(--color-surface) py-1.5 pl-9 pr-3 text-sm text-(--color-text) placeholder:text-(--color-text-muted)"
          />
        </div>
      </div>
    </div>
  );
}
