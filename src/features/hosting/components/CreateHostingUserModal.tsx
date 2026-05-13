/**
 * Modal for creating a new hosting account.
 *
 * Creates a hosting account in the backend and shows the generated temporary
 * password once after creation.
 *
 * Hosting account fields:
 * - username
 * - displayName
 *
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { createHostingAccount } from "../api/hosting.api";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

/** Modal that collects username and display name, calls the API, and shows the generated temporary password once on success. */
export function CreateHostingUserModal({ onClose, onCreated }: Props) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await createHostingAccount({
        username: username.trim(),
        displayName: displayName.trim(),
      });

      setTempPassword(result.tempPassword);
      onCreated();
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Villa kom upp");
    } finally {
      setLoading(false);
    }
  }

  if (tempPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-bold text-(--color-text)">
            Hýsingaraðgangur búinn til
          </h2>

          <p className="mb-1 text-sm text-(--color-text-secondary)">
            Tímabundið lykilorð:
          </p>

          <div className="mb-4 rounded-md bg-(--color-surface-hover) px-4 py-3 font-mono text-base text-(--color-text)">
            {tempPassword}
          </div>

          <p className="mb-4 text-xs text-(--color-text-secondary)">
            Láttu notandann vita af þessu lykilorði. Það er aðeins sýnt einu
            sinni.
          </p>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                onClose();
              }}
            >
              Loka
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">
          Nýr hýsingaraðgangur
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Notendanafn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="fyr.nafn"
            required
          />

          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jón Jónsson"
            required
          />

          {error && (
            <p className="text-sm text-(--color-error)">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Hætta við
            </Button>

            <Button
              type="submit"
              disabled={loading || !username.trim() || !displayName.trim()}
            >
              {loading ? "Bý til..." : "Búa til aðgang"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}