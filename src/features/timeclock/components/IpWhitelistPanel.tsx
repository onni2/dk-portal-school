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

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-(--color-text)">
            IP-tölur í hvítlista
          </h2>
          <p className="mt-0.5 text-xs text-(--color-text-muted)">
            Aðeins tæki með þessar IP-tölur mega nota stimpilklukku.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setAddIpOpen(true)}>
          + Bæta við
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--color-text-muted)">
          Engar IP-tölur skráðar.
        </p>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-(--color-text)">{entry.ip}</p>
                {entry.label && (
                  <p className="text-xs text-(--color-text-muted)">{entry.label}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeMutation.mutate(entry.id)}
                disabled={removeMutation.isPending && removeMutation.variables === entry.id} // only disable the one being deleted
              >
                {removeMutation.isPending && removeMutation.variables === entry.id ? "..." : "Fjarlægja"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {addIpOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-(--color-border) pt-4">
          <Input
            placeholder="IP-tala, t.d. 192.168.1.10"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <Input
            placeholder="Lýsing (valkvætt)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => { if (ip.trim()) addMutation.mutate({ ip: ip.trim(), label: label.trim() }); }}
              disabled={addMutation.isPending || !ip.trim()}
            >
              {addMutation.isPending ? "Vista..." : "Vista"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAddIpOpen(false)}>
              Hætta við
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
