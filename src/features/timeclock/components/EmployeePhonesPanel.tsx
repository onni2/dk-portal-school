/**
 * Panel for viewing and managing employee phone numbers used to clock in at kiosks.
 * Add/remove is mock-only until the backend supports it.
 * Uses: @/shared/components/Button, @/shared/components/Card, @/shared/components/Input,
 *       ../api/timeclock.queries, ../store/timeclock.store
 * Exports: EmployeePhonesPanel
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useEmployeePhones } from "../api/timeclock.queries";
import { useTimeclockStore } from "../store/timeclock.store";
import type { EmployeePhoneEntry } from "../types/timeclock.types";

export function EmployeePhonesPanel() {
  const { data: initial } = useEmployeePhones();
  const { addPhoneOpen, setAddPhoneOpen } = useTimeclockStore();

  const [entries, setEntries] = useState<EmployeePhoneEntry[]>(initial);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [phone, setPhone] = useState("");

  function handleAdd() {
    if (!employeeNumber.trim() || !phone.trim()) return;
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        employeeNumber: employeeNumber.trim(),
        employeeName: employeeName.trim(),
        phone: phone.trim(),
      },
    ]);
    setEmployeeNumber("");
    setEmployeeName("");
    setPhone("");
    setAddPhoneOpen(false);
  }

  function handleRemove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Símanúmer starfsmanna
            </h2>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
              Mock
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Starfsmenn nota símanúmer sitt til að skrá sig inn á stimpilklukku.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setAddPhoneOpen(true)}
        >
          + Bæta við
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
          Engir starfsmenn með skráð símanúmer.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {entry.employeeName || entry.employeeNumber}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {entry.phone}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(entry.id)}
              >
                Fjarlægja
              </Button>
            </li>
          ))}
        </ul>
      )}

      {addPhoneOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
          <Input
            placeholder="Númer starfsmanns"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
          />
          <Input
            placeholder="Nafn (valkvætt)"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          />
          <Input
            placeholder="Símanúmer"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>
              Vista
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddPhoneOpen(false)}
            >
              Hætta við
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
