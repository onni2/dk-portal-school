/**
 * Mock data for timeclock IP whitelist and employee phone numbers.
 * Replace with real API calls once the backend supports it.
 */
import type {
  IpWhitelistEntry,
  EmployeePhoneEntry,
} from "@/features/timeclock/types/timeclock.types";

export const MOCK_IP_WHITELIST: IpWhitelistEntry[] = [
  { id: "1", ip: "192.168.1.10", label: "Aðalskrifstofa" },
  { id: "2", ip: "192.168.1.11", label: "Vörugeymsla" },
  { id: "3", ip: "10.0.0.5", label: "Útibú norður" },
];

export const MOCK_EMPLOYEE_PHONES: EmployeePhoneEntry[] = [
  {
    id: "1",
    employeeNumber: "1",
    employeeName: "Jón Jónsson",
    phone: "5551234",
  },
  {
    id: "2",
    employeeNumber: "2",
    employeeName: "Anna Sigurðardóttir",
    phone: "6662345",
  },
  {
    id: "3",
    employeeNumber: "3",
    employeeName: "Magnús Björnsson",
    phone: "7773456",
  },
];
