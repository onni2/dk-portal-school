/**
 * Renders a table of the 20 most recent timeclock entries with employee name, date, clock-in/out times, hours, project, and status.
 * Uses: @/shared/components/Badge, @/shared/components/Table, ../types/timeclock.types, ../api/timeclock.queries
 * Exports: TimeclockEntries
 */
import { Badge } from "@/shared/components/Badge";
import { Table, type Column } from "@/shared/components/Table";
import type { TimeclockEntry } from "../types/timeclock.types";
import { useTimeclockEntries } from "../api/timeclock.queries";

/**
 *
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("is-IS");
}

/**
 *
 */
function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("is-IS", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 *
 */
function formatHours(entry: TimeclockEntry): string {
  if (entry.End === null) return "—";
  return `${entry.TotalHours}k ${entry.TotalMinutes}m`;
}

const columns: Column<TimeclockEntry>[] = [
  {
    header: "Starfsmaður",
    accessor: (e) => e.EmployeeName,
    className: "font-medium text-[var(--color-text)]",
  },
  {
    header: "Dagsetning",
    accessor: (e) => formatDate(e.Start),
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Inn",
    accessor: (e) => formatTime(e.Start),
  },
  {
    header: "Út",
    accessor: (e) => formatTime(e.End),
  },
  {
    header: "Tímar",
    accessor: (e) => formatHours(e),
  },
  {
    header: "Verk",
    accessor: (e) => e.Project || "—",
    hideBelow: "md",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Athugasemd",
    accessor: (e) => e.Comment || "—",
    hideBelow: "lg",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Staða",
    accessor: (e) => (
      <Badge variant={e.Processed ? "default" : e.End ? "info" : "success"}>
        {e.Processed ? "Afgreidd" : e.End ? "Lokað" : "Opin"}
      </Badge>
    ),
  },
];

/**
 *
 */
export function TimeclockEntries() {
  const { data: entries } = useTimeclockEntries();

  const sorted = [...entries]
    .sort(
      (a, b) => new Date(b.Start).getTime() - new Date(a.Start).getTime(),
    )
    .slice(0, 20);

  return (
    <Table
      columns={columns}
      data={sorted}
      keyFn={(e) => e.ID}
      footer={`Sýni ${sorted.length} af ${entries.length} færslum`}
      emptyMessage="Engar stimpilfærslur fundust."
    />
  );
}
