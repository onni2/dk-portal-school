/**
 * Slide-over panel for viewing and editing a portal user's permissions.
 * Opens from the right when a user row is clicked. Allows toggling permissions and deleting the user.
 * Uses: @/shared/components/Button,
 *       ../api/permissions.api, ../store/users.store, ../types/user-permissions.types
 * Exports: UserPanel
 */
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/Button";
import { loadUserPermissions, saveUserPermissions, DEFAULT_PERMISSIONS } from "../api/permissions.api";
import { removeUser } from "../api/users.api";
import { useInvalidatePermissions, useInvalidateUsers } from "../api/users.queries";
import type { UserPermissions } from "../types/user-permissions.types";
import type { PortalUser } from "../types/users.types";

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string; description: string }[] = [
  { key: "invoices", label: "Reikningsyfirlit", description: "Sér reikninga frá DK Hugbúnaði" },
  { key: "subscription", label: "Áskrift", description: "Sér og stjórnar áskrift fyrirtækisins" },
  { key: "hosting", label: "Hýsing", description: "Getur séð og stjórnað hýsingaraðgangi" },
  { key: "pos", label: "POS", description: "Aðgangur að kassakerfi" },
  { key: "dkOne", label: "dkOne", description: "Aðgangur að dkOne lausninni" },
  { key: "dkPlus", label: "dkPlus", description: "Aðgangur að dkPlus lausninni" },
  { key: "timeclock", label: "Stimpilklukka", description: "Aðgangur að stimpilklukku" },
  { key: "users", label: "Notendur", description: "Getur stjórnað öðrum notendum" },
];

interface Props {
  user: PortalUser;
  onClose: () => void;
}

export function UserPanel({ user, onClose }: Props) {
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const invalidatePermissions = useInvalidatePermissions();
  const invalidateUsers = useInvalidateUsers();

  useEffect(() => {
    loadUserPermissions(user.id)
      .then(setPermissions)
      .catch(() => setPermissions(DEFAULT_PERMISSIONS));
  }, [user.id]);

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveUserPermissions(user.id, permissions);
      invalidatePermissions(user.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Ertu viss um að þú viljir eyða ${user.name}?`)) return;
    setDeleting(true);
    try {
      await removeUser(user.id);
      void invalidateUsers();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-xl)] bg-(--color-surface) shadow-xl max-h-[calc(100vh-4rem)] overflow-hidden">
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
            className="rounded-[var(--radius-md)] p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Permissions */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Aðgangur að einingum
          </h3>
          <div className="space-y-3">
            {PERMISSION_LABELS.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border border-(--color-border) p-4 transition-colors hover:bg-(--color-surface-hover)"
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
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Eyði..." : "Eyða notanda"}
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="w-28">
              Hætta við
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-28">
              {saving ? "Vista..." : "Vista"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
