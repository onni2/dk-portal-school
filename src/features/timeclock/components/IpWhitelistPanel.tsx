/**
 * Panel for viewing and managing whitelisted IP addresses for timeclock kiosks.
 * Add/remove is mock-only until the backend supports it.
 * Uses: @/shared/components/Button, @/shared/components/Card, @/shared/components/Input,
 *       ../api/timeclock.queries, ../store/timeclock.store
 * Exports: IpWhitelistPanel
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useIpWhitelist } from "../api/timeclock.queries";
import { useTimeclockStore } from "../store/timeclock.store";
import type { IpWhitelistEntry } from "../types/timeclock.types";

export function IpWhitelistPanel() {
  const { data: initial } = useIpWhitelist();
  const { addIpOpen, setAddIpOpen } = useTimeclockStore();

  const [entries, setEntries] = useState<IpWhitelistEntry[]>(initial);
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");

  function handleAdd() {
    if (!ip.trim()) return;
    setEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), ip: ip.trim(), label: label.trim() },
    ]);
    setIp("");
    setLabel("");
    setAddIpOpen(false);
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
              IP-tölur í hvítlista
            </h2>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
              Mock
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Aðeins tæki með þessar IP-tölur mega nota stimpilklukku.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setAddIpOpen(true)}>
          + Bæta við
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
          Engar IP-tölur skráðar.
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
                  {entry.ip}
                </p>
                {entry.label && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {entry.label}
                  </p>
                )}
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

      {addIpOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
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
            <Button variant="primary" size="sm" onClick={handleAdd}>
              Vista
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddIpOpen(false)}
            >
              Hætta við
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
