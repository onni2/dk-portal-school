import type { UserPermissions } from "@/features/auth/types/auth.types";

export interface SwitchCompanyResponse {
  token: string;
  companyDkToken: string | null;
  permissions: UserPermissions;
}

export async function switchCompany(companyId: string): Promise<SwitchCompanyResponse> {
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