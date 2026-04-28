/**
 * Table of portal users — shows name, email, and permission checkmarks.
 * Clicking a row opens the UserPanel modal for editing.
 * Uses: @/shared/components/Table, @/shared/components/Button,
 *       ../api/users.queries, ../api/permissions.api
 * Exports: UsersTable
 */
import { useQueries } from "@tanstack/react-query";
import { Table, type Column } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { usePortalUsers, permissionsQueryOptions } from "../api/users.queries";
import { DEFAULT_PERMISSIONS } from "../api/permissions.api";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";
import type { PortalUser } from "../types/users.types";

const PERMISSION_KEYS: { key: keyof UserPermissions; label: string; licenceModule?: keyof LicenceResponse }[] = [
  { key: "invoices", label: "Reikningsyfirlit" },
  { key: "subscription", label: "Áskrift", licenceModule: "dkPlus" },
  { key: "hosting", label: "Hýsing", licenceModule: "Hosting" },
  { key: "pos", label: "POS", licenceModule: "POS" },
  { key: "dkOne", label: "dkOne", licenceModule: "dkOne" },
  { key: "dkPlus", label: "dkPlus", licenceModule: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka", licenceModule: "TimeClock" },
  { key: "users", label: "Notendur" },
];

function Checkmark({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-(--color-primary)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return <span className="text-(--color-border)">—</span>;
}

interface Props {
  onSelectUser: (user: PortalUser) => void;
}

export function UsersTable({ onSelectUser }: Props) {
  const { data: users = [], isLoading } = usePortalUsers();
  const { data: licence } = useLicence();

  const visiblePermissions = PERMISSION_KEYS.filter(({ licenceModule }) => {
    if (!licenceModule) return true;
    const entry = licence?.[licenceModule];
    return entry && typeof entry === "object" && "Enabled" in entry && entry.Enabled;
  });

  const permissionResults = useQueries({
    queries: users.map((u) => permissionsQueryOptions(u.id)),
  });

  const permissionsMap = Object.fromEntries(
    users.map((u, i) => [u.id, permissionResults[i]?.data ?? DEFAULT_PERMISSIONS]),
  );

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
    ...visiblePermissions.map(({ key, label }) => ({
      header: label,
      accessor: (u: PortalUser) => <Checkmark checked={permissionsMap[u.id]?.[key] ?? false} />,
      hideBelow: "lg" as const,
    })),
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
