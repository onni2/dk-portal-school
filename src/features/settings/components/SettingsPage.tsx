/**
 * Settings page — allows the logged-in user to set or change their password.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Button, @/shared/components/Input,
 *       @/features/auth/store/auth.store, @/features/users/store/users.store
 * Exports: SettingsPage
 */
import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { usePortalUsersStore } from "@/features/users/store/users.store";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const updateUser = usePortalUsersStore((s) => s.updateUser);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (newPassword.length < 6) {
      setError("Lykilorðið verður að vera að minnsta kosti 6 stafir");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Lykilorðin stemma ekki");
      return;
    }

    if (!user) return;

    updateUser(user.id, { password: newPassword, mustResetPassword: false });

    // Update auth store so mustResetPassword is cleared
    setAuth({ ...user, mustResetPassword: false }, token ?? "");

    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <PageTemplate
      title="Stillingar"
      description="Almennar stillingar fyrir Mínar síður."
    >
      <div className="max-w-md">
        <h2 className="mb-1 text-base font-semibold text-(--color-text)">
          {user?.mustResetPassword ? "Setja lykilorð" : "Breyta lykilorði"}
        </h2>
        <p className="mb-5 text-sm text-(--color-text-secondary)">
          {user?.mustResetPassword
            ? "Þú þarft að setja lykilorð áður en þú heldur áfram."
            : "Veldu nýtt lykilorð fyrir aðganginn þinn."}
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
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
          {error && (
            <p className="text-sm text-(--color-error)">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-600">Lykilorð vistað!</p>
          )}
          <Button type="submit" className="w-full">
            Vista lykilorð
          </Button>
        </form>
      </div>
    </PageTemplate>
  );
}
