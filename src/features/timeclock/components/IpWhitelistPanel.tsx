/**
 * Panel for viewing and managing whitelisted IP addresses for timeclock kiosks.
 * Data is stored in Neon, scoped per company.
 * Uses: @/shared/components/Button, @/shared/components/Card, @/shared/components/Input,
 *       ../api/timeclock.queries, ../api/timeclock.api, ../store/timeclock.store
 * Exports: IpWhitelistPanel
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useIpWhitelist, useInvalidateIpWhitelist } from "../api/timeclock.queries";
import { addIpEntry, removeIpEntry } from "../api/timeclock.api";
import { useTimeclockStore } from "../store/timeclock.store";

export function IpWhitelistPanel() {
  const { data: entries } = useIpWhitelist();
  const invalidate = useInvalidateIpWhitelist();
  const { addIpOpen, setAddIpOpen } = useTimeclockStore();
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!ip.trim()) return;
    setSaving(true);
    try {
      await addIpEntry(ip.trim(), label.trim());
      await invalidate();
      setIp("");
      setLabel("");
      setAddIpOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeIpEntry(id);
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
                onClick={() => handleRemove(entry.id)}
                disabled={removingId === entry.id}
              >
                {removingId === entry.id ? "..." : "Fjarlægja"}
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
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={saving || !ip.trim()}>
              {saving ? "Vista..." : "Vista"}
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
