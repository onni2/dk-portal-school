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
  const [pollCount, setPollCount] = useState(0);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useRoleStore((s) => s.setRole);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setError("");
    setPolling(false);
    setPollCount(0);
  }

  function handleCancel() {
    setLoading(false);
    setPolling(false);
    setPollCount(0);
    setError("");
  }

  async function handleLykilordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token: authToken } = await login({ username, password });
      setAuth(user, authToken);
      setRole(authRoleToUserRole(user.role));
      navigate({ to: user.mustResetPassword ? "/reset-password" : "/" });
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
    setPollCount(0);
    try {
      await initiateAudkenniLogin(
        "sim",
        phoneNumber,
        () => {
          setPolling(true);
          setPollCount((n) => n + 1);
        },
      );
      // page redirects to /callback — loading stays true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tenging við Auðkenni mistókst");
      setLoading(false);
      setPolling(false);
    }
  }

  async function handleKortSubmit() {
    setError("");
    setLoading(true);
    try {
      await initiateAudkenniLogin("card");
      // page redirects to Auðkenni /authorize — loading stays true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tenging við Auðkenni mistókst");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {/* Header */}
      <header className="flex h-14 items-center border-b border-[var(--color-border)] bg-white px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--color-primary)]">
            dk
            <sup className="text-xs"></sup>
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Mínar síður
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] rounded-xl bg-white p-8 shadow-md">
          {/* Title */}
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Innskráning
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {SUBTITLES[activeTab]}
          </p>

          {/* Tabs */}
          <div className="mt-6 flex border-b border-[var(--color-border)]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 pb-3 text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-[var(--color-primary)] font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6">
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
                <Input
                  label="Lykilorð"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {error && (
                  <p className="text-sm text-[var(--color-error)]">{error}</p>
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
                      className="h-10 w-10 animate-spin text-[var(--color-primary)]"
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
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      Auðkennisbeiðni hefur verið send í símann þinn
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      <>
                        Staðfestu auðkenningu á símanúmeri:{" "}
                        <span className="font-semibold">{phoneNumber}</span>
                      </>
                      {pollCount > 1 && (
                        <span className="ml-1 block">({pollCount} tilraunir)</span>
                      )}
                    </p>
                    {error && (
                      <p className="text-sm text-[var(--color-error)]">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-sm text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text-secondary)]"
                    >
                      Hætta við
                    </button>
                  </div>
                ) : (
                  /* ── Input form ── */
                  <form onSubmit={handleRafraenSubmit} className="flex flex-col gap-4">
                    <Input
                      label="Símanúmer"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder=""
                    />
                    {error && (
                      <p className="text-sm text-[var(--color-error)]">{error}</p>
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
              <div className="flex flex-col gap-4">
                {/* Security notice row */}
                <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-3 py-2">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Næsta skref fer fram hjá auðkennisþjónustu.
                  </span>
                  <span className="ml-3 rounded border border-[var(--color-border)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
                    ÖRUGGT
                  </span>
                </div>

                {/* Preparation info box */}
                <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <span className="mt-0.5 text-amber-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Undirbúningur
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Gakktu úr skugga um að kortalesari sé tengdur og
                      skilríki séu í lesara áður en þú heldur áfram.
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--color-error)]">{error}</p>
                )}

                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleKortSubmit}
                  className="w-full"
                >
                  {loading ? "Tengist Auðkenni..." : "Halda áfram"}
                </Button>

                <p className="text-xs text-[var(--color-text-muted)]">
                  Þú gætir verið beðinn um að velja skilríki eða slá inn PIN
                  í kerfisglugga.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-end px-6 py-3">
        <span className="text-xs text-[var(--color-text-muted)]">
          dk© {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
