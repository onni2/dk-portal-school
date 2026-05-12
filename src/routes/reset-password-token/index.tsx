import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/shared/components/Button";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { resetPasswordWithToken } from "@/features/auth/api/auth.api";

const searchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/reset-password-token/")({
  validateSearch: searchSchema,
  component: ResetPasswordTokenPage,
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

function ResetPasswordTokenPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const allRulesPassed = RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirm && confirm.length > 0;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-brand-navy)">
        <div className="w-full max-w-md rounded-2xl bg-(--color-surface) p-8 text-center shadow-2xl">
          <p className="text-(--color-error)">Ógildur tengill. Biddu um nýjan endurstillingartengil.</p>
          <a href="/forgot-password" className="mt-4 inline-block text-sm text-(--color-primary) underline underline-offset-2">
            Gleymt lykilorð
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allRulesPassed || !passwordsMatch) return;
    setError("");
    setLoading(true);
    try {
      await resetPasswordWithToken(token, newPassword);
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 2500);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Villa kom upp — reyndu aftur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--color-brand-navy)">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg width="80" height="42" viewBox="0 0 280 147" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_rpt)">
              <path d="M246.073 46.1325L205.527 0H240.481L280.001 46.1325V46.3215L240.481 92.5485H205.527L246.073 46.3215" fill="#4743F7" />
              <path d="M226.22 145.866L183.064 92.1704L223.516 46.227H188.377L151.839 88.8617L152.118 0H121.453L121.359 145.866V146.433H151.652L151.839 95.7627L191.08 145.866H226.22Z" fill="#ffffff" />
              <path d="M104.953 0H74.2876V46.6051C68.0426 46.227 57.976 45.7543 48.4687 45.7543C21.0652 45.7543 0 68.537 0 95.6682C0 122.799 17.0573 147.095 45.7656 147.095C48.6551 147.095 52.3835 147.095 56.3915 147L74.2876 126.013V146.527C75.2197 146.527 75.9654 146.527 76.8043 146.527H104.581L104.953 0ZM52.7563 119.963C40.5459 119.963 31.9707 108.052 31.9707 95.5736C31.9707 83.0952 40.6391 73.4527 52.7563 73.0746C60.9587 72.791 68.7883 73.0746 74.2876 73.3582V119.963H52.7563Z" fill="#ffffff" />
            </g>
            <defs>
              <clipPath id="clip0_rpt">
                <rect width="280" height="147" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-sm font-medium text-white/60 tracking-wide">Mínar síður</span>
        </div>

        <div className="w-full max-w-110 rounded-2xl bg-(--color-surface) p-8 shadow-2xl">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-(--color-text)">Lykilorð endurstillt</h1>
              <p className="text-sm text-(--color-text-secondary)">
                Lykilorðið þitt hefur verið uppfært. Þú verður vísað á innskráningarsíðuna...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-(--color-text)">Velja nýtt lykilorð</h1>
              <p className="mt-1 text-sm text-(--color-text-secondary)">
                Veldu þér nýtt lykilorð fyrir aðganginn þinn.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <PasswordInput
                  label="Nýtt lykilorð"
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
                              ? "text-(--color-error)"
                              : "text-(--color-text-muted)"
                        }`}
                      >
                        <span>{passed ? "✓" : "○"}</span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>

                <PasswordInput
                  label="Staðfesta nýtt lykilorð"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                {confirm.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-(--color-error)">Lykilorðin stemma ekki</p>
                )}

                {error && <p className="text-sm text-(--color-error)">{error}</p>}

                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={loading || !allRulesPassed || !passwordsMatch}
                >
                  {loading ? "Vista..." : "Vista lykilorð"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="flex justify-center pb-6">
        <span className="text-xs text-white/40">dk© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
