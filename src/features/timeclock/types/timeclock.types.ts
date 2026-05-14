/**
 * TypeScript types for timeclock IP whitelist, employee phone numbers, and company config.
 * Uses: nothing — standalone file
 * Exports: IpWhitelistEntry, EmployeePhoneEntry, TimeclockConfig
 */

export interface IpWhitelistEntry {
  id: string;
  ip: string;
  label: string;
}

export interface EmployeePhoneEntry {
  id: string;
  kennitala: string;
  employeeName: string;
  phone: string;
}

/** Company name and fake stimpilklukka site URL from the portal backend */
export interface TimeclockConfig {
  companyName: string;
  timeclockUrl: string | null;
}
