/**
 * TypeScript types for timeclock settings, web config, IP whitelist, and employee phone numbers.
 * Uses: nothing — standalone file
 * Exports: TimeclockSettings, TimeclockWebConfig, IpWhitelistEntry, EmployeePhoneEntry
 */

/** Real shape from GET /TimeClock/settings */
export interface TimeclockSettings {
  Enabled: boolean;
  Text: number;
  Project: number;
  Phase: number;
  Task: number;
  Dim1: number;
  Dim2: number;
  Dim3: number;
  SendToProjectTransaction: boolean;
  RoundUpDaytimeAlso: boolean;
  RoundFactor: number;
}

/** Real shape from GET /TimeClock/web/config?host= */
export interface TimeclockWebConfig {
  Enabled: boolean;
  Company: string;
  CompanyName: string;
}

/** Local-only until API supports it */
export interface IpWhitelistEntry {
  id: string;
  ip: string;
  label: string;
}

/** Local-only until API supports it */
export interface EmployeePhoneEntry {
  id: string;
  employeeNumber: string;
  employeeName: string;
  phone: string;
}
