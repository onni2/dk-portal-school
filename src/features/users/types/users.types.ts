/**
 * TypeScript types for portal users (employees with access to Mínar síður).
 * Uses: nothing — standalone file
 * Exports: Employee, UserPermissions, PortalUser
 */

// Shape returned by GET /general/employee
export interface Employee {
  Number: string;
  Name: string;
  SSNumber?: string;
  Phone?: string;
  PhoneMobile?: string;
  Email?: string;
  Status: number; // 0 = Active
  Gender: number;
  StampStatus?: number;
  Created: string;
  Modified: string;
}

export interface UserPermissions {
  invoices: boolean;
  hosting: boolean;
  pos: boolean;
  dkOne: boolean;
  dkPlus: boolean;
  timeclock: boolean;
  users: boolean;
  subscription: boolean;
}

// Employee + portal permissions combined
export interface PortalUser extends Employee {
  hostingUsername?: string;
  permissions: UserPermissions;
}
