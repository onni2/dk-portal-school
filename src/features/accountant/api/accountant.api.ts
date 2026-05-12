/**
 * Accountant API — fetches accountant data from the backend.
 * Exports: getAccountantCompanies, getSubmissions, getTransactions, getDocuments
 */

const BASE = import.meta.env.VITE_MOCK_API_URL;
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
});

export interface AccountantCompany {
  id: string;
  name: string;
  role: string;
}

export type SubmissionStatus = "skilað" | "í bið" | "gjaldfallið";

export interface Submission {
  companyId: string;
  companyName: string;
  period: string;
  type: string;
  status: SubmissionStatus;
  dueDate: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  description: string;
  amount: number;
  type: "tekjur" | "gjöld";
  status: "bókað" | "óbókað";
}

export interface AccountantDocument {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  type: string;
  date: string;
  status: "sent" | "uppkast";
}

export async function getAccountantCompanies(): Promise<AccountantCompany[]> {
  const res = await fetch(`${BASE}/accountant/companies`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch accountant companies");
  return res.json();
}

export async function getSubmissions(): Promise<Submission[]> {
  const res = await fetch(`${BASE}/accountant/submissions`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}

export async function getTransactions(companyId?: string): Promise<Transaction[]> {
  const url = companyId
    ? `${BASE}/accountant/transactions?companyId=${companyId}`
    : `${BASE}/accountant/transactions`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function getDocuments(companyId?: string): Promise<AccountantDocument[]> {
  const url = companyId
    ? `${BASE}/accountant/documents?companyId=${companyId}`
    : `${BASE}/accountant/documents`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}