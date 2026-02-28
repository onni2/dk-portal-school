/**
 * React Query options and hooks for timeclock entries, employee statuses, settings, and web config.
 * Uses: ./timeclock.api
 * Exports: timeclockEntriesQueryOptions, timeclockEmployeesQueryOptions, timeclockSettingsQueryOptions, timeclockWebConfigQueryOptions, useTimeclockEntries, useTimeclockEmployees, useTimeclockSettings, useTimeclockWebConfig
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchTimeclockEntries,
  fetchTimeclockEmployees,
  fetchTimeclockSettings,
  fetchTimeclockWebConfig,
} from "./timeclock.api";

export const timeclockEntriesQueryOptions = queryOptions({
  queryKey: ["timeclock-entries"],
  queryFn: fetchTimeclockEntries,
});

export const timeclockEmployeesQueryOptions = queryOptions({
  queryKey: ["timeclock-employees"],
  queryFn: fetchTimeclockEmployees,
});

export const timeclockSettingsQueryOptions = queryOptions({
  queryKey: ["timeclock-settings"],
  queryFn: fetchTimeclockSettings,
  staleTime: 10 * 60 * 1000, // settings don't change often — cache for 10 minutes
});

export const timeclockWebConfigQueryOptions = queryOptions({
  queryKey: ["timeclock-web-config"],
  queryFn: fetchTimeclockWebConfig,
  staleTime: 10 * 60 * 1000,
});

/**
 *
 */
export function useTimeclockEntries() {
  return useSuspenseQuery(timeclockEntriesQueryOptions);
}

/**
 *
 */
export function useTimeclockEmployees() {
  return useSuspenseQuery(timeclockEmployeesQueryOptions);
}

/**
 *
 */
export function useTimeclockSettings() {
  return useSuspenseQuery(timeclockSettingsQueryOptions);
}

/**
 *
 */
export function useTimeclockWebConfig() {
  return useSuspenseQuery(timeclockWebConfigQueryOptions);
}
