import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkOneUsers, fetchCompanyUsers, fetchSubCompanies } from "./dkone.api";

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
