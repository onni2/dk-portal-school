import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { useDkOneUsers, dkOneUsersQueryOptions } from "../api/dkone.queries";
import { removeDkOneUser, activateDkOneUser } from "../api/dkone.api";
import type { DkOneStatus } from "../types/dkone.types";

const ROLE_LABELS: Record<string, string> = {
  owner: "Eigandi",
  admin: "Stjórnandi",
  user: "Notandi",
};

const TABS: { key: DkOneStatus; label: string }[] = [
  { key: "active", label: "Meðlimir" },
  { key: "invited", label: "Boðið" },
];

export function DkOneUserTable() {
  const { data: users } = useDkOneUsers();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DkOneStatus>("active");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function switchTab(tab: DkOneStatus) {
    setActiveTab(tab);
    setSearch("");
    setConfirmId(null);
    setError(null);
  }

  const q = search.toLowerCase();
  const filtered = users.filter((u) => {
    if (u.status !== activeTab) return false;
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.employeeNumber ?? "").toLowerCase().includes(q)
    );
  });

  async function handleActivate(id: string) {
    setActivatingId(id);
    setError(null);
    try {
      await activateDkOneUser(id);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
    } catch {
      setError("Ekki tókst að virkja notanda. Reyndu aftur.");
    } finally {
      setActivatingId(null);
    }
  }

  async function handleRemove(id: string) {
    setLoadingId(id);
    setError(null);
    try {
      await removeDkOneUser(id);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      setConfirmId(null);
    } catch {
      setError("Ekki tókst að fjarlægja notanda. Reyndu aftur.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-(--color-border)">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-(--color-primary) text-(--color-primary)"
                : "text-(--color-text-muted) hover:text-(--color-text-secondary)",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-(--color-text-muted)">
              ({users.filter((u) => u.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Leita"
        className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
      />

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-(--color-text-secondary)">Engir notendur fundust.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-(--color-border)">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--color-border) bg-(--color-surface)">
              <tr>
                {activeTab === "active" ? (
                  <>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Fullt nafn</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Hlutverk</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Bætt við af</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Númer starfsmanns</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Dk notandi</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Stofnað</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Síðasta notkun</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Netfang</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Hlutverk</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Bætt við af</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Boð sent</th>
                  </>
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-(--color-surface-hover)">
                  {activeTab === "active" ? (
                    <>
                      <td className="px-4 py-3 font-medium text-(--color-text)">{user.fullName}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{ROLE_LABELS[user.role] ?? user.role}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.addedByName ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.employeeNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.username}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">—</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.email}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{ROLE_LABELS[user.role] ?? user.role}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.addedByName ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right">
                    {confirmId === user.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-(--color-text-secondary)">Ertu viss?</span>
                        <button
                          onClick={() => handleRemove(user.id)}
                          disabled={loadingId === user.id}
                          className="text-xs font-medium text-(--color-error) hover:underline disabled:opacity-50"
                        >
                          {loadingId === user.id ? "Fjarlægi..." : "Já"}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-xs text-(--color-text-muted) hover:underline">
                          Nei
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        {activeTab === "invited" && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            disabled={activatingId === user.id}
                            className="text-sm text-(--color-primary) hover:underline disabled:opacity-50"
                          >
                            {activatingId === user.id ? "Virki..." : "Virkja"}
                          </button>
                        )}
                        <button onClick={() => setConfirmId(user.id)} className="text-sm text-(--color-error) hover:underline">
                          Fjarlægja
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
