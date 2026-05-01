import { useState, Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/Button";
import { useDkUsers } from "../api/dkone.queries";
import { inviteDkOneUser, fetchDkEmployees, addDkUser } from "../api/dkone.api";
import { dkOneUsersQueryOptions, dkUsersQueryOptions } from "../api/dkone.queries";
import type { DkOneRole, DkEmployee } from "../types/dkone.types";

const ROLES: { value: DkOneRole; label: string }[] = [
  { value: "owner", label: "Eigandi" },
  { value: "admin", label: "Stjórnandi" },
  { value: "user", label: "Notandi" },
];

interface Props {
  onClose: () => void;
}

// ── Roster view ───────────────────────────────────────────────────────────────

function RosterList({ onAddEmployee }: { onAddEmployee: () => void }) {
  const { data: allDkUsers } = useDkUsers();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<string, DkOneRole>>({});
  const [ownerConfirmId, setOwnerConfirmId] = useState<string | null>(null);

  const available = allDkUsers.filter((u) => !u.hasAccess);

  async function handleInvite(dkUserId: string) {
    setOwnerConfirmId(null);
    setLoadingId(dkUserId);
    setErrorId(null);
    try {
      await inviteDkOneUser({ dkUserId, role: roles[dkUserId] ?? "user" });
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: dkUsersQueryOptions.queryKey });
    } catch {
      setErrorId(dkUserId);
    } finally {
      setLoadingId(null);
    }
  }

  function handleBjoda(dkUserId: string) {
    if ((roles[dkUserId] ?? "user") === "owner") {
      setOwnerConfirmId(dkUserId);
    } else {
      handleInvite(dkUserId);
    }
  }

  return (
    <>
      <div className="max-h-80 overflow-y-auto divide-y divide-(--color-border)">
        {available.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-secondary)">
            Allir starfsmenn hafa þegar aðgang að dkOne.
          </p>
        ) : (
          available.map((user) => (
            <div key={user.id} className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--color-text)">{user.name}</p>
                  <p className="text-xs text-(--color-text-muted)">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <select
                    value={roles[user.id] ?? "user"}
                    onChange={(e) => {
                      setRoles((r) => ({ ...r, [user.id]: e.target.value as DkOneRole }));
                      setOwnerConfirmId(null);
                    }}
                    className="rounded border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs text-(--color-text)"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => handleBjoda(user.id)}
                    disabled={loadingId === user.id}
                  >
                    {loadingId === user.id ? "Bjóða..." : "Bjóða"}
                  </Button>
                </div>
              </div>

              {ownerConfirmId === user.id && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Ertu viss?
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                    {user.name.split(" ")[0]} mun fá eigandaaðgang að dkOne með fullar stjórnunarréttindi.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={loadingId === user.id}
                      className="text-xs font-medium text-amber-800 dark:text-amber-300 underline disabled:opacity-50"
                    >
                      Já, staðfesta
                    </button>
                    <button
                      onClick={() => setOwnerConfirmId(null)}
                      className="text-xs text-amber-700 dark:text-amber-400 underline"
                    >
                      Hætta við
                    </button>
                  </div>
                </div>
              )}

              {errorId === user.id && (
                <p className="text-xs text-(--color-error)">Reyndu aftur.</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-(--color-border) pt-4 mt-2 flex justify-end">
        <Button onClick={onAddEmployee}>+ Bæta við starfsmanni</Button>
      </div>
    </>
  );
}

// ── Add employee view ─────────────────────────────────────────────────────────

function AddEmployeeView({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<DkEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNumber, setAddingNumber] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDkEmployees()
      .then(setEmployees)
      .catch(() => setError("Ekki tókst að sækja starfsmenn. Reyndu aftur."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(employee: DkEmployee) {
    setAddingNumber(employee.number);
    setError(null);
    setLastAdded(null);
    try {
      await addDkUser(employee);
      queryClient.invalidateQueries({ queryKey: dkUsersQueryOptions.queryKey });
      setEmployees((prev) => prev.filter((e) => e.number !== employee.number));
      setLastAdded(employee.name);
    } catch {
      setError("Ekki tókst að bæta við starfsmanni. Reyndu aftur.");
    } finally {
      setAddingNumber(null);
    }
  }

  const q = search.toLowerCase();
  const filtered = employees.filter(
    (e) =>
      (e.name ?? "").toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q) ||
      (e.ssNumber ?? "").includes(q),
  );

  return (
    <>
      {lastAdded && (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/40">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <span className="font-medium">{lastAdded}</span> er nú skráð/ur og er að finna í listanum hér á undan.
            </span>
          </div>
          <button
            onClick={onBack}
            className="shrink-0 text-xs font-medium text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
          >
            Bjóða inn →
          </button>
        </div>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Leita að starfsmanni..."
        autoFocus
        className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary) mb-3"
      />

      {error && <p className="mb-2 text-sm text-(--color-error)">{error}</p>}

      <div className="max-h-80 overflow-y-auto divide-y divide-(--color-border)">
        {loading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-secondary)">
            {search ? "Enginn starfsmaður fannst." : "Allir starfsmenn eru nú þegar skráðir."}
          </p>
        ) : (
          filtered.map((emp) => (
            <div key={emp.number} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-(--color-text)">{emp.name}</p>
                <p className="text-xs text-(--color-text-muted)">{emp.email ?? "—"} · {emp.ssNumber ?? "—"}</p>
              </div>
              <div className="shrink-0 ml-4">
                <Button onClick={() => handleAdd(emp)} disabled={addingNumber === emp.number}>
                  {addingNumber === emp.number ? "Bý til..." : "Bæta við"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function InviteDkOneModal({ onClose }: Props) {
  const [view, setView] = useState<"roster" | "add">("roster");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-(--color-surface) p-6 shadow-xl">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {view === "add" && (
                <button
                  onClick={() => setView("roster")}
                  className="text-(--color-text-muted) hover:text-(--color-text)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="text-lg font-semibold text-(--color-text)">
                {view === "roster" ? "Bjóða inn dk notendum" : "Bæta við starfsmanni"}
              </h2>
            </div>
            <button onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text)">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {view === "roster"
              ? "Starfsmenn skráðir í DK kerfið sem hafa ekki enn fengið aðgang að dkOne."
              : "Finndu starfsmann í DK kerfinu og bættu honum við í starfsmannalista."}
          </p>
        </div>

        {view === "roster" ? (
          <Suspense fallback={<LoadingSpinner />}>
            <RosterList onAddEmployee={() => setView("add")} />
          </Suspense>
        ) : (
          <AddEmployeeView onBack={() => setView("roster")} />
        )}
      </div>
    </div>
  );
}
