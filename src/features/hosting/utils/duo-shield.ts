import type { HostingAccount } from "../types/hosting.types";

export type DuoShieldState = "active" | "pending" | "none";

/**
 * Computes the Duo shield state for a hosting account.
 *
 * Priority: green > yellow > red
 * - active (green):  at least one connected Duo device
 * - pending (yellow): no connected devices, but an unexpired enrolment code exists
 * - none (red):      no connected devices and no pending enrolment
 */
export function getDuoShieldState(
  account: Pick<HostingAccount, "hasMfa" | "hasPendingActivation">,
): DuoShieldState {
  if (account.hasMfa) return "active";
  if (account.hasPendingActivation) return "pending";
  return "none";
}
