/**
 * Modal for creating a new hosted environment user (mock).
 * Shows the generated temp password after creation.
 * Uses: ../api/hosting.api, @/shared/components/Button, @/shared/components/Input
 * Exports: CreateHostingUserModal
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { createHostingAccount } from "../api/hosting.api";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateHostingUserModal({ onClose, onCreated }: Props) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createHostingAccount({ username, displayName, email: email || undefined });
      setTempPassword(result.tempPassword);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Villa kom upp");
    } finally {
      setLoading(false);
    }
  }

  if (tempPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-bold text-(--color-text)">Notandi búinn til</h2>
          <p className="mb-1 text-sm text-(--color-text-secondary)">
            Tímabundið lykilorð:
          </p>
          <div className="mb-4 rounded-md bg-(--color-surface-hover) px-4 py-3 font-mono text-base text-(--color-text)">
            {tempPassword}
          </div>
          <p className="mb-4 text-xs text-(--color-text-secondary)">
            Láttu notandann vita af þessu lykilorði. Það er aðeins sýnt einu sinni.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => { onCreated(); onClose(); }}>Loka</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">Nýr hýsingarnotandi</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Notendanafn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="fyr.nafn"
            required
          />
          <Input
            label="Nafn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jón Jónsson"
            required
          />
          <Input
            label="Netfang (valfrjálst)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jon@fyrirtaeki.is"
          />

          {error && <p className="text-sm text-(--color-error)">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Hætta við
            </Button>
            <Button type="submit" disabled={loading || !username || !displayName}>
              {loading ? "Bý til..." : "Búa til notanda"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
