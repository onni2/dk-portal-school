import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { inviteDkOneUser } from "../api/dkone.api";
import { dkOneUsersQueryOptions } from "../api/dkone.queries";
import type { DkOneRole } from "../types/dkone.types";

interface Props {
  onClose: () => void;
}

const ROLES: { value: DkOneRole; label: string }[] = [
  { value: "owner", label: "Eigandi" },
  { value: "admin", label: "Stjórnandi" },
  { value: "user", label: "Notandi" },
];

export function AddDkOneUserModal({ onClose }: Props) {
  const queryClient = useQueryClient();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      onClose();
    } catch {
      setError("Ekki tókst að bæta við notanda. Reyndu aftur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-(--color-surface) p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--color-text)">Bjóða notanda</h2>
          <button onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Starfsmannanúmer"
            type="text"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            placeholder="t.d. 101"
          />
          <Input
            label="Fullt nafn"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jón Jónsson"
            required
          />
          <Input
            label="Netfang"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jon@fyrirtaeki.is"
            required
          />
          <Input
            label="Notendanafn"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jon.jonsson"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-text)">Hlutverk</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as DkOneRole)}
              className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text)"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-(--color-error)">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" onClick={onClose}>
              Hætta við
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Bý til..." : "Bjóða"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
