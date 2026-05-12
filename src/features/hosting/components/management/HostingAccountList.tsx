import { cn } from "@/shared/utils/cn";
import type { HostingAccount } from "../../types/hosting.types";
import { getDuoShieldState, type DuoShieldState } from "../../utils/duo-shield";

interface HostingAccountListProps {
  accounts: HostingAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
}

const SHIELD_COLORS: Record<DuoShieldState, string> = {
  active: "#22c55e",
  pending: "#f59e0b",
  none: "#dc2626",
};

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function DuoShieldIcon({
  state,
  size = 19,
}: {
  state: DuoShieldState;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2.5 20 6v6.1c0 4.8-3.25 9-8 10.4-4.75-1.4-8-5.6-8-10.4V6l8-3.5Z"
        fill={SHIELD_COLORS[state]}
      />
    </svg>
  );
}

export function HostingAccountList({
  accounts,
  selectedAccountId,
  onSelectAccount,
}: HostingAccountListProps) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
      <div className="flex items-center gap-2 border-b border-(--color-border-light) px-4 py-3">
        <h3 className="text-sm font-semibold text-(--color-text)">
          Hýsingarnotendur
        </h3>

        <span className="rounded-full bg-(--color-surface-hover) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
          {accounts.length}
        </span>
      </div>

      <div className="flex flex-col">
        {accounts.map((account) => {
          const selected = account.id === selectedAccountId;

          const primaryName =
            account.duoDisplayName || account.displayName || account.username;

          const initials = getInitials(primaryName) || "H";
          const mfaState = getDuoShieldState(account);

          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelectAccount(account.id)}
              className={cn(
                "w-full border-l-2 px-4 py-2.5 text-left transition-colors",
                selected
                  ? "border-l-(--color-primary) bg-(--color-primary-light)"
                  : "border-l-transparent hover:bg-(--color-surface-hover)",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    selected
                      ? "bg-(--color-primary) text-white"
                      : "bg-(--color-surface-hover) text-(--color-text-secondary)",
                  )}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--color-text)">
                    {primaryName}
                  </p>

                  <p className="truncate font-mono text-xs text-(--color-text-secondary)">
                    {account.username}
                  </p>

                  {account.isLoggedIn !== null && (
                    <p className={cn("text-xs", account.isLoggedIn
                      ? "text-(--color-success)"
                      : "text-(--color-text-muted)"
                    )}>
                      {account.isLoggedIn ? "Innskráður" : "Útskráður"}
                    </p>
                  )}
                </div>

                <DuoShieldIcon state={mfaState} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-(--color-border-light) px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          Útskýringar
        </p>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
            <DuoShieldIcon state="active" size={16} />
            Duo tengt við tæki
          </span>

          <span className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
            <DuoShieldIcon state="pending" size={16} />
            Tæki ekki tengt eða í biðstöðu
          </span>

          <span className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
            <DuoShieldIcon state="none" size={16} />
            Duo ekki sett upp
          </span>
        </div>
      </div>
    </div>
  );
}