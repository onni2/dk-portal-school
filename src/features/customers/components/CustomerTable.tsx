/**
 * Renders a table of all customers with their number, name, email, phone, and city.
 * Uses: @/shared/components/Table, ../types/customers.types, ../api/customers.queries
 * Exports: CustomerTable
 */
import { Table, type Column } from "@/shared/components/Table";
import type { Customer } from "../types/customers.types";
import { useCustomers } from "../api/customers.queries";

const columns: Column<Customer>[] = [
  {
    header: "Númer",
    accessor: (c) => c.Number,
    className: "font-mono text-xs text-[var(--color-text-secondary)]",
  },
  {
    header: "Nafn",
    accessor: (c) => c.Name,
    className: "font-medium text-[var(--color-text)]",
  },
  {
    header: "Netfang",
    accessor: (c) => c.Email || "—",
    hideBelow: "md",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Sími",
    accessor: (c) => c.Phone || "—",
    hideBelow: "lg",
    className: "text-[var(--color-text-secondary)]",
  },
  {
    header: "Staður",
    accessor: (c) => c.City || "—",
    hideBelow: "lg",
    className: "text-[var(--color-text-secondary)]",
  },
];

/**
 *
 */
export function CustomerTable() {
  const { data: customers } = useCustomers();

  return (
    <Table
      columns={columns}
      data={customers}
      keyFn={(c) => c.Number}
      emptyMessage="Engir viðskiptavinir fundust."
      footer={`${customers.length} viðskiptavinir`}
    />
  );
}
