/**
 * Forced password reset page — shown to users whose mustResetPassword flag is set.
 * Requires current password verification + strong new password.
 */
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { resetPassword } from "@/features/users/api/users.api";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export const Route = createFileRoute("/reset-password/")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user?.mustResetPassword) throw redirect({ to: "/" });
  },
  component: ResetPasswordPage,
});

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: PasswordRule[] = [
  { label: "Að minnsta kosti 8 stafir", test: (pw) => pw.length >= 8 },
  { label: "Stór stafur (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Lítill stafur (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "Tala (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { label: "Sértákn (!@#$%&*)", test: (pw) => /[!@#$%&*]/.test(pw) },
];

function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const allRulesPassed = RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirm && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!allRulesPassed || !passwordsMatch || !user) return;

    setLoading(true);
    try {
      await resetPassword(user.id, newPassword, currentPassword);

      if (user && token) {
        setAuth({ ...user, mustResetPassword: false }, token);
      }

      navigate({ to: "/" });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Villa kom upp — reyndu aftur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <header className="flex h-14 items-center border-b border-[var(--color-border)] bg-white px-6">
        <span className="text-xl font-bold text-[var(--color-primary)]">dk</span>
        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">Mínar síður</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Breyta lykilorði
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Þú þarft að velja nýtt lykilorð til að halda áfram.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Núverandi lykilorð"
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

            <ul className="flex flex-col gap-1">
              {RULES.map((rule) => {
                const passed = rule.test(newPassword);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${
                      passed
                        ? "text-green-600"
                        : newPassword.length > 0
                          ? "text-[var(--color-error)]"
                          : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    <span>{passed ? "✓" : "○"}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>

            <Input
              label="Staðfesta nýtt lykilorð"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />

            {confirm.length > 0 && !passwordsMatch && (
              <p className="text-xs text-[var(--color-error)]">
                Lykilorðin stemma ekki
              </p>
            )}

            {error && (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            )}

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={loading || !currentPassword || !allRulesPassed || !passwordsMatch}
            >
              {loading ? "Vista..." : "Vista lykilorð"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
