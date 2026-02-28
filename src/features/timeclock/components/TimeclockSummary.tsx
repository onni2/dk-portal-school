/**
 * Shows three summary stats: how many employees are clocked in, clocked out, and total work hours logged today.
 * Uses: @/shared/components/Card, ../api/timeclock.queries
 * Exports: TimeclockSummary
 */
import { Card } from "@/shared/components/Card";
import { useTimeclockEmployees } from "../api/timeclock.queries";
import { useTimeclockEntries } from "../api/timeclock.queries";

/**
 *
 */
export function TimeclockSummary() {
  const { data: employees } = useTimeclockEmployees();
  const { data: entries } = useTimeclockEntries();

  const clockedIn = employees.filter((e) => e.StampStatus === 1).length;
  const clockedOut = employees.filter((e) => e.StampStatus === -1).length;

  const today = new Date().toDateString();
  const todayEntries = entries.filter(
    (e) => new Date(e.Start).toDateString() === today,
  );
  const closedToday = todayEntries.filter((e) => e.End !== null);
  const totalMinutes = closedToday.reduce(
    (sum, e) => sum + e.TotalHours * 60 + e.TotalMinutes,
    0,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Innskráðir
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--color-success)]">
          {clockedIn}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Útskráðir
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--color-text-muted)]">
          {clockedOut}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Vinnustundir í dag
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">
          {hours}k {minutes}m
        </p>
      </Card>
    </div>
  );
}
