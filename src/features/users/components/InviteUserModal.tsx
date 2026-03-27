/**
 * Modal for inviting a new portal user. Admin fills in name, username, email,
 * and role. On submit a password is generated and shown on screen.
 * Uses: ../api/users.api, @/shared/components/Button, @/shared/components/Input
 * Exports: InviteUserModal
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { inviteUser } from "../api/users.api";
import type { AuthRole } from "@/features/auth/types/auth.types";

interface Props {
  onClose: () => void;
  onInvited: () => void;
}

type Step = "form" | "success";

export function InviteUserModal({ onClose, onInvited }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AuthRole>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { generatedPassword: pwd } = await inviteUser({ name, username, email, role });
      setGeneratedPassword(pwd);
      setStep("success");
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Villa kom upp");
    } finally {
      setLoading(false);
    }
  }

  function copyCredentials() {
    navigator.clipboard.writeText(
      `Notendanafn: ${username}\nLykilorð: ${generatedPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {step === "form" ? (
          <>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Bjóða notanda
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Notandinn fær lykilorð sem hann þarf að breyta við fyrstu innskráningu.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <Input
                label="Nafn"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jón Jónsson"
                required
              />
              <Input
                label="Notendanafn"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                placeholder="jonjonsson"
                required
              />
              <Input
                label="Netfang"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jon@dktest.is"
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--color-text)]">
                  Hlutverk
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AuthRole)}
                  className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="standard">Staðlað (takmarkað aðgengi)</option>
                  <option value="admin">Stjórnandi (fullt aðgengi)</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              )}

              <div className="mt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={loading}
                >
                  Hætta við
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !name || !username || !email}
                >
                  {loading ? "Býr til notanda..." : "Bjóða"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Notandi búinn til
              </h2>
            </div>

            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              Deildu þessum innskráningarupplýsingum með{" "}
              <span className="font-medium text-[var(--color-text)]">{name}</span>.
              Notandinn verður beðinn um að breyta lykilorði við fyrstu innskráningu.
            </p>

            <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Notendanafn</span>
                <span className="font-semibold text-[var(--color-text)]">{username}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Lykilorð</span>
                <span className="font-semibold text-[var(--color-text)]">{generatedPassword}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={copyCredentials}
              >
                {copied ? "Afritað!" : "Afrita"}
              </Button>
              <Button type="button" className="flex-1" onClick={onClose}>
                Loka
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
