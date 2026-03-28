import { describe, it, expect, beforeEach } from "vitest";
import { useTimeclockStore } from "../store/timeclock.store";

// Reset the store before each test so they don't affect each other
beforeEach(() => {
  useTimeclockStore.setState({ addIpOpen: false, addPhoneOpen: false });
});

describe("useTimeclockStore", () => {
  it("starts with both modals closed", () => {
    const { addIpOpen, addPhoneOpen } = useTimeclockStore.getState();
    expect(addIpOpen).toBe(false);
    expect(addPhoneOpen).toBe(false);
  });

  it("opens the IP modal", () => {
    useTimeclockStore.getState().setAddIpOpen(true);
    expect(useTimeclockStore.getState().addIpOpen).toBe(true);
  });

  it("closes the IP modal", () => {
    useTimeclockStore.getState().setAddIpOpen(true);
    useTimeclockStore.getState().setAddIpOpen(false);
    expect(useTimeclockStore.getState().addIpOpen).toBe(false);
  });

  it("opens the phone modal", () => {
    useTimeclockStore.getState().setAddPhoneOpen(true);
    expect(useTimeclockStore.getState().addPhoneOpen).toBe(true);
  });

  it("opening one modal does not affect the other", () => {
    useTimeclockStore.getState().setAddIpOpen(true);
    expect(useTimeclockStore.getState().addPhoneOpen).toBe(false);
  });
});
