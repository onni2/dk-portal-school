import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmployeePhonesPanel } from "../components/EmployeePhonesPanel";
import { useTimeclockStore } from "../store/timeclock.store";

const addEmployeePhone = vi.fn(
  (kennitala: string, employeeName: string, phone: string) =>
    Promise.resolve({ id: String(Date.now()), kennitala, employeeName, phone }),
);
const removeEmployeePhone = vi.fn(() => Promise.resolve());

vi.mock("../api/timeclock.queries", () => ({
  useEmployeePhones: () => ({
    data: [
      { id: "1", kennitala: "1234567890", employeeName: "Jón Jónsson", phone: "5551234" },
      { id: "2", kennitala: "9876543210", employeeName: "Anna Sigurðardóttir", phone: "6662345" },
    ],
  }),
  useInvalidateEmployeePhones: () => () => Promise.resolve(),
}));

vi.mock("../api/timeclock.api", () => ({
  get addEmployeePhone() { return addEmployeePhone; },
  get removeEmployeePhone() { return removeEmployeePhone; },
}));

beforeEach(() => {
  useTimeclockStore.setState({ addIpOpen: false, addPhoneOpen: false });
  vi.clearAllMocks();
});

describe("EmployeePhonesPanel", () => {
  it("renders the panel title", () => {
    render(<EmployeePhonesPanel />);
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });

  it("renders all employee entries", () => {
    render(<EmployeePhonesPanel />);
    expect(screen.getByText("Jón Jónsson")).toBeInTheDocument();
    expect(screen.getByText("Anna Sigurðardóttir")).toBeInTheDocument();
  });

  it("renders kennitala and phone for each entry", () => {
    render(<EmployeePhonesPanel />);
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    expect(screen.getByText(/5551234/)).toBeInTheDocument();
  });

  it("opens the add form when + Bæta við is clicked", async () => {
    render(<EmployeePhonesPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    expect(screen.getByPlaceholderText("Kennitala (10 tölustafir)")).toBeInTheDocument();
  });

  it("closes the form when Hætta við is clicked", async () => {
    render(<EmployeePhonesPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.click(screen.getByText("Hætta við"));
    expect(screen.queryByPlaceholderText("Kennitala (10 tölustafir)")).not.toBeInTheDocument();
  });

  it("calls addEmployeePhone with the entered values", async () => {
    render(<EmployeePhonesPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("Kennitala (10 tölustafir)"), "0101754919");
    await userEvent.type(screen.getByPlaceholderText("Nafn (valkvætt)"), "Magnús Björnsson");
    await userEvent.type(screen.getByPlaceholderText("Símanúmer"), "7773456");
    await userEvent.click(screen.getByText("Vista"));
    expect(addEmployeePhone).toHaveBeenCalledWith("0101754919", "Magnús Björnsson", "7773456");
  });

  it("does not call addEmployeePhone when kennitala or phone is empty", async () => {
    render(<EmployeePhonesPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("Kennitala (10 tölustafir)"), "0101754919");
    await userEvent.click(screen.getByText("Vista"));
    expect(addEmployeePhone).not.toHaveBeenCalled();
  });

  it("falls back to kennitala when name is not set", () => {
    render(<EmployeePhonesPanel />);
    expect(screen.getByText("Jón Jónsson")).toBeInTheDocument();
  });

  it("calls removeEmployeePhone with the correct id", async () => {
    render(<EmployeePhonesPanel />);
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]!);
    expect(removeEmployeePhone).toHaveBeenCalledWith("1");
  });

  it("calls removeEmployeePhone only for the clicked entry", async () => {
    render(<EmployeePhonesPanel />);
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]!);
    expect(removeEmployeePhone).toHaveBeenCalledTimes(1);
    expect(removeEmployeePhone).toHaveBeenCalledWith("1");
  });

  it("does not call addEmployeePhone when kennitala is only whitespace", async () => {
    render(<EmployeePhonesPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("Kennitala (10 tölustafir)"), "   ");
    await userEvent.type(screen.getByPlaceholderText("Símanúmer"), "9998888");
    await userEvent.click(screen.getByText("Vista"));
    expect(addEmployeePhone).not.toHaveBeenCalled();
  });
});
