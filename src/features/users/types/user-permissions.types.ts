/**
 * Permission flags for portal users — controls which modules a user can access
 * in the sidebar and dashboard for the active company.
 *
 * Backend stores these flags on user_companies.
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