import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { inviteUser } from "../api/users.api";
import { DEFAULT_PERMISSIONS } from "../api/permissions.api";
import { useLicence } from "@/features/licence/api/licence.queries";
import type { LicenceResponse } from "@/features/licence/types/licence.types";
import type { UserPermissions } from "../types/user-permissions.types";

const PERMISSION_LABELS: {
  key: keyof UserPermissions;
  label: string;
  licenceModule?: keyof LicenceResponse;
}[] = [
  { key: "invoices", label: "Reikningsyfirlit" },
  { key: "subscription", label: "Áskrift" },
  { key: "hosting", label: "Hýsingarstjórnun", licenceModule: "Hosting" },
  { key: "pos", label: "POS", licenceModule: "POS" },
  { key: "dkOne", label: "dkOne", licenceModule: "dkOne" },
  { key: "dkPlus", label: "dkPlus", licenceModule: "dkPlus" },
  { key: "timeclock", label: "Stimpilklukka", licenceModule: "TimeClock" },
  { key: "users", label: "Notendur" },
];

interface Props {
  onClose: () => void;
  onInvited: () => void;
}

function normalizeKennitala(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidKennitala(value: string): boolean {
  return normalizeKennitala(value).length === 10;
}

function isModuleEnabled(
  licence: LicenceResponse | undefined,
  module: keyof LicenceResponse,
): boolean {
  const entry = licence?.[module];

  return Boolean(
    entry &&
      typeof entry === "object" &&
      "Enabled" in entry &&
      entry.Enabled,
  );
}

function isPermissionAllowedByLicence(
  licence: LicenceResponse | undefined,
  key: keyof UserPermissions,
): boolean {
  const config = PERMISSION_LABELS.find((item) => item.key === key);

  if (!config?.licenceModule) return true;

  return isModuleEnabled(licence, config.licenceModule);
}

function buildSubmittedPermissions(
  licence: LicenceResponse | undefined,
  companyRole: "user" | "admin",
  permissions: UserPermissions,
): UserPermissions {
  return {
    invoices:
      isPermissionAllowedByLicence(licence, "invoices") &&
      (companyRole === "admin" || permissions.invoices),

    subscription:
      isPermissionAllowedByLicence(licence, "subscription") &&
      (companyRole === "admin" || permissions.subscription),

    hosting:
      isPermissionAllowedByLicence(licence, "hosting") &&
      (companyRole === "admin" || permissions.hosting),

    pos:
      isPermissionAllowedByLicence(licence, "pos") &&
      (companyRole === "admin" || permissions.pos),

    dkOne:
      isPermissionAllowedByLicence(licence, "dkOne") &&
      (companyRole === "admin" || permissions.dkOne),

    dkPlus:
      isPermissionAllowedByLicence(licence, "dkPlus") &&
      (companyRole === "admin" || permissions.dkPlus),

    timeclock:
      isPermissionAllowedByLicence(licence, "timeclock") &&
      (companyRole === "admin" || permissions.timeclock),

    users:
      isPermissionAllowedByLicence(licence, "users") &&
      (companyRole === "admin" || permissions.users),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Villa kom upp";
}

export function InviteUserModal({ onClose, onInvited }: Props) {
  const { data: licence, isLoading: licenceLoading } = useLicence();

  const visiblePermissions = PERMISSION_LABELS.filter(({ licenceModule }) => {
    if (!licenceModule) return true;
    return isModuleEnabled(licence, licenceModule);
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kennitala, setKennitala] = useState("");
  const [companyRole, setCompanyRole] = useState<"user" | "admin">("user");
  const [permissions, setPermissions] =
    useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [invited, setInvited] = useState(false);

  const displayedPermissions =
    companyRole === "admin"
      ? buildSubmittedPermissions(licence, companyRole, permissions)
      : permissions;

  const inviteMutation = useMutation({
    mutationFn: () => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const normalizedKennitala = normalizeKennitala(kennitala);

      return inviteUser({
        name: trimmedName,
        username: trimmedEmail,
        email: trimmedEmail,
        kennitala: normalizedKennitala,
        companyRole,
        permissions: buildSubmittedPermissions(
          licence,
          companyRole,
          permissions,
        ),
      });
    },
    onSuccess: () => {
      setInvited(true);
      onInvited();
    },
  });

  function togglePermission(key: keyof UserPermissions) {
    if (companyRole === "admin") return;

    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const isSubmitDisabled =
    inviteMutation.isPending ||
    licenceLoading ||
    !name.trim() ||
    !email.trim() ||
    !companyRole ||
    !isValidKennitala(kennitala);

  if (invited) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-bold text-(--color-text)">
            Notandi búinn til
          </h2>

          <p className="mb-4 text-sm text-(--color-text-secondary)">
            Aðgangur hefur verið stofnaður og lykilorð sent á {email} í tölvupósti.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Loka</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">
          Bjóða notanda inn á Mínar síður
        </h2>
          <p className="mb-2 text-sm text-(--color-text-muted)">
            Sláðu inn upplýsingar um notandann og veldu aðgangsheimildir hans.
          </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
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

          <div>
            <Input
              label="Kennitala"
              value={kennitala}
              onChange={(e) => setKennitala(e.target.value)}
              placeholder="000000-0000"
              required
            />

            {kennitala.trim() && !isValidKennitala(kennitala) && (
              <p className="mt-1 text-xs text-(--color-error)">
                Kennitala verður að vera 10 tölustafir.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Hlutverk
            </label>

            <select
              value={companyRole}
              required
              onChange={(e) =>
                setCompanyRole(e.target.value as "user" | "admin")
              }
              className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            >
              <option value="user">Venjulegur notandi</option>
              <option value="admin">Stjórnandi</option>
            </select>

            {companyRole === "admin" && (
              <p className="mt-1 text-xs text-(--color-text-muted)">
                Stjórnandi fær sjálfkrafa aðgang að öllum einingum sem eru í
                leyfi fyrirtækisins.
              </p>
            )}
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
                    checked={displayedPermissions[key]}
                    onChange={() => togglePermission(key)}
                    disabled={companyRole === "admin"}
                    className="h-4 w-4 rounded border-(--color-border) accent-(--color-primary) disabled:cursor-not-allowed disabled:opacity-70"
                  />

                  {label}
                </label>
              ))}
            </div>
          </div>

          {inviteMutation.isError && (
            <p className="text-sm text-(--color-error)">
              {getErrorMessage(inviteMutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={inviteMutation.isPending}
            >
              Hætta við
            </Button>

            <Button type="submit" disabled={isSubmitDisabled}>
              {inviteMutation.isPending ? "Sendir boð..." : "Senda boð"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}