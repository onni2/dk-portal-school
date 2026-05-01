/**
 * Login form with three tabs: Lykilorð (username/password), Rafræn skilríki
 * (Auðkenni app/SIM), and Skilríki á korti (smart card).
 * Uses: Button, Input, auth.api, audkenni.api, auth.store, role.store, role-mapping
 * Exports: LoginForm
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { login } from "../api/auth.api";
import { initiateAudkenniLogin } from "../api/audkenni.api";
import { useAuthStore } from "../store/auth.store";
import { useRoleStore } from "@/features/licence/store/role.store";
import { authRoleToUserRole } from "../utils/role-mapping";
import { cn } from "@/shared/utils/cn";

type Tab = "lykilord" | "rafraen" | "kort";

const TABS: { id: Tab; label: string }[] = [
  { id: "lykilord", label: "Lykilorð" },
  { id: "rafraen", label: "Rafræn skilríki" },
  { id: "kort", label: "Skilríki á korti" },
];

const SUBTITLES: Record<Tab, string> = {
  lykilord: "Skráðu þig inn með notendanafni og lykilorði.",
  rafraen: "Sláðu inn símanúmer og staðfestu í Auðkenni-appinu.",
  kort: "Við sendum þig í örugga auðkenningu með skilríkjum á korti.",
};

export function LoginForm() {
  const [activeTab, setActiveTab] = useState<Tab>("lykilord");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // "polling" = waiting for user to confirm on their phone (Rafræn / Kort)
  const [polling, setPolling] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useRoleStore((s) => s.setRole);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setError("");
    setPolling(false);
    setVerificationCode("");
  }

  function handleCancel() {
    setLoading(false);
    setPolling(false);
    setVerificationCode("");
    setError("");
  }

  async function handleLykilordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token: authToken, companies } = await login({ username, password });
      setAuth(user, authToken, companies ?? []);
      setRole(authRoleToUserRole(user.role));
      if (user.mustResetPassword) {
        navigate({ to: "/reset-password" });
      } else if ((companies ?? []).length > 1) {
        navigate({ to: "/select-company" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Innskráning mistókst");
    } finally {
      setLoading(false);
    }
  }

  async function handleRafraenSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPolling(false);
    try {
      await initiateAudkenniLogin(
        "sim",
        phoneNumber,
        () => { setPolling(true); },
        (code) => { setVerificationCode(code); },
      );
      // page redirects to /callback — loading stays true
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tenging við Auðkenni mistókst",
      );
      setLoading(false);
      setPolling(false);
    }
  }

  async function handleKortSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPolling(false);
    try {
      await initiateAudkenniLogin("card", undefined, () => {
        setPolling(true);
      });
      // page redirects to /callback — loading stays true
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tenging við Auðkenni mistókst",
      );
      setLoading(false);
      setPolling(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--color-brand-navy)">
      {/* Centered layout */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg
            width="80"
            height="42"
            viewBox="0 0 280 147"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_login)">
              <path
                d="M246.073 46.1325L205.527 0H240.481L280.001 46.1325V46.3215L240.481 92.5485H205.527L246.073 46.3215"
                fill="#4743F7"
              />
              <path
                d="M226.22 145.866L183.064 92.1704L223.516 46.227H188.377L151.839 88.8617L152.118 0H121.453L121.359 145.866V146.433H151.652L151.839 95.7627L191.08 145.866H226.22Z"
                fill="#ffffff"
              />
              <path
                d="M104.953 0H74.2876V46.6051C68.0426 46.227 57.976 45.7543 48.4687 45.7543C21.0652 45.7543 0 68.537 0 95.6682C0 122.799 17.0573 147.095 45.7656 147.095C48.6551 147.095 52.3835 147.095 56.3915 147L74.2876 126.013V146.527C75.2197 146.527 75.9654 146.527 76.8043 146.527H104.581L104.953 0ZM52.7563 119.963C40.5459 119.963 31.9707 108.052 31.9707 95.5736C31.9707 83.0952 40.6391 73.4527 52.7563 73.0746C60.9587 72.791 68.7883 73.0746 74.2876 73.3582V119.963H52.7563Z"
                fill="#ffffff"
              />
            </g>
            <defs>
              <clipPath id="clip0_login">
                <rect width="280" height="147" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-sm font-medium text-white/60 tracking-wide">
            Mínar síður
          </span>
        </div>

        {/* Card */}
        <div className="w-full max-w-110 rounded-2xl bg-(--color-surface) p-8 shadow-2xl">
          {/* Title */}
          <h1 className="text-2xl font-bold text-(--color-text)">
            Innskráning
          </h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {SUBTITLES[activeTab]}
          </p>

          {/* Tabs */}
          <div className="mt-6 flex border-b border-(--color-border)">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 pb-3 text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-(--color-primary) font-semibold text-(--color-text)"
                    : "text-(--color-text-muted) hover:text-(--color-text-secondary)",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6 min-h-80">
            {activeTab === "lykilord" && (
              <form onSubmit={handleLykilordSubmit} className="flex flex-col gap-4">
                <Input
                  label="Notendanafn"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="notendanafn"
                  required
                />
                <PasswordInput
                  label="Lykilorð"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {error && (
                  <p className="text-sm text-(--color-error)">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="mt-2 w-full"
                >
                  {loading ? "Skrái inn..." : "Innskrá"}
                </Button>
              </form>
            )}

            {activeTab === "rafraen" && (
              <>
                {polling ? (
                  /* ── Waiting for user to confirm ── */
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <svg
                      className="h-10 w-10 animate-spin text-(--color-primary)"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-(--color-text)">
                      Auðkennisbeiðni hefur verið send í símann þinn
                    </p>
                    {verificationCode && (
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-(--color-text-muted)">
                          Öryggistalan þín er:
                        </p>
                        <p className="text-4xl font-bold tracking-widest text-(--color-text)">
                          {verificationCode}
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                          Staðfestu auðkenninguna ef öryggistalan er sú sama og birtist á símanum þínum.
                        </p>
                      </div>
                    )}
                    {error && (
                      <p className="text-sm text-(--color-error)">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-sm text-(--color-text-muted) underline underline-offset-2 hover:text-(--color-text-secondary)"
                    >
                      Hætta við
                    </button>
                  </div>
                ) : (
                  /* ── Input form ── */
                  <form
                    onSubmit={handleRafraenSubmit}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Símanúmer"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder=""
                    />
                    {error && (
                      <p className="text-sm text-(--color-error)">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={loading || !phoneNumber}
                      className="mt-2 w-full"
                    >
                      {loading ? "Tengist Auðkenni..." : "Senda beiðni"}
                    </Button>
                  </form>
                )}
              </>
            )}

            {activeTab === "kort" && (
              <>
                {polling ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <svg
                      className="h-10 w-10 animate-spin text-(--color-primary)"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm font-medium text-(--color-text)">
                      Nexus Smart ID er að vinna...
                    </p>
                    <p className="text-xs text-(--color-text-muted)">
                      Staðfestu auðkenningu í Nexus Smart ID Desktop appinu
                    </p>
                    {error && (
                      <p className="text-sm text-(--color-error)">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-sm text-(--color-text-muted) underline underline-offset-2 hover:text-(--color-text-secondary)"
                    >
                      Hætta við
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleKortSubmit} className="flex flex-col gap-4">
                    {/* Preparation info box */}
                    <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                      <span className="mt-0.5 text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-(--color-text)">Undirbúningur</p>
                        <p className="mt-1 text-sm text-(--color-text-secondary)">
                          Gakktu úr skugga um að kortalesari sé tengdur og skilríki séu í lesara áður en þú heldur áfram.
                        </p>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-(--color-error)">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Tengist Auðkenni..." : "Halda áfram"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-center pb-6">
        <span className="text-xs text-white/40">
          dk© {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
