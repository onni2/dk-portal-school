import { mockClient } from "@/shared/api/mockClient";
import type { DuoStatus } from "../types/duo.types";

export type DuoActivationResponse = {
  phone_id: string;
  activation_barcode?: string | null;
  activation_msg?: string | null;
  installation_msg?: string | null;
};

export async function fetchDuoStatus(): Promise<DuoStatus> {
  return mockClient.get<DuoStatus>("/duo/status");
}

export async function enrollDuoPhone(
  number: string
): Promise<DuoActivationResponse> {
  return mockClient.post<DuoActivationResponse>("/duo/phones", { number });
}

export async function resendDuoActivation(
  phoneId: string
): Promise<DuoActivationResponse> {
  return mockClient.post<DuoActivationResponse>(
    `/duo/phones/${phoneId}/resend`,
    {}
  );
}

export async function deleteDuoPhone(phoneId: string): Promise<{ ok: true }> {
  return mockClient.delete<{ ok: true }>(`/duo/phones/${phoneId}`);
}