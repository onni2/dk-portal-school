/**
 * Table of portal users — shows name, email, hosting username and read-only permission checkmarks.
 * Clicking a row opens the UserPanel modal for editing.
 * Uses: @/shared/components/Table, @/shared/components/Button,
 *       ../api/users.queries, ../store/users.store
 * Exports: UsersTable
 */
import { Table, type Column } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { useUsers } from "../api/users.queries";
import { useUsersStore } from "../store/users.store";
import type { PortalUser, UserPermissions } from "../types/users.types";

const PERMISSION_KEYS: { key: keyof UserPermissions; label: string }[] = [
  { key: "invoices", label: "Reikningsyfirlit" },
  { key: "subscription", label: "Áskrift" },
  { key: "hosting", label: "Hýsing" },
  { key: "pos", label: "POS" },
  { key: "dkOne", label: "dkOne" },
  { key: "dkPlus", label: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka" },
  { key: "users", label: "Notendur" },
];

function Checkmark({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return <span className="text-xs text-[var(--color-border)]">—</span>;
}

export function UsersTable() {
  const { data: users } = useUsers();
  const openUser = useUsersStore((s) => s.openUser);

  const columns: Column<PortalUser>[] = [
    {
      header: "Nafn",
      accessor: (u) => (
        <p className="text-(--color-text-secondary)">{u.Name}</p>
      ),
    },
    {
      header: "Netfang",
      accessor: (u) => u.Email
        ? <span className="text-(--color-text-secondary)">{u.Email}</span>
        : <span className="text-(--color-text-muted)">—</span>,
      hideBelow: "md",
    },
    ...PERMISSION_KEYS.map(({ key, label }) => ({
      header: label,
      accessor: (u: PortalUser) => (
        <div className="flex justify-center">
          <Checkmark checked={u.permissions[key]} />
        </div>
      ),
      hideBelow: "lg" as const,
    })),
    {
      header: "",
      accessor: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); openUser(u); }}
        >
          Breyta
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      keyFn={(u) => u.Number}
      footer={`${users.length} notendur`}
      emptyMessage="Engir notendur fundust."
      onRowClick={(u) => openUser(u)}
    />
  );
}
