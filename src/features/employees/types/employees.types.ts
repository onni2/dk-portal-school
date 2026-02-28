/**
 * TypeScript type for an employee as returned by the dkPlus API.
 * Uses: nothing — standalone file
 * Exports: Employee
 */
export interface Employee {
  Number: string;
  Name: string;
  SSNumber?: string;
  Address1?: string;
  ZipCode?: string;
  Phone?: string;
  PhoneMobile?: string;
  Email?: string;
  Status: number; // 0 = Active
  Gender: number;
  StampStatus?: number;
  Created: string;
  Modified: string;
}
