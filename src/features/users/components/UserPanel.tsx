import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import {
  saveUserPermissions,
  DEFAULT_PERMISSIONS,
} from "../api/permissions.api";
import { removeUser } from "../api/users.api";
import {
  permissionsQueryOptions,
  useInvalidateUsers,
  useInvalidatePermissions,
} from "../api/users.queries";
import { useLicence } from "@/features/licence/api/licence.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";
import type { PortalUser } from "../types/users.types";

const PERMISSION_LABELS: {
  key: keyof UserPermissions;
  label: string;
  description: string;
  licenceModule?: keyof LicenceResponse;
}[] = [
  {
    key: "invoices",
    label: "Reikningsyfirlit",
    description: "Sér reikninga frá DK Hugbúnaði",
  },
  {
    key: "subscription",
    label: "Áskrift",
    description: "Sér og stjórnar áskrift fyrirtækisins",
  },
  {
    key: "hosting",
    label: "Hýsingarstjórnun",
    description: "Getur séð og stjórnað hýsingaraðgangi",
    licenceModule: "Hosting",
  },
  {
    key: "pos",
    label: "POS",
    description: "Aðgangur að kassakerfi",
    licenceModule: "POS",
  },
  {
    key: "dkOne",
    label: "dkOne",
    description: "Aðgangur að dkOne lausninni",
    licenceModule: "dkOne",
  },
  {
    key: "dkPlus",
    label: "dkPlus",
    description: "Aðgangur að dkPlus lausninni",
    licenceModule: "dkPlus",
  },
  {
    key: "timeclock",
    label: "Stimpilklukka",
    description: "Aðgangur að stimpilklukku",
    licenceModule: "TimeClock",
  },
  {
    key: "users",
    label: "Notendur",
    description: "Getur stjórnað öðrum notendum",
  },
];

interface Props {
  user: PortalUser;
  onClose: () => void;
}

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Villa kom upp";
}

function formatKennitala(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 10) {
    return value;
  }

  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

export function UserPanel({ user, onClose }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const companyId = useAuthStore((s) => s.user?.companyId);

  const invalidateUsers = useInvalidateUsers();
  const invalidatePermissions = useInvalidatePermissions();

  const { data: licence } = useLicence();

  const { data: loadedPermissions } = useQuery({
    ...permissionsQueryOptions(user.id, companyId),
    enabled: !!user.id && !!companyId,
  });

  const [permissionDraft, setPermissionDraft] = useState<{
    userId: string;
    value: UserPermissions;
  } | null>(null);

  const permissions =
    permissionDraft?.userId === user.id
      ? permissionDraft.value
      : loadedPermissions ?? user.permissions ?? DEFAULT_PERMISSIONS;

  const visiblePermissions = PERMISSION_LABELS.filter(({ licenceModule }) => {
    if (!licenceModule) return true;
    return isModuleEnabled(licence, licenceModule);
  });

  const isSelf = user.id === currentUser?.id;
  const isElevatedTarget = user.role === "super_admin" || user.role === "god";
  const canDeleteUser = !isSelf && !isElevatedTarget;

  function togglePermission(key: keyof UserPermissions) {
    setPermissionDraft({
      userId: user.id,
      value: {
        ...permissions,
        [key]: !permissions[key],
      },
    });
  }

  const savePermissionsMutation = useMutation({
    mutationFn: () => saveUserPermissions(user.id, permissions),
    onSuccess: async () => {
      await Promise.all([invalidateUsers(), invalidatePermissions(user.id)]);
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeUser(user.id),
    onSuccess: async () => {
      await invalidateUsers();
      onClose();
    },
  });

  function handleDelete() {
    if (!canDeleteUser) return;

    const confirmed = confirm(`Ertu viss um að þú viljir eyða ${user.name}?`);
    if (!confirmed) return;

    deleteMutation.mutate();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-4rem)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-(--color-surface) shadow-xl">
        <div className="flex items-start justify-between border-b border-(--color-border) p-6">
          <div>
            <h2 className="text-lg font-bold text-(--color-text)">
              {user.name}
            </h2>

            {user.email && (
              <p className="mt-0.5 text-sm text-(--color-text-muted)">
                {user.email}
              </p>
            )}

            {user.kennitala && (
              <p className="mt-1 font-mono text-xs text-(--color-text-muted)">
                {formatKennitala(user.kennitala)}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
            aria-label="Loka"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Aðgangur að einingum
          </h3>

          <div className="space-y-3">
            {visiblePermissions.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--color-border) p-4 transition-colors hover:bg-(--color-surface-hover)"
              >
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() => togglePermission(key)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-(--color-primary)"
                />

                <div>
                  <p className="text-sm font-medium text-(--color-text)">
                    {label}
                  </p>
                  <p className="text-xs text-(--color-text-muted)">
                    {description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {savePermissionsMutation.isError && (
            <p className="mt-4 text-sm text-(--color-error)">
              {getErrorMessage(savePermissionsMutation.error)}
            </p>
          )}

          {deleteMutation.isError && (
            <p className="mt-4 text-sm text-(--color-error)">
              {getErrorMessage(deleteMutation.error)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-(--color-border) p-6">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!canDeleteUser || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eyði..." : "Eyða notanda"}
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="w-28">
              Hætta við
            </Button>

            <Button
              onClick={() => savePermissionsMutation.mutate()}
              disabled={savePermissionsMutation.isPending}
              className="w-28"
            >
              {savePermissionsMutation.isPending ? "Vista..." : "Vista"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}