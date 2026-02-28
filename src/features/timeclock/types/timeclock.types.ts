/**
 * TypeScript types for timeclock entries, employee stamp status, stamp input, and the stamp API response.
 * Uses: nothing — standalone file
 * Exports: TimeclockEntry, TimeclockEmployee, StampInput, StampResponse, TimeclockSettings, TimeclockWebConfig
 */
export interface TimeclockEntry {
  ID: number;
  Employee: string;
  EmployeeName: string;
  Start: string;
  End: string | null;
  TotalHours: number;
  TotalMinutes: number;
  Project: string;
  Phase: string;
  Task: string;
  Comment: string;
  CurrentStatus: number; // 1 = clocked in, -1 = clocked out
  Processed: boolean;
}

export interface TimeclockEmployee {
  Number: string;
  Name: string;
  Email: string;
  StampStatus: number; // 1 = clocked in, -1 = clocked out
  LastStampTime: string;
}

export interface StampInput {
  employeeNumber: string;
  comment?: string;
  project?: string;
}

export interface StampResponse {
  success: boolean;
  newStatus: number;
  entry?: TimeclockEntry;
}

// Shape unknown until we call the real API — tighten this up once we see the response
export type TimeclockSettings = Record<string, unknown>;
export type TimeclockWebConfig = Record<string, unknown>;
