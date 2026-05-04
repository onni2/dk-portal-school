import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDkOneUsers } from "../api/dkone.queries";
import { setDkOneAccess } from "../api/dkone.api";
import { dkOneUsersQueryOptions } from "../api/dkone.queries";

export function DkOneUserTable() {
  const { data: users } = useDkOneUsers();
  const qc = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const active = users.filter((u) => u.hasDkOne);

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => setDkOneAccess(userId, false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      setConfirmId(null);
    },
  });

  if (active.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-secondary)">
        Enginn notandi hefur dkOne aðgang.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {revokeMutation.isError && (
        <p className="text-sm text-(--color-error)">
          Ekki tókst að fjarlægja notanda. Reyndu aftur.
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-surface)">
            <tr>
              <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Nafn</th>
              <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Netfang</th>
              <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Hlutverk</th>
              <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Staða</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {active.map((user) => {
              const busy = revokeMutation.isPending && revokeMutation.variables === user.id;
              return (
                <tr key={user.id} className="hover:bg-(--color-surface-hover)">
                  <td className="px-4 py-3 font-medium text-(--color-text)">{user.name}</td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">{user.email}</td>
                  <td className="px-4 py-3 text-(--color-text-secondary) capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={user.status === "active" ? "text-green-600" : "text-(--color-text-muted)"}>
                      {user.status === "active" ? "Virkur" : "Í bið"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmId === user.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-(--color-text-secondary)">Ertu viss?</span>
                        <button
                          onClick={() => revokeMutation.mutate(user.id)}
                          disabled={busy}
                          className="text-xs font-medium text-(--color-error) hover:underline disabled:opacity-50"
                        >
                          {busy ? "Fjarlægi..." : "Já"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-(--color-text-muted) hover:underline"
                        >
                          Nei
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(user.id)}
                        className="text-sm text-(--color-error) hover:underline"
                      >
                        Fjarlægja
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
