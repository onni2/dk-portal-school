import { useState, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useCompanyUsers } from "../api/dkone.queries";
import { inviteDkOneUser } from "../api/dkone.api";
import { dkOneUsersQueryOptions, companyUsersQueryOptions } from "../api/dkone.queries";
import type { DkOneRole } from "../types/dkone.types";

const ROLES: { value: DkOneRole; label: string }[] = [
  { value: "owner", label: "Eigandi" },
  { value: "admin", label: "Stjórnandi" },
  { value: "user", label: "Notandi" },
];

interface Props {
  onClose: () => void;
}

function CompanyUserList() {
  const { data: rawCompanyUsers } = useCompanyUsers();
  const companyUsers = [...rawCompanyUsers].sort((a, b) => a.name.localeCompare(b.name, "is"));
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<string, DkOneRole>>({});

  async function handleInvite(userId: string, name: string, email: string) {
    setLoadingId(userId);
    setErrorId(null);
    try {
      await inviteDkOneUser({ fullName: name, email, username: email.split("@")[0], role: roles[userId] ?? "user" });
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: companyUsersQueryOptions.queryKey });
    } catch {
      setErrorId(userId);
    } finally {
      setLoadingId(null);
    }
  }

  if (companyUsers.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-(--color-text-secondary)">
        Allir notendur eru nú þegar með aðgang að dkOne.
      </p>
    );
  }

  return (
    <div className="divide-y divide-(--color-border)">
      {companyUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-(--color-text)">{user.name}</p>
            <p className="text-xs text-(--color-text-muted)">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <select
                value={roles[user.id] ?? "user"}
                onChange={(e) => setRoles((r) => ({ ...r, [user.id]: e.target.value as DkOneRole }))}
                className="rounded border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs text-(--color-text)"
              >
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <Button onClick={() => handleInvite(user.id, user.name, user.email)} disabled={loadingId === user.id}>
                {loadingId === user.id ? "Bjóða..." : "Bjóða"}
              </Button>
            </div>
            {errorId === user.id && (
              <p className="text-xs text-(--color-error)">Ekki tókst að bjóða. Reyndu aftur.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function NewUserForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [role, setRole] = useState<DkOneRole>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await inviteDkOneUser({ employeeNumber: employeeNumber || undefined, fullName, email, username, role });
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: companyUsersQueryOptions.queryKey });
      onCancel();
    } catch {
      setError("Ekki tókst að bjóða notanda. Reyndu aftur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Fullt nafn" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jón Jónsson" required />
      <Input label="Netfang" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jon@fyrirtaeki.is" required />
      <Input label="Notendanafn" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jon.jonsson" required />
      <Input label="Starfsmannanúmer" type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="t.d. 101" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--color-text)">Hlutverk</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as DkOneRole)}
          className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text)"
        >
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-(--color-error)">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onCancel}>Hætta við</Button>
        <Button type="submit" disabled={loading}>{loading ? "Bý til..." : "Bjóða"}</Button>
      </div>
    </form>
  );
}

export function InviteDkOneModal({ onClose }: Props) {
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-(--color-surface) p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showNewForm && (
              <button
                onClick={() => setShowNewForm(false)}
                className="text-(--color-text-muted) hover:text-(--color-text)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold text-(--color-text)">
              {showNewForm ? "Nýr notandi" : "Bjóða inn dk notendum"}
            </h2>
          </div>
          <button onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showNewForm ? (
          <NewUserForm onCancel={() => setShowNewForm(false)} />
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <CompanyUserList />
              </Suspense>
            </div>
            <div className="border-t border-(--color-border) pt-4 mt-4 flex justify-end">
              <Button onClick={() => setShowNewForm(true)}>+ Nýr notandi</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
