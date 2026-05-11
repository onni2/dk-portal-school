import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useEmployeePhones } from "../api/timeclock.queries";
import { addEmployeePhone, removeEmployeePhone } from "../api/timeclock.api";
import { useTimeclockStore } from "../store/timeclock.store";

export function EmployeePhonesPanel() {
  const { data: entries } = useEmployeePhones();
  const qc = useQueryClient();
  const { addPhoneOpen, setAddPhoneOpen } = useTimeclockStore();
  const [kennitala, setKennitala] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [phone, setPhone] = useState("");

  const addMutation = useMutation({
    mutationFn: ({ kennitala, employeeName, phone }: { kennitala: string; employeeName: string; phone: string }) =>
      addEmployeePhone(kennitala, employeeName, phone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeclock-employee-phones"] });
      setKennitala("");
      setEmployeeName("");
      setPhone("");
      setAddPhoneOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeEmployeePhone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeclock-employee-phones"] }),
  });

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
                  {entry.employeeName || entry.kennitala}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {entry.kennitala} · {entry.phone}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeMutation.mutate(entry.id)}
                disabled={removeMutation.isPending && removeMutation.variables === entry.id}
              >
                {removeMutation.isPending && removeMutation.variables === entry.id ? "..." : "Fjarlægja"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {addPhoneOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-(--color-border) pt-4">
          <Input
            placeholder="Kennitala (10 tölustafir)"
            value={kennitala}
            onChange={(e) => setKennitala(e.target.value)}
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
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (kennitala.trim() && phone.trim())
                  addMutation.mutate({ kennitala: kennitala.trim(), employeeName: employeeName.trim(), phone: phone.trim() });
              }}
              disabled={addMutation.isPending || !kennitala.trim() || !phone.trim()}
            >
              {addMutation.isPending ? "Vista..." : "Vista"}
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
