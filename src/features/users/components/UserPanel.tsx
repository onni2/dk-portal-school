/**
 * Slide-over panel for viewing and editing a portal user's permissions.
 * Opens from the right when a user row is clicked. Allows toggling permissions and deleting the user.
 * Uses: @/shared/components/Button,
 *       ../api/users.api, ../store/users.store
 * Exports: UserPanel
 */
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { updateUserPermissions, deleteUser } from "../api/users.api";
import { useUsersStore } from "../store/users.store";
import type { UserPermissions } from "../types/users.types";

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

export function UserPanel() {
  const { selectedUser, closeUser } = useUsersStore();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState(selectedUser?.permissions);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPermissions(selectedUser?.permissions);
  }, [selectedUser]);

  if (!selectedUser || !permissions) return null;

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => prev && { ...prev, [key]: !prev[key] });
  }

  async function handleSave() {
    if (!permissions) return;
    setSaving(true);
    await updateUserPermissions(selectedUser!.Number, permissions);
    await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    setSaving(false);
    closeUser();
  }

  async function handleDelete() {
    if (!confirm(`Ertu viss um að þú viljir eyða ${selectedUser!.Name}?`)) return;
    setDeleting(true);
    await deleteUser(selectedUser!.Number);
    await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    setDeleting(false);
    closeUser();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={closeUser}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-xl max-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] p-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {selectedUser.Name}
            </h2>
            {selectedUser.Email && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                {selectedUser.Email}
              </p>
            )}
            {selectedUser.SSNumber && (
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                {selectedUser.SSNumber}
              </p>
            )}
          </div>
          <button
            onClick={closeUser}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Permissions */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Aðgangur að einingum
          </h3>
          <div className="space-y-3">
            {PERMISSION_LABELS.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() => togglePermission(key)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[var(--color-primary)]"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] p-6">
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Eyði..." : "Eyða notanda"}
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeUser} className="w-28">
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
