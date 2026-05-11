interface HostingSignOutDialogProps {
  username: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function HostingSignOutDialog({
  username,
  isLoading,
  onConfirm,
  onClose,
}: HostingSignOutDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-(--color-text)">
          Skrá út úr hýsingunni?
        </h2>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Virkri hýsingarlotu fyrir{" "}
          <span className="font-mono font-medium text-(--color-text)">
            {username}
          </span>{" "}
          verður lokað.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            Hætta við
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {isLoading ? "Skrái út..." : "Skrá út"}
          </button>
        </div>
      </div>
    </div>
  );
}