/**
 * UsersTable.tsx
 *
 * Displays the portal users for the currently active company.
 *
 * This table is only responsible for showing:
 * - basic user information
 * - company role
 * - email
 * - permission checkmarks
 * - a "Breyta" button that opens UserPanel
 *
 */

import { Table, type Column } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { usePortalUsers } from "../api/users.queries";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";
import type { PortalUser } from "../types/users.types";

/**
 * Defines which permission columns can be shown in the table.
 *
 * `key` maps to the permission property returned from the backend.
 * `label` is the column title shown in the UI.
 * `licenceModule` means the column is only shown when that module is enabled
 * in the company's licence.
 */
const PERMISSION_KEYS: {
  key: keyof UserPermissions;
  label: string;
  licenceModule?: keyof LicenceResponse;
}[] = [
  { key: "invoices", label: "Reikningar" },
  { key: "subscription", label: "Áskrift" },
  { key: "hosting", label: "Hýsingarstjórnun", licenceModule: "Hosting" },
  { key: "pos", label: "POS", licenceModule: "POS" },
  { key: "dkOne", label: "dkOne", licenceModule: "dkOne" },
  { key: "dkPlus", label: "dkPlus", licenceModule: "dkPlus" },
  { key: "timeclock", label: "Stimpilkl.", licenceModule: "TimeClock" },
  { key: "users", label: "Notendur" },
];

/**
 * Checks whether a licensed module is enabled for the active company.
 *
 * The licence response uses module objects with an `Enabled` property.
 * If the module is missing or disabled, the related permission column is hidden.
 */
function isModuleEnabled(
  licence: LicenceResponse | undefined,
  module: keyof LicenceResponse,
): boolean {
  const entry = licence?.[module];

  return Boolean(
    entry &&
      typeof entry === "object" &&
      "Enabled" in entry &&
      entry.Enabled,
  );
}

/**
 * Converts the company role stored on the user into a readable Icelandic label.
 *
 * `companyRole` comes from user_companies.role.
 */
function getCompanyRoleLabel(user: PortalUser): string {
  if (user.companyRole === "admin") return "Stjórnandi";

  return "Notandi";
}

/**
 * Renders a centered permission indicator.
 *
 * Shows:
 * - a checkmark when the permission is true
 * - a dash when the permission is false
 *
 * This is used for every permission column in the table.
 */
function Checkmark({ checked }: { checked: boolean }) {
  return (
    <div className="flex justify-center">
      {checked ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-(--color-surface-hover)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-(--color-primary)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      ) : (
        <span className="inline-flex h-6 w-6 items-center justify-center text-(--color-border)">
          —
        </span>
      )}
    </div>
  );
}

/**
 * Props for UsersTable.
 *
 * `onSelectUser` is called when a user row or the Breyta button is clicked.
 * The parent page uses this to open UserPanel for the selected user.
 */
interface Props {
  onSelectUser: (user: PortalUser) => void;
}

/**
 * Displays all portal users for the active company.
 *
 * Data sources:
 * - `usePortalUsers()` loads users from GET /users
 * - `useLicence()` loads company licence information
 *
 * The table dynamically hides permission columns for modules that are not
 * enabled in the company's licence.
 */
export function UsersTable({ onSelectUser }: Props) {
  const { data: users = [], isLoading, error } = usePortalUsers();
  const { data: licence } = useLicence();

  /**
   * Only show permission columns that are allowed by the company's licence.
   *
   * Permissions without `licenceModule` are always visible.
   * Permissions with `licenceModule` are only visible when that module is enabled.
   */
  const visiblePermissions = PERMISSION_KEYS.filter(({ licenceModule }) => {
    if (!licenceModule) return true;

    return isModuleEnabled(licence, licenceModule);
  });

  /**
   * Column configuration for the shared Table component.
   *
   * Each column defines:
   * - `header`: column title
   * - `accessor`: how the cell is rendered
   * - `hideBelow`: optional responsive hiding rule
   */
  const columns: Column<PortalUser>[] = [
    {
      header: "Notandi",
      headerClassName: "pl-5",
      className: "pl-5",
      accessor: (u) => (
        <span  className="text-sm text-(--color-text-secondary)">
          {u.name}
        </span>
      ),
    },
    {
      header: "Hlutverk",
      accessor: (u) => (
        <span  className="text-sm text-(--color-text-secondary)">
          {getCompanyRoleLabel(u)}
        </span>
      ),
      hideBelow: "md",
    },
    {
      header: "Netfang",
      headerClassName: "pl-15",
      className: "pl-15",
      accessor: (u) =>
        u.email ? (
          <span className="text-sm text-(--color-text-secondary)">
            {u.email}
          </span>
        ) : (
          <span className="text-sm text-(--color-text-muted)">—</span>
        ),
      hideBelow: "md",
    },

    /**
     * Creates one table column per visible permission.
     *
     * Example:
     * - invoices -> Reikningar
     * - hosting -> Hýsing
     * - users -> Notendur
     */
    ...visiblePermissions.map(({ key, label }) => ({
      header: label,
      headerClassName: "text-center",
      className: "text-center",
      accessor: (u: PortalUser) => (
        <Checkmark checked={u.permissions?.[key] ?? false} />
      ),
      hideBelow: "lg" as const,
    })),

    {
      header: "",
      accessor: (u) => (
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              /**
               * Prevents the row click and button click from both firing.
               *
               * Without this, clicking the button could trigger duplicate
               * open actions.
               */
              e.stopPropagation();
              onSelectUser(u);
            }}
          >
            Breyta
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <p className="text-sm text-(--color-text-muted)">Hleður notendum...</p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-(--color-error)">
        Villa við að sækja notendur.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
      <Table
        columns={columns}
        data={users}
        keyFn={(u) => u.id}
        noBorder
        emptyMessage="Engir notendur fundust."
        onRowClick={(u) => onSelectUser(u)}
      />
    </div>
  );
}