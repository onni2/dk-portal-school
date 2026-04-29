export interface AuthToken {
  id: string;
  description: string;
  companyId: string;
  companyName: string;
  token: string;
  createdAt: string;
}

export interface AuthTokenLog {
  id: string;
  tokenId: string;
  description: string;
  executedBy: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
}
