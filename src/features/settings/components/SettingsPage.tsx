/**
 * Settings page — update personal profile info and change portal password.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Button, @/features/auth/store/auth.store, @/features/users/api/users.api
 * Exports: SettingsPage
 */
import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateUser, resetPassword } from "@/features/users/api/users.api";
import { useMyHostingAccountOptional } from "@/features/hosting/api/hosting.queries";

/* ── Icons ──────────────────────────────────────────────────────────── */
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.9h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.5a16 16 0 0 0 6.59 6.59l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const companies = useAuthStore((s) => s.companies);
  const { data: hostingAccount, isLoading: hostingLoading } = useMyHostingAccountOptional();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showKtModal, setShowKtModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(!!user?.mustResetPassword);
  const [toast, setToast] = useState("");

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);

  const [kennitala, setKennitala] = useState(user?.kennitala ?? "");
  const [ktError, setKtError] = useState("");
  const [ktSaving, setKtSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [pwStep, setPwStep] = useState<"form" | "done">("form");

  const displayName = user?.name ?? "Notandi";
  const initials = displayName.split(" ").map((s: string) => s[0]).filter(Boolean).slice(0, 2).join("");

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  async function handlePhoneSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPhoneError("");
    setPhoneSaving(true);
    try {
      await updateUser(user.id, { phone });
      setAuth({ ...user, phone }, token ?? "", companies);
      setShowPhoneModal(false);
      showToast("Símanúmer vistað");
    } catch {
      setPhoneError("Villa við að vista símanúmer");
    } finally {
      setPhoneSaving(false);
    }
  }

  async function handleKtSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setKtError("");
    setKtSaving(true);
    try {
      await updateUser(user.id, { kennitala });
      setAuth({ ...user, kennitala }, token ?? "", companies);
      setShowKtModal(false);
      showToast("Kennitala vistuð");
    } catch {
      setKtError("Villa við að vista kennitölu");
    } finally {
      setKtSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Lykilorðið verður að vera að minnsta kosti 6 stafir");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Lykilorðin stemma ekki");
      return;
    }
    if (!user) return;
    setPasswordSaving(true);
    try {
      await resetPassword(user.id, newPassword, currentPassword || undefined);
      setAuth({ ...user, mustResetPassword: false }, token ?? "", companies);
      setPwStep("done");
    } catch (err: unknown) {
      setPasswordError((err as { message?: string })?.message ?? "Villa við að vista lykilorð");
    } finally {
      setPasswordSaving(false);
    }
  }

  function closePwModal() {
    const wasDone = pwStep === "done";
    setShowPwModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPwStep("form");
    if (wasDone) showToast("Lykilorð uppfært");
  }

  return (
    <PageTemplate title="Stillingar" description="Almennar stillingar fyrir Mínar síður." info="Hér getur þú uppfært persónulegar upplýsingar þínar eins og nafn og netfang, og breytt lykilorði fyrir Mínar síður.">
      {/* Must-reset banner */}
      {user?.mustResetPassword && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Þú þarft að setja nýtt lykilorð</p>
            <p className="mt-0.5 text-xs text-amber-700">Lykilorðið þitt er tímabundið. Settu nýtt lykilorð til að halda áfram.</p>
          </div>
          <Button size="sm" onClick={() => setShowPwModal(true)}>Setja lykilorð</Button>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-base font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">Nafn</p>
              <p className="text-base font-semibold text-(--color-text)">{displayName}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">Netfang</p>
              <p className="text-sm text-(--color-text)">{user?.email ?? "—"}</p>
            </div>
          </div>
          <span className={`inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-semibold ${
            user?.role === "admin"
              ? "border-(--color-primary) bg-(--color-primary-light) text-(--color-primary)"
              : "border-(--color-border) bg-(--color-surface-hover) text-(--color-text-secondary)"
          }`}>
            {user?.role === "admin" ? "Stjórnandi" : "Venjulegur notandi"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-(--color-border-light) pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">Kennitala</p>
            <p className="mt-0.5 font-mono text-sm text-(--color-text)">{user?.kennitala ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">Símanúmer</p>
            <p className="mt-0.5 text-sm text-(--color-text)">{user?.phone ?? "—"}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-(--color-border-light) pt-4">
          <button
            onClick={() => setShowKtModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {user?.kennitala ? "Breyta kennitölu" : "Skrá kennitölu"}
          </button>
          <button
            onClick={() => setShowPhoneModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            <PhoneIcon className="h-4 w-4" /> {user?.phone ? "Breyta símanúmeri" : "Skrá símanúmer"}
          </button>
          <button
            onClick={() => setShowPwModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            <KeyIcon className="h-4 w-4" /> Breyta lykilorði
          </button>
        </div>
      </div>

      {/* Hosting account card — only shown when linked */}
      {!hostingLoading && hostingAccount && (
        <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--color-text)">Hýsingaraðgangur</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-hover)">
                <ServerIcon className="h-5 w-5 text-(--color-text-muted)" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-(--color-text)">{hostingAccount.username}</p>
                <p className="text-xs text-(--color-text-secondary)">{hostingAccount.displayName}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-success) bg-(--color-success-bg) px-3 py-1 text-xs font-semibold text-(--color-success)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--color-success)" />
              Tengt
            </span>
          </div>
        </div>
      )}

      {/* Phone modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPhoneModal(false)}>
          <div className="w-full max-w-sm rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-semibold text-(--color-text)">Breyta símanúmeri</h2>
            <p className="mb-4 text-sm text-(--color-text-secondary)">Notað við auðkenningu með Rafrænum skilríkjum.</p>
            <form onSubmit={(e) => void handlePhoneSave(e)}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="000-0000"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
              />
              {phoneError && <p className="mt-2 text-xs text-(--color-error)">{phoneError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPhoneModal(false)} className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)">
                  Hætta við
                </button>
                <Button type="submit" disabled={phoneSaving}>
                  {phoneSaving ? "Vista..." : "Vista"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kennitala modal */}
      {showKtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowKtModal(false)}>
          <div className="w-full max-w-sm rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-semibold text-(--color-text)">
              {user?.kennitala ? "Breyta kennitölu" : "Skrá kennitölu"}
            </h2>
            <p className="mb-4 text-sm text-(--color-text-secondary)">
              Kennitalan er notuð við auðkenningu með Auðkenni (Rafræn skilríki).
            </p>
            <form onSubmit={(e) => void handleKtSave(e)}>
              <input
                type="text"
                value={kennitala}
                onChange={(e) => setKennitala(e.target.value)}
                placeholder="000000-0000"
                maxLength={11}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 font-mono text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
              />
              {ktError && <p className="mt-2 text-xs text-(--color-error)">{ktError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowKtModal(false)} className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)">
                  Hætta við
                </button>
                <Button type="submit" disabled={ktSaving || !kennitala.trim()}>
                  {ktSaving ? "Vista..." : "Vista"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password modal */}
      {showPwModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => pwStep === "form" ? setShowPwModal(false) : closePwModal()}
        >
          <div className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            {pwStep === "form" ? (
              <>
                <h2 className="mb-1 text-lg font-semibold text-(--color-text)">
                  {user?.mustResetPassword ? "Setja lykilorð" : "Breyta lykilorði"}
                </h2>
                <p className="mb-5 text-sm text-(--color-text-secondary)">
                  {user?.mustResetPassword
                    ? "Sláðu inn tímabundna lykilorðið þitt og veldu nýtt."
                    : "Veldu nýtt lykilorð fyrir aðganginn þinn."}
                </p>
                <form onSubmit={(e) => void handlePasswordSave(e)} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
                      {user?.mustResetPassword ? "Tímabundið lykilorð" : "Núverandi lykilorð"}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Nýtt lykilorð</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Staðfesta lykilorð</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                    />
                  </div>
                  {passwordError && <p className="text-xs text-(--color-error)">{passwordError}</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPwModal(false)}
                      className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
                    >
                      Hætta við
                    </button>
                    <Button type="submit" disabled={passwordSaving}>
                      {passwordSaving ? "Vista..." : "Vista lykilorð"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-success-bg) text-(--color-success)">
                  <CheckIcon className="h-6 w-6" />
                </div>
                <h2 className="text-center text-lg font-semibold text-(--color-text)">Lykilorð uppfært</h2>
                <p className="mt-1 text-center text-sm text-(--color-text-secondary)">Nýja lykilorðið þitt er virkt strax.</p>
                <div className="mt-6 flex justify-end">
                  <Button onClick={closePwModal}>OK</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-(--color-success) px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckIcon className="h-4 w-4" /> {toast}
        </div>
      )}
    </PageTemplate>
  );
}
