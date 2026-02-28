/**
 * Searchable, filterable grid of employee status cards. Lets an admin stamp any employee in or out.
 * Uses: @/shared/components/Button, @/shared/components/Input, ../api/timeclock.queries, ../api/timeclock.mutations, ../store/timeclock.store, ./EmployeeStatusCard
 * Exports: EmployeeStatusGrid
 */
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useTimeclockEmployees } from "../api/timeclock.queries";
import { useStampMutation } from "../api/timeclock.mutations";
import { useTimeclockFilters } from "../store/timeclock.store";
import { EmployeeStatusCard } from "./EmployeeStatusCard";

/**
 *
 */
export function EmployeeStatusGrid() {
  const { data: employees } = useTimeclockEmployees();
  const { search, statusFilter, setSearch, setStatusFilter } =
    useTimeclockFilters();
  const stampMutation = useStampMutation();

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      !search ||
      emp.Name.toLowerCase().includes(search.toLowerCase()) ||
      emp.Number.includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in" && emp.StampStatus === 1) ||
      (statusFilter === "out" && emp.StampStatus === -1);

    return matchesSearch && matchesStatus;
  });

  /**
   *
   */
  function handleStamp(employeeNumber: string) {
    stampMutation.mutate({ employeeNumber });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Leita að starfsmanni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Allir
          </Button>
          <Button
            variant={statusFilter === "in" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("in")}
          >
            Inni
          </Button>
          <Button
            variant={statusFilter === "out" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("out")}
          >
            Úti
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          Engir starfsmenn fundust.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => (
            <EmployeeStatusCard
              key={emp.Number}
              employee={emp}
              onStamp={handleStamp}
              isStamping={
                stampMutation.isPending &&
                stampMutation.variables?.employeeNumber === emp.Number
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
