/**
 * TypeScript types for DK Plus authentication tokens, API call log entries, and companies.
 * Uses: nothing — standalone file
 * Exports: AuthToken, AuthTokenApiLog, Company
 */
export interface AuthToken {
  id: string;
  description: string;
  companyId: string;
  companyName: string;
  token: string;
  createdAt: string;
}

export interface AuthTokenApiLog {
  id: string;
  tokenId: string;
  userName: string;
  uri: string;
  method: string;
  query: string;
  statusCode: number;
  ipAddress: string;
  userAgent: string;
  bandwidthUpload: number;
  bandwidthDownload: number;
  timeTaken: number;
  error: string | null;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
}
