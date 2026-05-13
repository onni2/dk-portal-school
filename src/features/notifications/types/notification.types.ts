/**
 * TypeScript types for the notification domain.
 * Uses: nothing — standalone file
 * Exports: Notification
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}