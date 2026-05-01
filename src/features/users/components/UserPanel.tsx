import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { loadUserPermissions, saveUserPermissions, DEFAULT_PERMISSIONS } from "../api/permissions.api";
import { removeUser, updateUserHosting } from "../api/users.api";
import { hostingAccountsQueryOptions } from "@/features/hosting/api/hosting.queries";
import { permissionsQueryOptions } from "../api/users.queries";
import { useInvalidateUsers } from "../api/users.queries";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";
import type { PortalUser } from "../types/users.types";

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string; description: string; licenceModule?: keyof LicenceResponse }[] = [
  { key: "invoices", label: "Reikningsyfirlit", description: "Sér reikninga frá DK Hugbúnaði" },
  { key: "subscription", label: "Áskrift", description: "Sér og stjórnar áskrift fyrirtækisins", licenceModule: "dkPlus" },
  { key: "hosting", label: "Hýsing", description: "Getur séð og stjórnað hýsingaraðgangi", licenceModule: "Hosting" },
  { key: "pos", label: "POS", description: "Aðgangur að kassakerfi", licenceModule: "POS" },
  { key: "dkOne", label: "dkOne", description: "Aðgangur að dkOne lausninni", licenceModule: "dkOne" },
  { key: "dkPlus", label: "dkPlus", description: "Aðgangur að dkPlus lausninni", licenceModule: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka", description: "Aðgangur að stimpilklukku", licenceModule: "TimeClock" },
  { key: "users", label: "Notendur", description: "Getur stjórnað öðrum notendum" },
];

interface Props {
  user: PortalUser;
  onClose: () => void;
}

export function UserPanel({ user, onClose }: Props) {
  const qc = useQueryClient();
  const invalidateUsers = useInvalidateUsers();
  const { data: licence } = useLicence();
  const { data: loadedPermissions } = useQuery(permissionsQueryOptions(user.id));
  const { data: hostingAccounts = [] } = useQuery(hostingAccountsQueryOptions);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [selectedHosting, setSelectedHosting] = useState<string>(user.hostingUsername ?? "");

  useEffect(() => {
    if (loadedPermissions) setPermissions(loadedPermissions);
  }, [loadedPermissions]);

  const visiblePermissions = PERMISSION_LABELS.filter(({ licenceModule }) => {
    if (!licenceModule) return true;
    const entry = licence?.[licenceModule];
    return entry && typeof entry === "object" && "Enabled" in entry && entry.Enabled;
  });

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const saveMutation = useMutation({
    mutationFn: () => saveUserPermissions(user.id, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-permissions", user.id] });
      onClose();
    },
  });

  const saveHostingMutation = useMutation({
    mutationFn: () => updateUserHosting(user.id, selectedHosting || null),
    onSuccess: () => void invalidateUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!confirm(`Ertu viss um að þú viljir eyða ${user.name}?`)) return Promise.resolve();
      return removeUser(user.id);
    },
    onSuccess: () => {
      void invalidateUsers();
      onClose();
    },
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-(--color-surface) shadow-xl max-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-(--color-border) p-6">
          <div>
            <h2 className="text-lg font-bold text-(--color-text)">{user.name}</h2>
            {user.email && (
              <p className="mt-0.5 text-sm text-(--color-text-muted)">{user.email}</p>
            )}
            {user.kennitala && (
              <p className="mt-1 font-mono text-xs text-(--color-text-muted)">{user.kennitala}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hosting account */}
        <div className="border-b border-(--color-border) px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Hýsingaraðgangur
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedHosting}
              onChange={(e) => setSelectedHosting(e.target.value)}
              className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            >
              <option value="">Enginn hýsingaraðgangur</option>
              {hostingAccounts.map((a) => (
                <option key={a.id} value={a.username}>
                  {a.displayName} ({a.username})
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => saveHostingMutation.mutate()}
              disabled={saveHostingMutation.isPending || selectedHosting === (user.hostingUsername ?? "")}
            >
              {saveHostingMutation.isPending ? "Vista..." : "Vista"}
            </Button>
          </div>
        </div>

        {/* Permissions */}
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
                  <p className="text-sm font-medium text-(--color-text)">{label}</p>
                  <p className="text-xs text-(--color-text-muted)">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-(--color-border) p-6">
          <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Eyði..." : "Eyða notanda"}
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="w-28">
              Hætta við
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-28">
              {saveMutation.isPending ? "Vista..." : "Vista"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
