/**
 * Settings page — shows user profile info and allows phone number and password changes.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Card, @/shared/components/Button,
 *       @/shared/components/Input, @/features/auth/store/auth.store, @/features/users/api/users.api
 * Exports: SettingsPage
 */
import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateUser, resetPassword } from "@/features/users/api/users.api";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const companies = useAuthStore((s) => s.companies);

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handlePhoneSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPhoneError("");
    try {
      await updateUser(user.id, { phone });
      setAuth({ ...user, phone }, token ?? "", companies);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2000);
    } catch {
      setPhoneError("Villa við að vista símanúmer");
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword.length < 6) {
      setPasswordError("Lykilorðið verður að vera að minnsta kosti 6 stafir");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Lykilorðin stemma ekki");
      return;
    }
    if (!user) return;

    try {
      await resetPassword(user.id, newPassword, currentPassword || undefined);
      setAuth({ ...user, mustResetPassword: false }, token ?? "", companies);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    } catch (err: unknown) {
      setPasswordError((err as { message?: string })?.message ?? "Villa við að vista lykilorð");
    }
  }

  return (
    <PageTemplate
      title="Stillingar"
      description="Almennar stillingar fyrir Mínar síður."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

        {/* Left column: profile info + phone */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-(--color-text)">
              Upplýsingar um notanda
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-(--color-text-muted)">Nafn</p>
                <p className="text-sm font-medium text-(--color-text)">{user?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-text-muted)">Netfang</p>
                <p className="text-sm font-medium text-(--color-text)">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-text-muted)">Kennitala</p>
                <p className="text-sm font-medium text-(--color-text)">{user?.kennitala ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-text-muted)">Símanúmer</p>
                <p className="text-sm font-medium text-(--color-text)">{user?.phone ?? "—"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-base font-semibold text-(--color-text)">
              Breyta símanúmeri
            </h2>
            <p className="mb-4 text-xs text-(--color-text-muted)">
              Notað við auðkenningu með Rafrænum skilríkjum.
            </p>
            <form onSubmit={handlePhoneSave} className="flex gap-3">
              <div className="flex-1">
                <Input
                  label=""
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="000-0000"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="secondary">
                  {phoneSaved ? "Vistað!" : "Vista"}
                </Button>
              </div>
            </form>
            {phoneError && <p className="mt-2 text-sm text-(--color-error)">{phoneError}</p>}
          </Card>
        </div>

        {/* Right column: password */}
        <Card>
          <h2 className="mb-1 text-base font-semibold text-(--color-text)">
            {user?.mustResetPassword ? "Setja lykilorð" : "Breyta lykilorði"}
          </h2>
          <p className="mb-4 text-xs text-(--color-text-muted)">
            {user?.mustResetPassword
              ? "Þú þarft að setja lykilorð áður en þú heldur áfram."
              : "Veldu nýtt lykilorð fyrir aðganginn þinn."}
          </p>
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            <Input
              label={user?.mustResetPassword ? "Tímabundið lykilorð" : "Núverandi lykilorð"}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Nýtt lykilorð"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Staðfesta lykilorð"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {passwordError && (
              <p className="text-sm text-(--color-error)">{passwordError}</p>
            )}
            {passwordSaved && (
              <p className="text-sm text-(--color-success)">Lykilorð vistað!</p>
            )}
            <Button type="submit" className="w-full">
              Vista lykilorð
            </Button>
          </form>
        </Card>

      </div>
    </PageTemplate>
  );
}
