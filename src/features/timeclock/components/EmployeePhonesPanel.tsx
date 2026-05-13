/**
 * Card panel for managing the list of employee phone numbers used for timeclock check-in.
 * Uses: ../api/timeclock.queries, ../api/timeclock.api, ../store/timeclock.store, @/shared/components/*
 * Exports: EmployeePhonesPanel
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useEmployeePhones } from "../api/timeclock.queries";
import { addEmployeePhone, removeEmployeePhone } from "../api/timeclock.api";
import { useTimeclockStore } from "../store/timeclock.store";

/** Lists registered employee phones and provides a form to add new entries or remove existing ones. */
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

  function handleClose() {
    setKennitala("");
    setEmployeeName("");
    setPhone("");
    setAddPhoneOpen(false);
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-(--color-text)">Símanúmer starfsmanna</h2>
            <p className="mt-0.5 text-xs text-(--color-text-muted)">
              Starfsmenn nota símanúmer sitt til að skrá sig inn á stimpilklukku.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={() => setAddPhoneOpen(true)}>
            + Bæta við
          </Button>
        </div>

        {entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-(--color-text-muted)">Engir starfsmenn með skráð símanúmer.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Nafn</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Kennitala</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Símanúmer</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                    <td className="px-4 py-3 font-medium text-[#0B0F1A]">{entry.employeeName || "—"}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{entry.kennitala}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{entry.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMutation.mutate(entry.id)}
                        disabled={removeMutation.isPending && removeMutation.variables === entry.id}
                      >
                        {removeMutation.isPending && removeMutation.variables === entry.id ? "..." : "Fjarlægja"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {addPhoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
          <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-(--color-text)">Bæta við starfsmanni</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (kennitala.trim() && phone.trim())
                  addMutation.mutate({ kennitala: kennitala.trim(), employeeName: employeeName.trim(), phone: phone.trim() });
              }}
              className="flex flex-col gap-4"
            >
              <Input
                label="Nafn (valkvætt)"
                placeholder="Jón Jónsson"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
              <Input
                label="Kennitala"
                placeholder="0000000000"
                value={kennitala}
                onChange={(e) => setKennitala(e.target.value)}
                required
              />
              <Input
                label="Símanúmer"
                placeholder="8001234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {addMutation.isError && (
                <p className="text-sm text-(--color-error)">
                  {(addMutation.error as { message?: string })?.message ?? "Villa kom upp"}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={addMutation.isPending}>
                  Hætta við
                </Button>
                <Button type="submit" disabled={addMutation.isPending || !kennitala.trim() || !phone.trim()}>
                  {addMutation.isPending ? "Vista..." : "Vista"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
