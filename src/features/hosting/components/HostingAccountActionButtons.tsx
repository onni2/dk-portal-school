interface HostingAccountActionButtonsProps {
  loggedIn: boolean;
  portalUserLinked?: boolean;

  onManagePortalUserLink?: () => void;
  onChangePassword?: () => void;
  onSignOut: () => void;

  managePortalUserLinkDisabled?: boolean;
  passwordDisabled?: boolean;
  signOutDisabled?: boolean;
  passwordLoading?: boolean;
  signOutLoading?: boolean;

  passwordLabel?: string;
  passwordLoadingLabel?: string;

  onDeleteAccount?: () => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
}

function LinkUserIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
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

function TrashIcon({ className }: { className?: string }) {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

export function HostingAccountActionButtons({
  loggedIn,
  portalUserLinked,
  onManagePortalUserLink,
  onChangePassword,
  onSignOut,
  managePortalUserLinkDisabled,
  passwordDisabled,
  signOutDisabled,
  passwordLoading,
  signOutLoading,
  passwordLabel = "Breyta lykilorði",
  passwordLoadingLabel = "Breyti...",
  onDeleteAccount,
  deleteDisabled,
  deleteLoading,
}: HostingAccountActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      {onManagePortalUserLink && (
        <button
          type="button"
          onClick={onManagePortalUserLink}
          disabled={managePortalUserLinkDisabled}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
        >
          <LinkUserIcon className="h-4 w-4" />
          {portalUserLinked
            ? "Breyta tengingu"
            : "Tengja við notanda"}
        </button>
      )}

      <button
        type="button"
        onClick={onChangePassword}
        disabled={!onChangePassword || passwordDisabled || passwordLoading}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover) disabled:opacity-50"
      >
        <LockIcon className="h-4 w-4" />
        {passwordLoading ? passwordLoadingLabel : passwordLabel}
      </button>

      {onDeleteAccount && (
        <button
          type="button"
          onClick={onDeleteAccount}
          disabled={deleteDisabled || deleteLoading}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-(--color-error) px-4 py-2 text-sm font-medium text-(--color-error) hover:bg-(--color-error-bg) disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
          {deleteLoading ? "Eyði..." : "Eyða aðgangi"}
        </button>
      )}

      {loggedIn && (
        <button
          type="button"
          onClick={onSignOut}
          disabled={signOutDisabled || signOutLoading}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
        >
          <LogOutIcon className="h-4 w-4" />
          {signOutLoading ? "Skrái út..." : "Skrá út"}
        </button>
      )}
    </div>
  );
}