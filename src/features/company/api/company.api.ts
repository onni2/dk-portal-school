import type { Company } from "../types/company.types";

export async function getCompanies(): Promise<Company[]> {
  const res = await fetch(`${import.meta.env.VITE_MOCK_API_URL}/companies`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}