/**
 * Modal for inviting a new portal user. Admin fills in name, username, email,
 * kennitala, optional hosting account, and module permissions.
 * On submit the user is added to the portal store with default password "dk".
 * Uses: ../api/users.api, ../api/permissions.api, @/shared/components/Button,
 *       @/shared/components/Input, @/mocks/hosting.mock
 * Exports: InviteUserModal
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { inviteUser } from "../api/users.api";
import { saveUserPermissions } from "../api/permissions.api";
import type { UserPermissions } from "../types/user-permissions.types";
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
  subscription: false,
  hosting: false,
  pos: false,
  dkOne: false,
  dkPlus: false,
  timeclock: false,
  users: false,
};

interface Props {
  onClose: () => void;
  onInvited: () => void;
}

export function InviteUserModal({ onClose, onInvited }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kennitala, setKennitala] = useState("");
  const [hostingUsername, setHostingUsername] = useState("");
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await inviteUser({ name, username: email, email, kennitala, hostingUsername, role: "standard" });
      saveUserPermissions(user.id, permissions);
      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Villa kom upp");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">
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
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Hýsingaraðgangur
            </label>
            <select
              value={hostingUsername}
              onChange={(e) => setHostingUsername(e.target.value)}
              className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
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
            <p className="mb-2 text-sm font-medium text-(--color-text-secondary)">
              Aðgangur að einingum
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_LABELS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-(--color-text)"
                >
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={() => togglePermission(key)}
                    className="h-4 w-4 rounded border-(--color-border) accent-(--color-primary)"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-(--color-error)">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Hætta við
            </Button>
            <Button type="submit" disabled={loading || !name || !email}>
              {loading ? "Sendir boð..." : "Senda boð"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
