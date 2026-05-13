/**
 * Modal for inviting a new portal user. Collects name, email, kennitala, company role,
 * optional hosting account, and initial module permissions.
 * Uses: @/shared/components/Button, @/shared/components/Input, ../api/users.api, @/features/hosting/api/hosting.queries
 * Exports: InviteUserModal
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { inviteUser } from "../api/users.api";
import { hostingAccountsQueryOptions } from "@/features/hosting/api/hosting.queries";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string; licenceModule?: keyof LicenceResponse }[] = [
  { key: "invoices", label: "Reikningsyfirlit" },
  { key: "subscription", label: "Áskrift", licenceModule: "dkPlus" },
  { key: "hosting", label: "Hýsing", licenceModule: "Hosting" },
  { key: "pos", label: "POS", licenceModule: "POS" },
  { key: "dkOne", label: "dkOne", licenceModule: "dkOne" },
  { key: "dkPlus", label: "dkPlus", licenceModule: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka", licenceModule: "TimeClock" },
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

/** Invite modal. On success shows a confirmation screen before closing. */
export function InviteUserModal({ onClose, onInvited }: Props) {
  const { data: licence } = useLicence();
  const { data: hostingAccounts = [] } = useQuery(hostingAccountsQueryOptions);
  // only show permissions for modules the company actually has enabled
  const visiblePermissions = PERMISSION_LABELS.filter(({ licenceModule }) => {
    if (!licenceModule) return true; // no module = always show (e.g. invoices, users)
    const entry = licence?.[licenceModule];
    return entry && typeof entry === "object" && "Enabled" in entry && entry.Enabled;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kennitala, setKennitala] = useState("");
  const [companyRole, setCompanyRole] = useState<"user" | "admin">("user");
  const [hostingUsername, setHostingUsername] = useState("");
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [invited, setInvited] = useState(false);

  const inviteMutation = useMutation({
    // username and email are the same thing here — the API expects both
    mutationFn: () => inviteUser({ name, username: email, email, kennitala, hostingUsername, companyRole, permissions }),
    onSuccess: () => setInvited(true),
  });

  function togglePermission(key: keyof UserPermissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // show a simple confirmation screen after successful invite
  if (invited) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-bold text-(--color-text)">Notandi búinn til</h2>
          <p className="mb-4 text-sm text-(--color-text-secondary)">
            Aðgangur hefur verið stofnaður og lykilorð sent á {email} í tölvupósti.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => { onInvited(); onClose(); }}>Loka</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">
          Bjóða notanda
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="flex flex-col gap-4">
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
              Hlutverk
            </label>
            <select
              value={companyRole}
              onChange={(e) => setCompanyRole(e.target.value as "user" | "admin")}
              className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            >
              <option value="user">Venjulegur notandi</option>
              <option value="admin">Stjórnandi</option>
            </select>
          </div>

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
              {hostingAccounts.map((acc) => (
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
              {visiblePermissions.map(({ key, label }) => (
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

          {inviteMutation.isError && (
            <p className="text-sm text-(--color-error)">
              {(inviteMutation.error as { message?: string })?.message ?? "Villa kom upp"}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={inviteMutation.isPending}>
              Hætta við
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending || !name || !email}>
              {inviteMutation.isPending ? "Sendir boð..." : "Senda boð"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
