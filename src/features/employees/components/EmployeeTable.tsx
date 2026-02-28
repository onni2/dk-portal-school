/**
 * Renders a table of all employees with their number, name, email, phone numbers, and active/inactive status badge.
 * Uses: @/shared/components/Badge, @/shared/components/Table, ../types/employees.types, ../api/employees.queries
 * Exports: EmployeeTable
 */
import { Badge } from "@/shared/components/Badge";
import { Table, type Column } from "@/shared/components/Table";
import type { Employee } from "../types/employees.types";
import { useEmployees } from "../api/employees.queries";

/**
 *
 */
const statusLabel = (status: number) =>
  status === 0 ? "Virk(ur)" : "Óvirk(ur)";

const columns: Column<Employee>[] = [
  {
    header: "Númer",
    accessor: (emp) => emp.Number,
    className: "font-mono text-xs text-[var(--color-text-secondary)]",
  },
  {
    header: "Nafn",
    accessor: (emp) => emp.Name,
    className: "font-medium text-[var(--color-text)]",
  },
  {
    header: "Netfang",
    accessor: (emp) => emp.Email || "—",
    hideBelow: "md",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Sými",
    accessor: (emp) => emp.Phone || "—",
    hideBelow: "lg",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Farsími",
    accessor: (emp) => emp.PhoneMobile || "—",
    hideBelow: "lg",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Staða",
    accessor: (emp) => (
      <Badge variant={emp.Status === 0 ? "success" : "error"}>
        {statusLabel(emp.Status)}
      </Badge>
    ),
  },
];

/**
 *
 */
export function EmployeeTable() {
  const { data: employees } = useEmployees();

  return (
    <Table
      columns={columns}
      data={employees}
      keyFn={(emp) => emp.Number}
      footer={`${employees.length} starfsmenn`}
    />
  );
}
