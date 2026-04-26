/**
 * Notification bell in the header. Shows unread count badge, lists notifications,
 * allows marking individual or all as read.
 * Uses: @/shared/utils/cn, ../api/notifications.queries
 * Exports: NotificationBell
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../api/notifications.queries";

/**
 *
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sort: unread first, then read
  const sorted = [
    ...notifications.filter((n) => !n.read),
    ...notifications.filter((n) => n.read),
  ];
  const hasUnread = notifications.some((n) => !n.read);
  const allRead = notifications.length > 0 && !hasUnread;

  // Close dropdown when clicking outside
  useEffect(() => {
    /**
     *
     */
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative rounded-[var(--radius-lg)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
          open && "bg-[var(--color-surface-hover)] text-[var(--color-text)]",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg transition-all duration-200 ease-in-out",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            Tilkynningar
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
                {unreadCount} ólesið
              </span>
            )}
          </p>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: "16rem" }}>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">Engar tilkynningar</p>
            </div>
          ) : (
            sorted.map((n, i) => {
              const isFirstRead = n.read && !sorted[i - 1]?.read && allRead === false;
              return (
                <div key={n.id}>
                  {/* Divider between unread and read */}
                  {isFirstRead && (
                    <div className="flex items-center gap-2 px-4 py-1">
                      <div className="h-px flex-1 bg-[var(--color-border)]" />
                      <span className="text-[10px] text-[var(--color-text-muted)]">Lesið</span>
                      <div className="h-px flex-1 bg-[var(--color-border)]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]",
                      n.read && "opacity-50",
                      i !== 0 && !isFirstRead && "border-t border-[var(--color-border)]",
                    )}
                  >
                    {/* Unread dot */}
                    <span className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      n.read ? "bg-transparent" : "bg-[var(--color-primary)]",
                    )} />

                    {/* Content — click to mark as read */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); !n.read && markAsRead(n.id); }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className={cn(
                        "text-sm",
                        n.read ? "font-normal text-[var(--color-text-secondary)]" : "font-medium text-[var(--color-text)]",
                      )}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {n.message}
                      </p>
                    </button>

                    {/* Delete button — shows on hover */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                      className="icon-btn ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-2">
            {allRead ? (
              <p className="text-xs text-[var(--color-text-muted)]">✓ Allt lesið</p>
            ) : (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Merkja allt lesið
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}