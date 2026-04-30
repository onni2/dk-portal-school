import { mockClient } from "@/shared/api/mockClient";
import type { DkOneUser } from "../types/dkone.types";

export async function fetchDkOneUsers(): Promise<DkOneUser[]> {
  return mockClient.get<DkOneUser[]>("/dkone/users");
}

export async function setDkOneAccess(userId: string, dkOne: boolean): Promise<void> {
  return mockClient.patch<void>(`/dkone/users/${userId}`, { dkOne });
}
