/**
 * Card panel for managing the IP whitelist that controls which devices can access the timeclock.
 * Uses: ../api/timeclock.queries, ../api/timeclock.api, ../store/timeclock.store, @/shared/components/*
 * Exports: IpWhitelistPanel
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useIpWhitelist } from "../api/timeclock.queries";
import { addIpEntry, removeIpEntry } from "../api/timeclock.api";
import { useTimeclockStore } from "../store/timeclock.store";

/** Lists whitelisted IP addresses and provides a form to add new entries or remove existing ones. */
export function IpWhitelistPanel() {
  const { data: entries } = useIpWhitelist();
  const qc = useQueryClient();
  const { addIpOpen, setAddIpOpen } = useTimeclockStore();
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");

  const addMutation = useMutation({
    mutationFn: ({ ip, label }: { ip: string; label: string }) => addIpEntry(ip, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeclock-ip-whitelist"] });
      setIp(""); // reset the form
      setLabel("");
      setAddIpOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeIpEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeclock-ip-whitelist"] }),
  });

  function handleClose() {
    setIp("");
    setLabel("");
    setAddIpOpen(false);
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-(--color-text)">IP-tölur í hvítlista</h2>
            <p className="mt-0.5 text-xs text-(--color-text-muted)">
              Aðeins tæki með þessar IP-tölur mega nota stimpilklukku.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={() => setAddIpOpen(true)}>
            + Bæta við
          </Button>
        </div>

        {entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-(--color-text-muted)">Engar IP-tölur skráðar.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">IP-tala</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Lýsing</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                    <td className="px-4 py-3 font-medium text-[#0B0F1A]">{entry.ip}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{entry.label || "—"}</td>
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

      {addIpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
          <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-(--color-text)">Bæta við IP-tölu</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (ip.trim()) addMutation.mutate({ ip: ip.trim(), label: label.trim() });
              }}
              className="flex flex-col gap-4"
            >
              <Input
                label="IP-tala"
                placeholder="192.168.1.10"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                required
              />
              <Input
                label="Lýsing (valkvætt)"
                placeholder="T.d. Skrifstofan"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
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
                <Button type="submit" disabled={addMutation.isPending || !ip.trim()}>
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
