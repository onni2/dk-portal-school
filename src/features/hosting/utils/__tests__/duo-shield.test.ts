import { describe, it, expect } from "vitest";
import { getDuoShieldState } from "../duo-shield";

describe("getDuoShieldState", () => {
  describe("active (green) — connected device takes highest priority", () => {
    it("returns active when a connected device exists and no pending enrolment", () => {
      expect(
        getDuoShieldState({ hasMfa: true, hasPendingActivation: false }),
      ).toBe("active");
    });

    it("returns active when a connected device exists even with an unexpired pending enrolment", () => {
      // A pending enrolment must never override an already connected device.
      expect(
        getDuoShieldState({ hasMfa: true, hasPendingActivation: true }),
      ).toBe("active");
    });
  });

  describe("pending (yellow) — no connected device, unexpired enrolment", () => {
    it("returns pending when no connected device but an unexpired enrolment exists", () => {
      expect(
        getDuoShieldState({ hasMfa: false, hasPendingActivation: true }),
      ).toBe("pending");
    });
  });

  describe("none (red) — no connected device, no valid enrolment", () => {
    it("returns none when no connected device and no enrolment at all", () => {
      expect(
        getDuoShieldState({ hasMfa: false, hasPendingActivation: false }),
      ).toBe("none");
    });

    it("returns none when no connected device and enrolment is expired", () => {
      // An expired enrolment is excluded by the backend EXISTS check, so it
      // arrives here as hasPendingActivation: false — same result as no enrolment.
      expect(
        getDuoShieldState({ hasMfa: false, hasPendingActivation: false }),
      ).toBe("none");
    });
  });
});
