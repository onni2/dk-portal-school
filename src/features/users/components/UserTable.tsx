/**
 * Table of portal users with role/status badges and a remove action.
 * The logged-in user cannot remove themselves.
 * Uses: ../store/users.store, ../api/users.api, @/features/auth/store/auth.store
 * Exports: UserTable
 */
import { useState } from "react";
import { usePortalUsersStore } from "../store/users.store";
import { removeUser } from "../api/users.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/shared/utils/cn";

export function UserTable() {
  const users = usePortalUsersStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.user);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    if (!confirm("Ertu viss um að þú viljir fjarlægja þennan notanda?")) return;
    setRemovingId(id);
    try {
      await removeUser(id);
    } finally {
      setRemovingId(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
        Engir notendur fundust.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <tr>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Nafn</th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Notendanafn</th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Netfang</th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Hlutverk</th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Staða</th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id || user.username === currentUser?.id;
            return (
              <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {user.username}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
                    )}
                  >
                    {user.role === "admin" ? "Stjórnandi" : "Staðlað"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {user.status === "active" ? "Virkur" : "Í bið"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!isSelf && (
                    <button
                      onClick={() => handleRemove(user.id)}
                      disabled={removingId === user.id}
                      className="text-sm text-[var(--color-error)] hover:underline disabled:opacity-50"
                    >
                      {removingId === user.id ? "Fjarlægi..." : "Fjarlægja"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
