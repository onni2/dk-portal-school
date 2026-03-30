import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { updateUser } from "../api/users.api";
import type { PortalUser } from "../types/users.types";

interface Props {
  user: Pick<PortalUser, "id" | "name" | "kennitala" | "phone">;
  onClose: () => void;
  onSaved: (kennitala: string | undefined, phone: string | undefined) => void;
}

export function EditUserModal({ user, onClose, onSaved }: Props) {
  const [kennitala, setKennitala] = useState(user.kennitala ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateUser(user.id, {
        kennitala: kennitala || undefined,
        phone: phone || undefined,
      });
      onSaved(kennitala || undefined, phone || undefined);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Villa kom upp");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-(--color-text)">
          Breyta notanda — {user.name}
        </h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          Stilltu kennitölu og símanúmer fyrir þennan notanda.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Input
            label="Kennitala"
            type="text"
            value={kennitala}
            onChange={(e) => setKennitala(e.target.value)}
            placeholder="0000000000"
          />
          <Input
            label="Símanúmer"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5551234"
          />
          {error && <p className="text-sm text-(--color-error)">{error}</p>}

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
              Hætta við
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Vista..." : "Vista"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
