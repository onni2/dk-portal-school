import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UpdateDuoUserPayload, UpdateDuoUserResponse } from "../../api/duo.api";
import type { DuoUser } from "../../types/duo.types";

interface DuoUserDetailsCardProps {
  duoUser: DuoUser;
  updateMutation: UseMutationResult<UpdateDuoUserResponse, unknown, UpdateDuoUserPayload>;
}

function isValidEmail(email: string) {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function DuoUserDetailsCard({ duoUser, updateMutation }: DuoUserDetailsCardProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const emailIsValid = isValidEmail(email);

  const hasChanges =
    displayName.trim() !== (duoUser.displayName ?? "") ||
    email.trim() !== (duoUser.email ?? "");

  function startEditing() {
    setDisplayName(duoUser.displayName ?? "");
    setEmail(duoUser.email ?? "");
    setIsEditing(true);
  }

  async function handleSave() {
    if (!emailIsValid || !hasChanges) return;

    await updateMutation.mutateAsync({
      displayName: displayName.trim() || undefined,
      email: email.trim() || undefined,
    });

    setIsEditing(false);
  }

  function handleCancel() {
    setDisplayName("");
    setEmail("");
    setIsEditing(false);
  }

  return (
    <div className="mt-2.5 rounded-lg border border-(--color-border-light) bg-(--color-surface) p-5">
      <div className="flex items-start justify-between gap-6">
        <dl className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-(--color-text-muted)">
              Notendanafn
            </dt>
            <dd className="mt-1 font-mono text-(--color-text)">
              {duoUser.username}
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-(--color-text-muted)">
              Display name
            </dt>

            <dd className="mt-1">
              {isEditing ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                />
              ) : (
                <span className="text-(--color-text)">
                  {duoUser.displayName || "—"}
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-(--color-text-muted)">
              Netfang
            </dt>

            <dd className="mt-1">
              {isEditing ? (
                <>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="notandi@domain.is"
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                  />

                  {!emailIsValid && (
                    <p className="mt-1 text-xs text-(--color-error)">
                      Netfangið er ekki gilt.
                    </p>
                  )}
                </>
              ) : (
                <span className="text-(--color-text)">
                  {duoUser.email ?? "Ekki skráð"}
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="shrink-0">
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
            >
              Breyta
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
              >
                Hætta við
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!hasChanges || !emailIsValid || updateMutation.isPending}
                className="rounded-lg bg-(--color-primary) px-3 py-1.5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
              >
                {updateMutation.isPending ? "Vista..." : "Vista"}
              </button>
            </div>
          )}
        </div>
      </div>

      {updateMutation.isError && (
        <p className="mt-4 rounded-lg border border-(--color-error) bg-(--color-error-bg) px-3 py-2 text-sm text-(--color-error)">
          {(updateMutation.error as { message?: string })?.message ??
            "Tókst ekki að uppfæra Duo notanda."}
        </p>
      )}
    </div>
  );
}