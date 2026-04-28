import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDkOneUsers } from "../api/dkone.queries";
import { setDkOneAccess } from "../api/dkone.api";
import { dkOneUsersQueryOptions } from "../api/dkone.queries";

interface Props {
  onClose: () => void;
}

export function AddDkOneUserModal({ onClose }: Props) {
  const { data: users } = useDkOneUsers();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const candidates = users.filter((u) => !u.hasDkOne);

  async function handleGrant(userId: string) {
    setLoadingId(userId);
    setError(null);
    const isLast = candidates.length === 1;
    try {
      await setDkOneAccess(userId, true);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      if (isLast) onClose();
    } catch {
      setError("Ekki tókst að veita aðgang. Reyndu aftur.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-(--color-surface) p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--color-text)">Bæta við notanda</h2>
          <button
            onClick={onClose}
            className="text-(--color-text-muted) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm text-(--color-error)">{error}</p>
        )}

        {candidates.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--color-text-secondary)">
            Allir notendur hafa þegar dkOne aðgang.
          </p>
        ) : (
          <div className="divide-y divide-(--color-border) rounded-md border border-(--color-border)">
            {candidates.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-(--color-text)">{user.name}</p>
                  <p className="text-xs text-(--color-text-muted)">{user.email}</p>
                </div>
                <button
                  onClick={() => handleGrant(user.id)}
                  disabled={loadingId === user.id}
                  className="rounded-md bg-(--color-primary) px-3 py-1.5 text-xs font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
                >
                  {loadingId === user.id ? "Veitir..." : "Veita aðgang"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
