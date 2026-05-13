/**
 * Vitest global test setup. Imports jest-dom matchers and patches globalThis.localStorage
 * with an in-memory implementation, because jsdom's built-in localStorage does not function
 * correctly in this environment.
 * Uses: @testing-library/jest-dom/vitest
 * Exports: nothing — side-effect only
 */
import "@testing-library/jest-dom/vitest";

// In-memory localStorage for tests — jsdom's localStorage is not functional in this environment
const makeLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: makeLocalStorage(),
  writable: true,
});
