/**
 * Hosting page — overview of the company's hosted environment users.
 * Admins can create, delete, reset passwords, restart services, and toggle MFA.
 * Uses: ../api/hosting.queries, ../api/hosting.api, @/shared/components/PageTemplate,
 *       @/shared/components/Button, ./CreateHostingUserModal
 * Exports: HostingPage
 */
import { useState } from "react";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Button } from "@/shared/components/Button";
import { useHostingAccounts, useInvalidateHostingAccounts } from "../api/hosting.queries";
import {
  deleteHostingAccount,
  resetHostingPassword,
  restartHostingService,
  toggleHostingMfa,
} from "../api/hosting.api";
import { CreateHostingUserModal } from "./CreateHostingUserModal";
import type { HostingAccount } from "../types/hosting.types";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-(--color-primary)"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function HostingPage() {
  const { data: accounts } = useHostingAccounts();
  const invalidate = useInvalidateHostingAccounts();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  async function handleDelete(acc: HostingAccount) {
    if (!confirm(`Eyða ${acc.displayName}?`)) return;
    setPendingId(acc.id);
    try {
      await deleteHostingAccount(acc.id);
      await invalidate();
    } catch {
      showError(`Villa kom upp við eyðingu á ${acc.displayName}.`);
    } finally {
      setPendingId(null);
    }
  }

  async function handleResetPassword(acc: HostingAccount) {
    setPendingId(acc.id);
    try {
      const { tempPassword } = await resetHostingPassword(acc.id);
      setResetResult({ name: acc.displayName, password: tempPassword });
    } catch {
      showError("Villa kom upp við endurstillingu lykilorðs.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRestart(acc: HostingAccount) {
    setPendingId(acc.id);
    try {
      await restartHostingService(acc.id);
      await invalidate();
    } catch {
      showError("Villa kom upp við endurræsingu.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggleMfa(acc: HostingAccount) {
    setPendingId(acc.id);
    try {
      await toggleHostingMfa(acc.id, !acc.hasMfa);
      await invalidate();
    } catch {
      showError("Villa kom upp.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <PageTemplate
      title="Hýsing"
      description="Yfirlit yfir hýsingarnotendur fyrirtækisins hjá DK Hugbúnaði."
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>+ Nýr notandi</Button>
      }
    >
      {/* Error feedback — only shows on failure */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Reset password result */}
      {resetResult && (
        <div className="rounded-md border border-(--color-border) bg-(--color-surface) px-4 py-4 text-sm">
          <p className="mb-1 font-medium text-(--color-text)">
            Tímabundið lykilorð fyrir {resetResult.name}:
          </p>
          <p className="mb-3 rounded-md bg-(--color-surface-hover) px-3 py-2 font-mono text-base text-(--color-text)">
            {resetResult.password}
          </p>
          <p className="mb-3 text-(--color-text-secondary)">
            Láttu notandann vita af þessu lykilorði. Það er aðeins sýnt einu sinni.
          </p>
          <Button size="sm" onClick={() => setResetResult(null)}>Loka</Button>
        </div>
      )}

      {accounts.length === 0 && (
        <p className="text-sm text-(--color-text-secondary)">Engir hýsingarnotendur skráðir.</p>
      )}

      {accounts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-(--color-border)">
          <table className="w-full text-sm">
            <thead className="border-b border-(--color-border) bg-(--color-surface-hover)">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">Notendanafn</th>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">Nafn</th>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">Netfang</th>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">MFA</th>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">Síðast endurræst</th>
                <th className="px-4 py-3 text-left font-medium text-(--color-text-secondary)">Aðgerðir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {accounts.map((acc) => {
                const busy = pendingId === acc.id;
                return (
                  <tr
                    key={acc.id}
                    className="bg-(--color-surface) transition-opacity hover:bg-(--color-surface-hover)"
                    style={{ opacity: busy ? 0.6 : 1 }}
                  >
                    <td className="px-4 py-3 font-mono text-(--color-text)">{acc.username}</td>
                    <td className="px-4 py-3 text-(--color-text)">{acc.displayName}</td>
                    <td className="px-4 py-3 text-(--color-text-secondary)">{acc.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleMfa(acc)}
                        disabled={busy}
                        title={acc.hasMfa ? "Slökkva á MFA" : "Kveikja á MFA"}
                        className="group flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span
                          className={[
                            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
                            acc.hasMfa
                              ? "bg-green-500 group-hover:bg-green-600"
                              : "bg-(--color-border) group-hover:bg-(--color-text-secondary)",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
                              acc.hasMfa ? "translate-x-[18px]" : "translate-x-[3px]",
                            ].join(" ")}
                          />
                        </span>
                        <span className={`text-xs font-medium ${acc.hasMfa ? "text-green-600 dark:text-green-400" : "text-(--color-text-secondary)"}`}>
                          {acc.hasMfa ? "Virkt" : "Óvirkt"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-(--color-text-secondary)">
                      {acc.lastRestart
                        ? new Date(acc.lastRestart).toLocaleString("is-IS")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {busy ? (
                        <div className="flex items-center gap-2 px-1">
                          <Spinner />
                          <span className="text-xs text-(--color-text-secondary)">Augnablik...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(acc)}
                          >
                            Endurstilla lykilorð
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestart(acc)}
                          >
                            Endurræsa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(acc)}
                            className="text-(--color-error) hover:text-(--color-error)"
                          >
                            Eyða
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <CreateHostingUserModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => invalidate()}
        />
      )}
    </PageTemplate>
  );
}
