/**
 * Fetches the company's module access from the portal backend (company_licences table).
 * Uses: @/shared/api/mockClient, ../types/licence.types
 * Exports: fetchLicence
 */
import { mockClient } from "@/shared/api/mockClient";
import type { LicenceResponse } from "../types/licence.types";

export async function fetchLicence(): Promise<LicenceResponse> {
  return mockClient.get<LicenceResponse>("/licence");
}
