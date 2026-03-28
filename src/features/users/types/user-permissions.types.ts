/**
 * Permission flags for portal users — controls which modules a user can access in the sidebar and dashboard.
 * Uses: nothing — standalone file
 * Exports: UserPermissions
 */

export interface UserPermissions {
  invoices: boolean;
  subscription: boolean;
  hosting: boolean;
  pos: boolean;
  dkOne: boolean;
  dkPlus: boolean;
  timeclock: boolean;
  users: boolean;
}
