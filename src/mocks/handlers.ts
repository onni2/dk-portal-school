/**
 * Shared mock utility. Provides a delay() helper that simulates network latency in mock API functions.
 * Uses: nothing — standalone file
 * Exports: delay
 * Author: Haukur — example/scaffold, use as template
 */
/** Simulate network latency */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
