/**
 * Panel for viewing and managing employee phone numbers used to clock in at kiosks.
 * Data is stored in Neon, scoped per company.
 * Uses: @/shared/components/Button, @/shared/components/Card, @/shared/components/Input,
 *       ../api/timeclock.queries, ../api/timeclock.api, ../store/timeclock.store
 * Exports: EmployeePhonesPanel
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useEmployeePhones, useInvalidateEmployeePhones } from "../api/timeclock.queries";
import { addEmployeePhone, removeEmployeePhone } from "../api/timeclock.api";
import { useTimeclockStore } from "../store/timeclock.store";

export function EmployeePhonesPanel() {
  const { data: entries } = useEmployeePhones();
  const invalidate = useInvalidateEmployeePhones();
  const { addPhoneOpen, setAddPhoneOpen } = useTimeclockStore();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!employeeNumber.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await addEmployeePhone(employeeNumber.trim(), employeeName.trim(), phone.trim());
      await invalidate();
      setEmployeeNumber("");
      setEmployeeName("");
      setPhone("");
      setAddPhoneOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeEmployeePhone(id);
      await invalidate();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-(--color-text)">
            Símanúmer starfsmanna
          </h2>
          <p className="mt-0.5 text-xs text-(--color-text-muted)">
            Starfsmenn nota símanúmer sitt til að skrá sig inn á stimpilklukku.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setAddPhoneOpen(true)}>
          + Bæta við
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--color-text-muted)">
          Engir starfsmenn með skráð símanúmer.
        </p>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-(--color-text)">
                  {entry.employeeName || entry.employeeNumber}
                </p>
                <p className="text-xs text-(--color-text-muted)">{entry.phone}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(entry.id)}
                disabled={removingId === entry.id}
              >
                {removingId === entry.id ? "..." : "Fjarlægja"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {addPhoneOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-(--color-border) pt-4">
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
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={saving || !employeeNumber.trim() || !phone.trim()}>
              {saving ? "Vista..." : "Vista"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAddPhoneOpen(false)}>
              Hætta við
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
