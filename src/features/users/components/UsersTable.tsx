/**
 * Table of portal users — shows name, email, role, and status.
 * Clicking a row opens the UserPanel for editing permissions.
 * Uses: @/shared/components/Table, @/shared/components/Button,
 *       ../api/users.queries
 * Exports: UsersTable
 */
import { Table, type Column } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { usePortalUsers } from "../api/users.queries";
import type { PortalUser } from "../types/users.types";

interface Props {
  onSelectUser: (user: PortalUser) => void;
}

export function UsersTable({ onSelectUser }: Props) {
  const { data: users = [], isLoading } = usePortalUsers();

  const columns: Column<PortalUser>[] = [
    {
      header: "Nafn",
      accessor: (u) => <p className="text-(--color-text-secondary)">{u.name}</p>,
    },
    {
      header: "Netfang",
      accessor: (u) =>
        u.email
          ? <span className="text-(--color-text-secondary)">{u.email}</span>
          : <span className="text-(--color-text-muted)">—</span>,
      hideBelow: "md",
    },
    {
      header: "Hlutverk",
      accessor: (u) => <span className="text-(--color-text-secondary)">{u.role}</span>,
      hideBelow: "md",
    },
    {
      header: "Staða",
      accessor: (u) => (
        <span className={u.status === "active" ? "text-green-600" : "text-(--color-text-muted)"}>
          {u.status === "active" ? "Virkur" : "Í bið"}
        </span>
      ),
      hideBelow: "lg",
    },
    {
      header: "",
      accessor: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onSelectUser(u); }}
        >
          Breyta
        </Button>
      ),
    },
  ];

  if (isLoading) return <p className="text-sm text-(--color-text-muted)">Hleður notendum...</p>;

  return (
    <Table
      columns={columns}
      data={users}
      keyFn={(u) => u.id}
      footer={`${users.length} notendur`}
      emptyMessage="Engir notendur fundust."
      onRowClick={(u) => onSelectUser(u)}
    />
  );
}
