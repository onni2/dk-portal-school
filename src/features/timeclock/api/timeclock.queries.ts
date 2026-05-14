/**
 * React Query options and hooks for timeclock config, IP whitelist, and employee phone numbers.
 * Uses: ./timeclock.api
 * Exports: timeclockConfigQueryOptions, ipWhitelistQueryOptions, employeePhonesQueryOptions,
 *          useTimeclockConfig, useIpWhitelist, useEmployeePhones,
 *          useInvalidateIpWhitelist, useInvalidateEmployeePhones
 */
import {
  queryOptions,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchTimeclockConfig,
  fetchIpWhitelist,
  fetchEmployeePhones,
} from "./timeclock.api";

export const timeclockConfigQueryOptions = queryOptions({
  queryKey: ["timeclock-config"],
  queryFn: fetchTimeclockConfig,
});

export const ipWhitelistQueryOptions = queryOptions({
  queryKey: ["timeclock-ip-whitelist"],
  queryFn: fetchIpWhitelist,
});

export const employeePhonesQueryOptions = queryOptions({
  queryKey: ["timeclock-employee-phones"],
  queryFn: fetchEmployeePhones,
});

export function useTimeclockConfig() {
  return useSuspenseQuery(timeclockConfigQueryOptions);
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
  return () =>
    qc.invalidateQueries({ queryKey: ["timeclock-employee-phones"] });
}
