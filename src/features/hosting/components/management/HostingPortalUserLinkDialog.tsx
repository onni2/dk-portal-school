import { useMemo, useState } from "react";
import type {
  HostingAccount,
  HostingPortalUser,
} from "../../types/hosting.types";
import {
  useHostingPortalUsers,
  useLinkHostingAccountToPortalUser,
  useUnlinkHostingAccountFromPortalUser,
} from "../../api/hosting.queries";

interface HostingPortalUserLinkDialogProps {
  account: HostingAccount;
  onClose: () => void;
}

export function HostingPortalUserLinkDialog({
  account,
  onClose,
}: HostingPortalUserLinkDialogProps) {
  const { data: users = [], isLoading, isError } = useHostingPortalUsers();

  const linkMutation = useLinkHostingAccountToPortalUser();
  const unlinkMutation = useUnlinkHostingAccountFromPortalUser();

  const [selectedUserId, setSelectedUserId] = useState("");

  const linkedUsers = useMemo(() => {
    return users.filter((user) => user.hostingUsername === account.username);
  }, [users, account.username]);

  const availableUsers = useMemo(() => {
    return users.filter((user) => !user.hostingUsername);
  }, [users]);

  const selectedUser = availableUsers.find(
    (user) => user.id === selectedUserId,
  );

  const isSaving = linkMutation.isPending || unlinkMutation.isPending;

  const errorMessage =
    (linkMutation.error as { message?: string } | null)?.message ??
    (unlinkMutation.error as { message?: string } | null)?.message ??
    "";

  async function handleLinkSelectedUser() {
    if (!selectedUserId) return;

    await linkMutation.mutateAsync({
      accountId: account.id,
      userId: selectedUserId,
    });

    setSelectedUserId("");
  }

  async function handleUnlinkUser(userId: string) {
    await unlinkMutation.mutateAsync({
      accountId: account.id,
      userId,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-(--color-text)">
          {linkedUsers.length > 0
            ? "Breyta tengingu"
            : "Tengja við notanda"}
        </h2>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Stjórnaðu hvaða Mínar síður notendur tengjast hýsingaraðganginum{" "}
          <span className="font-mono font-medium text-(--color-text)">
            {account.username}
          </span>
          .
        </p>

        {isLoading && (
          <p className="mt-4 text-sm text-(--color-text-secondary)">
            Hleð notendum...
          </p>
        )}

        {isError && (
          <p className="mt-4 text-sm text-(--color-error)">
            Tókst ekki að sækja notendur.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="mt-5 space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-(--color-text)">
                Tengdir notendur
              </h3>

              {linkedUsers.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-(--color-border) px-4 py-4 text-sm text-(--color-text-secondary)">
                  Enginn Mínar síður notandi er tengdur.
                </p>
              ) : (
                <div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {linkedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-(--color-border) px-4 py-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-(--color-text)">
                          {user.name}
                        </span>

                        <span className="block truncate text-xs text-(--color-text-secondary)">
                          {user.username}
                          {user.email ? ` · ${user.email}` : ""}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleUnlinkUser(user.id)}
                        disabled={isSaving}
                        className="shrink-0 rounded-lg border border-(--color-error) px-3 py-1.5 text-xs font-medium text-(--color-error) hover:bg-(--color-error-bg) disabled:opacity-50"
                      >
                        Aftengja
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-(--color-text)">
                Bæta við notanda
              </h3>

              {availableUsers.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-(--color-border) px-4 py-4 text-sm text-(--color-text-secondary)">
                  Enginn laus Mínar síður notandi fannst.
                </p>
              ) : (
                <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {availableUsers.map((user: HostingPortalUser) => {
                    const selected = selectedUserId === user.id;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={[
                          "flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm",
                          selected
                            ? "border-(--color-primary) bg-(--color-surface-hover)"
                            : "border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-hover)",
                        ].join(" ")}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-(--color-text)">
                            {user.name}
                          </span>

                          <span className="block truncate text-xs text-(--color-text-secondary)">
                            {user.username}
                            {user.email ? ` · ${user.email}` : ""}
                          </span>
                        </span>

                        {selected && (
                          <span className="shrink-0 text-xs font-medium text-(--color-primary)">
                            Valinn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {selectedUser?.hostingUsername &&
          selectedUser.hostingUsername !== account.username && (
            <p className="mt-3 text-xs text-(--color-error)">
              Þessi notandi er nú þegar tengdur öðrum hýsingaraðgangi.
            </p>
          )}

        {errorMessage && (
          <p className="mt-3 text-xs text-(--color-error)">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
          >
            Loka
          </button>

          <button
            type="button"
            onClick={() => void handleLinkSelectedUser()}
            disabled={!selectedUserId || isSaving}
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {isSaving ? "Vista..." : "Tengja notanda"}
          </button>
        </div>
      </div>
    </div>
  );
}