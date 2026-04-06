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

export async function switchCompany(companyId: string): Promise<{ token: string; companyDkToken: string }> {
  const res = await fetch(`${import.meta.env.VITE_MOCK_API_URL}/auth/switch-company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
    },
    body: JSON.stringify({ companyId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Ekki tókst að skipta um fyrirtæki");
  }

  return res.json();
}