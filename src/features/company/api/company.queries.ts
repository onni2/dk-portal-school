import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "./company.api";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });
}