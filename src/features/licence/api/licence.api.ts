/**
 * Fetches the company licence from the API to find out which modules are enabled.
 * Uses: @/shared/api/client, ../types/licence.types
 * Exports: fetchLicence
 */
import { apiClient } from "@/shared/api/client";
import type { LicenceResponse } from "../types/licence.types";

/**
 *
 */
export async function fetchLicence(): Promise<LicenceResponse> {
  return apiClient.get<LicenceResponse>("/company/licence");
}
