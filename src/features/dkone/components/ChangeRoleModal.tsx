/**
 * Modal for changing the dkOne role of an existing user, with an extra confirmation step for the owner role.
 * Uses: @/shared/components/Button, ../api/dkone.api, ../api/dkone.queries
 * Exports: ChangeRoleModal
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { updateDkOneRole } from "../api/dkone.api";
import { dkOneUsersQueryOptions } from "../api/dkone.queries";
import type { DkOneRole } from "../types/dkone.types";

const ROLES: { value: DkOneRole; label: string; description: string }[] = [
  { value: "owner", label: "Eigandi", description: "Fullar stjórnunarréttindi" },
  { value: "admin", label: "Stjórnandi", description: "Getur stjórnað notendum" },
  { value: "user", label: "Notandi", description: "Venjulegur aðgangur" },
];

interface Props {
  userId: string;
  userName: string;
  currentRole: DkOneRole;
  onClose: () => void;
}

/** Displays the three dkOne roles as selectable cards and saves the chosen role; prompts for extra confirmation before granting owner. */
export function ChangeRoleModal({ userId, userName, currentRole, onClose }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<DkOneRole>(currentRole);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectRole(role: DkOneRole) {
    setSelected(role);
    setOwnerConfirmed(false);
    setError(null);
  }

  async function handleSave() {
    if (selected === currentRole) { onClose(); return; }
    if (selected === "owner" && !ownerConfirmed) return;
    setLoading(true);
    setError(null);
    try {
      await updateDkOneRole(userId, selected);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      onClose();
    } catch {
      setError("Ekki tókst að breyta hlutverki. Reyndu aftur.");
    } finally {
      setLoading(false);
    }
  }

  const savingOwner = selected === "owner" && selected !== currentRole;
  const canSave = selected !== "owner" || ownerConfirmed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-(--color-surface) p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-(--color-text)">Breyta hlutverki</h2>
            <p className="text-sm text-(--color-text-secondary)">{userName}</p>
          </div>
          <button onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelectRole(role.value)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                selected === role.value
                  ? "border-(--color-primary) bg-(--color-primary)/8"
                  : "border-(--color-border) hover:border-(--color-text-muted)"
              }`}
            >
              <div>
                <p className={`text-sm font-medium ${selected === role.value ? "text-(--color-primary)" : "text-(--color-text)"}`}>
                  {role.label}
                </p>
                <p className="text-xs text-(--color-text-muted)">{role.description}</p>
              </div>
              {selected === role.value && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {savingOwner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
              Ertu viss um þetta?
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
              <span className="font-medium">{userName}</span> mun fá eigandaaðgang að dkOne. Eigendur hafa fullar stjórnunarréttindi og geta breytt öllum stillingum og notendum.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ownerConfirmed}
                onChange={(e) => setOwnerConfirmed(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-600"
              />
              <span className="text-xs text-amber-700 dark:text-amber-400">
                Já, ég vil gefa {userName.split(" ")[0]} eigandaaðgang
              </span>
            </label>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-(--color-error)">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Hætta við</Button>
          <Button type="button" onClick={handleSave} disabled={loading || !canSave}>
            {loading ? "Vista..." : "Vista"}
          </Button>
        </div>
      </div>
    </div>
  );
}
