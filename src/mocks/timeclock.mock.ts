/**
 * Mock data for timeclock IP whitelist and employee phone numbers.
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
    kennitala: "1234567890",
    employeeName: "Jón Jónsson",
    phone: "5551234",
  },
  {
    id: "2",
    kennitala: "9876543210",
    employeeName: "Anna Sigurðardóttir",
    phone: "6662345",
  },
  {
    id: "3",
    kennitala: "0101754919",
    employeeName: "Magnús Björnsson",
    phone: "7773456",
  },
];
