/**
 * React Query options and hooks for dkOne users, company users, sub-companies, and DK roster.
 * Uses: @tanstack/react-query, ./dkone.api
 * Exports: dkOneUsersQueryOptions, companyUsersQueryOptions, subCompaniesQueryOptions,
 *          dkUsersQueryOptions, useDkOneUsers, useCompanyUsers, useSubCompanies, useDkUsers
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkOneUsers, fetchCompanyUsers, fetchSubCompanies, fetchAvailableCompanies, fetchDkUsers } from "./dkone.api";

export const dkOneUsersQueryOptions = queryOptions({
  queryKey: ["dkone-users"],
  queryFn: fetchDkOneUsers,
});

/** Suspense hook for dkOne users belonging to the active company. */
export function useDkOneUsers() {
  return useSuspenseQuery(dkOneUsersQueryOptions);
}

export const companyUsersQueryOptions = queryOptions({
  queryKey: ["dkone-company-users"],
  queryFn: fetchCompanyUsers,
});

/** Suspense hook for portal users belonging to the active company. */
export function useCompanyUsers() {
  return useSuspenseQuery(companyUsersQueryOptions);
}

export const subCompaniesQueryOptions = queryOptions({
  queryKey: ["dkone-sub-companies"],
  queryFn: fetchSubCompanies,
});

/** Suspense hook for sub-companies (umsýslustæði) under the active company. */
export function useSubCompanies() {
  return useSuspenseQuery(subCompaniesQueryOptions);
}

export const availableCompaniesQueryOptions = queryOptions({
  queryKey: ["dkone-available-companies"],
  queryFn: fetchAvailableCompanies,
});

export function useAvailableCompanies() {
  return useSuspenseQuery(availableCompaniesQueryOptions);
}

export const dkUsersQueryOptions = queryOptions({
  queryKey: ["dkone-dk-users"],
  queryFn: fetchDkUsers,
});

/** Suspense hook for the DK employee roster (used to invite employees to dkOne). */
export function useDkUsers() {
  return useSuspenseQuery(dkUsersQueryOptions);
}
