/**
 * Modal for inviting a new user to Mínar síður.
 * Admin fills in name, email, kennitala, optional hosting username, and permissions.
 * When connected to the backend: replace the alert with a real API call to send the invitation email.
 * Uses: @/shared/components/Button, @/shared/components/Input, ../api/users.api, ../store/users.store
 * Exports: InviteUserModal
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useUsersStore } from "../store/users.store";
import type { UserPermissions } from "../types/users.types";
import { MOCK_HOSTING_ACCOUNTS } from "@/mocks/hosting.mock";

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string }[] = [
  { key: "invoices", label: "Reikningsyfirlit" },
  { key: "subscription", label: "Áskrift" },
  { key: "hosting", label: "Hýsing" },
  { key: "pos", label: "POS" },
  { key: "dkOne", label: "dkOne" },
  { key: "dkPlus", label: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka" },
  { key: "users", label: "Notendur" },
];

const DEFAULT_PERMISSIONS: UserPermissions = {
  invoices: false,
  hosting: false,
  pos: false,
  dkOne: false,
  dkPlus: false,
  timeclock: false,
  users: false,
  subscription: false,
};

export function InviteUserModal() {
  const { closeInvite } = useUsersStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kennitala, setKennitala] = useState("");
  const [hostingUsername, setHostingUsername] = useState("");
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(false);

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: replace with real API call to send invitation email
      // await apiClient.post("/portal/users/invite", { name, email, kennitala, hostingUsername, permissions });
      await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
      closeInvite();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          Bjóða notanda
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nafn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Netfang"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="notandi@fyrirtaeki.is"
            required
          />
          <Input
            label="Kennitala"
            value={kennitala}
            onChange={(e) => setKennitala(e.target.value)}
            placeholder="000000-0000"
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
              Hýsingaraðgangur
            </label>
            <select
              value={hostingUsername}
              onChange={(e) => setHostingUsername(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="">Enginn hýsingaraðgangur</option>
              {MOCK_HOSTING_ACCOUNTS.map((acc) => (
                <option key={acc.username} value={acc.username}>
                  {acc.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
              Aðgangur að einingum
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_LABELS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]"
                >
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={() => togglePermission(key)}
                    className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeInvite}>
              Hætta við
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sendir boð..." : "Senda boð"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
