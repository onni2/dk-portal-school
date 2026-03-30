/**
 * Mock hosting accounts for development.
 * Replace with apiClient.get("/hosting/accounts") when backend is ready.
 */
export interface HostingAccount {
  username: string;
  displayName: string;
}

export const MOCK_HOSTING_ACCOUNTS: HostingAccount[] = [
  { username: "fyr.agusta", displayName: "fyr.agusta" },
  { username: "fyr.bjorn", displayName: "fyr.bjorn" },
  { username: "fyr.gudrun", displayName: "fyr.gudrun" },
  { username: "fyr.halldor", displayName: "fyr.halldor" },
  { username: "fyr.sigrid", displayName: "fyr.sigrid" },
];
