import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkOneUsers, fetchCompanyUsers, fetchSubCompanies, fetchAvailableCompanies, fetchDkUsers } from "./dkone.api";

export const dkOneUsersQueryOptions = queryOptions({
  queryKey: ["dkone-users"],
  queryFn: fetchDkOneUsers,
});

export function useDkOneUsers() {
  return useSuspenseQuery(dkOneUsersQueryOptions);
}

export const companyUsersQueryOptions = queryOptions({
  queryKey: ["dkone-company-users"],
  queryFn: fetchCompanyUsers,
});

export function useCompanyUsers() {
  return useSuspenseQuery(companyUsersQueryOptions);
}

export const subCompaniesQueryOptions = queryOptions({
  queryKey: ["dkone-sub-companies"],
  queryFn: fetchSubCompanies,
});

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

export function useDkUsers() {
  return useSuspenseQuery(dkUsersQueryOptions);
}
