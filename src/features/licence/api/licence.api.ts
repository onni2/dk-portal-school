/**
 * Fetches the company licence — currently returns mock data.
 * To connect to the real API: replace the mock body with `return apiClient.get<LicenceResponse>("/company/licence");`
 * Uses: @/mocks/handlers, @/mocks/licence.mock, ../types/licence.types
 * Exports: fetchLicence
 */
import { delay } from "@/mocks/handlers";
import { MOCK_LICENCE } from "@/mocks/licence.mock";
import type { LicenceResponse } from "../types/licence.types";

export async function fetchLicence(): Promise<LicenceResponse> {
  await delay(300);
  return MOCK_LICENCE;
}
