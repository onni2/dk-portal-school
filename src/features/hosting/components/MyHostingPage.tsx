import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { cn } from "@/shared/utils/cn";
import { changeMyHostingPassword } from "../api/hosting.api";
import { useMyHostingAccountOptional, useMyHostingLog } from "../api/hosting.queries";
import type { HostingLogEntry } from "../types/hosting.types";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("is-IS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeMeta: Record<HostingLogEntry["type"], { label: string; tone: "success" | "default" | "error" }> = {
  login:  { label: "Innskráning",            tone: "success" },
  logout: { label: "Útskráning",             tone: "default" },
  failed: { label: "Misheppnuð innskráning", tone: "error" },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}

export function MyHostingPage() {
  const { data: account, isError: noAccount } = useMyHostingAccountOptional();
  const { data: log } = useMyHostingLog();
  const queryClient = useQueryClient();

  const displayName = account?.displayName ?? "Notandi";
  const username = account?.username ?? "—";
  const initials = displayName.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("");

  const [loggedIn, setLoggedIn] = useState(true);
  const [sessionStart] = useState(() => new Date(Date.now() - 2 * 3600 * 1000).toISOString());
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwStep, setPwStep] = useState<"form" | "done">("form");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [toast, setToast] = useState("");

  const PW_RULES = [
    { label: "Að minnsta kosti 12 stafir",  test: (pw: string) => pw.length >= 12 },
    { label: "Stór stafur (A-Z)",            test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "Lítill stafur (a-z)",          test: (pw: string) => /[a-z]/.test(pw) },
    { label: "Tölustafur (0-9)",             test: (pw: string) => /[0-9]/.test(pw) },
    { label: "Sértákn (!@#$%^&*)",           test: (pw: string) => /[!@#$%^&*]/.test(pw) },
  ] as const;

  const allRulesPassed = PW_RULES.every((r) => r.test(pw1));
  const passwordsMatch = pw1 === pw2 && pw2.length > 0;

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function logoutOfHosting() {
    setLoggedIn(false);
    void queryClient.invalidateQueries({ queryKey: ["hosting", "me", "log"] });
    setLogoutConfirm(false);
    showToast("Þú hefur verið skráð(ur) út úr hýsingunni");
  }

  function loginAgain() {
    setLoggedIn(true);
    void queryClient.invalidateQueries({ queryKey: ["hosting", "me", "log"] });
    showToast("Þú hefur verið skráð(ur) inn");
  }

  async function submitPw() {
    if (!allRulesPassed || !passwordsMatch) return;
    await changeMyHostingPassword(pw1);
    setPwStep("done");
  }

  function closePwModal() {
    setShowPwModal(false);
    setPw1(""); setPw2(""); setPwStep("form");
    showToast("Lykilorð uppfært");
  }

  return (
    <PageTemplate title="Hýsingin þín" description="Aðgangur þinn að hýsingu hjá DK Hugbúnaði.">
      {noAccount && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Enginn hýsingaraðgangur er tengdur þessum notanda. Hafðu samband við kerfisstjóra.
        </div>
      )}

      {/* Account header */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-base font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">DK User name</p>
              <p className="font-mono text-base font-semibold text-(--color-text)">{username}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">Display name</p>
              <p className="text-sm text-(--color-text)">{displayName}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {loggedIn ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-(--color-success) bg-(--color-success-bg) px-3 py-1 text-xs font-semibold text-(--color-success)">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-success) opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-success)" />
                </span>
                Innskráð(ur) í hýsingu
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface-hover) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
                <span className="h-2 w-2 rounded-full bg-(--color-text-muted)" />
                Útskráð(ur)
              </span>
            )}
            {loggedIn && (
              <p className="text-xs text-(--color-text-muted)">Innskráð(ur) síðan {fmtTime(sessionStart)}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-(--color-border-light) pt-4">
          {loggedIn ? (
            <button
              onClick={() => setLogoutConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Skrá út úr hýsingunni
            </button>
          ) : (
            <button
              onClick={loginAgain}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
            >
              Skrá inn í hýsinguna
            </button>
          )}
          <button
            onClick={() => setShowPwModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            <KeyIcon className="h-4 w-4" /> Endursetja lykilorð
          </button>
        </div>
      </div>

      {/* Login history */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--color-text)">Innskráningarsaga</h2>
          <span className="text-xs text-(--color-text-muted)">Síðustu {log.length} atburðir</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface)">
          <table className="w-full text-sm">
            <thead className="bg-(--color-surface-hover)">
              <tr className="text-left text-xs uppercase tracking-wide text-(--color-text-muted)">
                <th className="px-4 py-2.5">Atburður</th>
                <th className="px-4 py-2.5">Tími</th>
                <th className="px-4 py-2.5">IP-tala</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">Tæki / vafri</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => {
                const m = typeMeta[entry.type];
                return (
                  <tr key={entry.id} className="border-t border-(--color-border-light) hover:bg-(--color-surface-hover)">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          m.tone === "success" && "bg-(--color-success-bg) text-(--color-success)",
                          m.tone === "default" && "bg-(--color-surface-hover) text-(--color-text-secondary)",
                          m.tone === "error"   && "bg-(--color-error-bg) text-(--color-error)",
                        )}>
                          {m.tone === "error" ? <XIcon className="h-3.5 w-3.5" /> : <CheckIcon className="h-3.5 w-3.5" />}
                        </span>
                        <span className="font-medium text-(--color-text)">{m.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-(--color-text-secondary)">{fmtTime(entry.when)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-(--color-text-secondary)">{entry.ip}</td>
                    <td className="hidden px-4 py-2.5 text-(--color-text-secondary) sm:table-cell">{entry.agent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logout confirmation */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setLogoutConfirm(false)}>
          <div className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-semibold text-(--color-text)">Skrá út úr hýsingunni?</h2>
            <p className="mb-5 text-sm text-(--color-text-secondary)">
              Allar virkar lotur fyrir{" "}
              <span className="font-mono font-medium text-(--color-text)">{username}</span>{" "}
              verða lokaðar. Þú þarft að skrá þig inn á ný til að halda áfram.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setLogoutConfirm(false)} className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)">Hætta við</button>
              <button onClick={logoutOfHosting} className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)">Skrá út</button>
            </div>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {showPwModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => pwStep === "form" ? setShowPwModal(false) : closePwModal()}
        >
          <div className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            {pwStep === "form" && (
              <>
                <h2 className="mb-1 text-lg font-semibold text-(--color-text)">Endursetja lykilorð</h2>
                <p className="mb-4 text-sm text-(--color-text-secondary)">
                  Sláðu inn nýtt lykilorð fyrir hýsingaraðganginn{" "}
                  <span className="font-mono font-medium text-(--color-text)">{username}</span>.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Nýtt lykilorð</label>
                    <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Að minnsta kosti 12 stafir"
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)" />
                  </div>
                  <ul className="space-y-1">
                    {PW_RULES.map((rule) => {
                      const passed = rule.test(pw1);
                      return (
                        <li key={rule.label} className={cn(
                          "flex items-center gap-1.5 text-xs",
                          passed ? "text-(--color-success)" : pw1.length > 0 ? "text-(--color-error)" : "text-(--color-text-muted)"
                        )}>
                          <span>{passed ? "✓" : "○"}</span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">Staðfesta lykilorð</label>
                    <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Endurtaktu lykilorðið"
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)" />
                  </div>
                  {pw2.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-(--color-error)">Lykilorðin stemma ekki</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setShowPwModal(false)} className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)">Hætta við</button>
                  <button
                    onClick={() => void submitPw()}
                    disabled={!allRulesPassed || !passwordsMatch}
                    className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
                  >Vista nýtt lykilorð</button>
                </div>
              </>
            )}
            {pwStep === "done" && (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-success-bg) text-(--color-success)">
                  <CheckIcon className="h-6 w-6" />
                </div>
                <h2 className="text-center text-lg font-semibold text-(--color-text)">Lykilorð endursett</h2>
                <p className="mt-1 text-center text-sm text-(--color-text-secondary)">Nýja lykilorðið þitt er virkt strax.</p>
                <div className="mt-6 flex justify-end">
                  <button onClick={closePwModal} className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)">OK</button>
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
