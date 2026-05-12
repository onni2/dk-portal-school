import { useHostingAccountLog } from "../../api/hosting.queries";
import type {
  HostingAccount,
  HostingLogEntry,
} from "../../types/hosting.types";
import { HostingAccountActionButtons } from "../HostingAccountActionButtons";
import { HostingLoginHistoryTable } from "../HostingLoginHistoryTable";

interface HostingPanelProps {
  account: HostingAccount;
  onResetPassword?: () => void;
  onDeleteAccount?: () => void;
  onSignOut: () => void;
  onManagePortalUserLink?: () => void;
  isResettingPassword?: boolean;
  isDeleting?: boolean;
  isSigningOut?: boolean;
}

function isLoggedIn(log: HostingLogEntry[]) {
  const latest = log[0];
  return latest?.type === "login";
}

export function HostingPanel({
  account,
  onResetPassword,
  onDeleteAccount,
  onSignOut,
  onManagePortalUserLink,
  isResettingPassword,
  isDeleting,
  isSigningOut,
}: HostingPanelProps) {
  const { data: log = [] } = useHostingAccountLog(account.id);

  const loggedIn = isLoggedIn(log);
  const linkedPortalUsers = account.linkedPortalUsers ?? [];
  const hasLinkedPortalUsers = linkedPortalUsers.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
        <div className="flex gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                Hýsingarnotandi
              </p>
              <p className="mt-1 font-semibold text-(--color-text)">
                {account.username}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                Staða
              </p>

              <p
                className={[
                  "mt-1 font-medium",
                  loggedIn ? "text-(--color-success)" : "text-(--color-error)",
                ].join(" ")}
              >
                {loggedIn ? "Innskráð(ur)" : "Útskráð(ur)"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                MFA
              </p>
              <p className="mt-1 text-(--color-text)">
                {account.hasMfa ? "Virkt" : "Óvirkt"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                Tengdur notanda 
              </p>

              {hasLinkedPortalUsers ? (
                <div className="mt-1 flex flex-col gap-1">
                  {linkedPortalUsers.map((user) => (
                    <p key={user.id} className="text-(--color-text)">
                      {user.name}
                      <span className="ml-2 font-mono text-xs text-(--color-text-secondary)">
                        {user.username}
                      </span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-(--color-text-secondary)">
                  Enginn tengdur
                </p>
              )}
            </div>
          </div>

          <div className="flex w-60 shrink-0 flex-col">
            <HostingAccountActionButtons
              loggedIn={loggedIn}
              portalUserLinked={hasLinkedPortalUsers}
              onManagePortalUserLink={onManagePortalUserLink}
              onChangePassword={onResetPassword}
              onSignOut={onSignOut}
              passwordDisabled={!onResetPassword}
              passwordLoading={isResettingPassword}
              onDeleteAccount={onDeleteAccount}
              deleteDisabled={!onDeleteAccount}
              deleteLoading={isDeleting}
              signOutDisabled={isSigningOut}
              signOutLoading={isSigningOut}
            />
          </div>
        </div>
      </div>

      <HostingLoginHistoryTable log={log} />
    </div>
  );
}