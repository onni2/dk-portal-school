/**
 * React Query options and hooks for timeclock settings, IP whitelist, and employee phone numbers.
 * Uses: ./timeclock.api
 * Exports: timeclockSettingsQueryOptions, ipWhitelistQueryOptions, employeePhonesQueryOptions,
 *          useTimeclockSettings, useIpWhitelist, useEmployeePhones
 */
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTimeclockSettings,
  fetchIpWhitelist,
  fetchEmployeePhones,
} from "./timeclock.api";

export const timeclockSettingsQueryOptions = queryOptions({
  queryKey: ["timeclock-settings"],
  queryFn: fetchTimeclockSettings,
  staleTime: 10 * 60 * 1000,
});

export const ipWhitelistQueryOptions = queryOptions({
  queryKey: ["timeclock-ip-whitelist"],
  queryFn: fetchIpWhitelist,
});

export const employeePhonesQueryOptions = queryOptions({
  queryKey: ["timeclock-employee-phones"],
  queryFn: fetchEmployeePhones,
});

export function useTimeclockSettings() {
  return useSuspenseQuery(timeclockSettingsQueryOptions);
}

export function useIpWhitelist() {
  return useSuspenseQuery(ipWhitelistQueryOptions);
}

export function useEmployeePhones() {
  return useSuspenseQuery(employeePhonesQueryOptions);
}

export function useInvalidateIpWhitelist() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["timeclock-ip-whitelist"] });
}

export function useInvalidateEmployeePhones() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["timeclock-employee-phones"] });
}
