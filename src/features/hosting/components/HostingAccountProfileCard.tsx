/**
 * Sidebar profile card for the logged-in user's hosting account — shows name, username, login status, MFA state, and action buttons.
 * Uses: @/shared/utils/cn
 * Exports: HostingAccountProfileCard
 */
import { cn } from "@/shared/utils/cn";

interface HostingAccountProfileCardProps {
  username: string;
  displayName: string;
  hasMfa?: boolean;
  activeDeviceCount: number;
  loggedIn: boolean;
  onChangePassword: () => void;
  onSignOut: () => void;
  signOutDisabled?: boolean;
  passwordDisabled?: boolean;
  signOutLoading?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/** Profile card sidebar showing the user's hosting account details and password/sign-out action buttons. */
export function HostingAccountProfileCard({
  username,
  displayName,
  hasMfa,
  activeDeviceCount,
  loggedIn,
  onChangePassword,
  onSignOut,
  signOutDisabled,
  passwordDisabled,
  signOutLoading,
}: HostingAccountProfileCardProps) {
  const initials = getInitials(displayName);

  return (
    <aside className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary) text-lg font-semibold text-white">
          {initials || "U"}
        </div>

        <h2 className="mt-3 text-base font-semibold text-(--color-text)">
          {displayName}
        </h2>

        <p className="mt-1 font-mono text-sm text-(--color-text-secondary)">
          {username}
        </p>

        <div className="mt-4 flex flex-col items-center">
          {loggedIn ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-(--color-success) bg-(--color-success-bg) px-3 py-1 text-xs font-semibold text-(--color-success)">
              <span className="h-2 w-2 rounded-full bg-(--color-success)" />
              Innskráð(ur)
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface-hover) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
              <span className="h-2 w-2 rounded-full bg-(--color-text-muted)" />
              Útskráð(ur)
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-start gap-2 border-t border-(--color-border-light) pt-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            hasMfa
              ? "bg-(--color-success-bg) text-(--color-success)"
              : "bg-amber-100 text-amber-700",
          )}
        >
          MFA {hasMfa ? "Virkt" : "Óvirkt"}
        </span>

        <span className="inline-flex items-center  px-2.5 py-1 text-xs font-semibold text-(--color-text-secondary)">
          {activeDeviceCount} virk tæki
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          onClick={onChangePassword}
          disabled={passwordDisabled}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
        >
          <LockIcon className="h-4 w-4" />
          Breyta lykilorði
        </button>

        {loggedIn && (
          <button
            onClick={onSignOut}
            disabled={signOutDisabled}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            <LogOutIcon className="h-4 w-4" />
            {signOutLoading ? "Skrái út..." : "Skrá út"}
          </button>
        )}
      </div>
    </aside>
  );
}