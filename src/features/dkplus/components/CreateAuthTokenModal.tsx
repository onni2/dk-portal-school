import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCreateAuthToken } from "../api/dkplus.queries";

interface Props {
  onClose: () => void;
}

export function CreateAuthTokenModal({ onClose }: Props) {
  const { user, companies } = useAuthStore();
  const createMutation = useCreateAuthToken();
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState(user?.companyId ?? companies[0]?.id ?? "");
  const [error, setError] = useState("");
  const [createdToken, setCreatedToken] = useState("");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setError("");
    try {
      const result = await createMutation.mutateAsync({
        description: description.trim(),
        companyId,
      });
      setCreatedToken(result.token);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Villa kom upp");
    }
  }

  if (createdToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-bold text-(--color-text)">Tákn stofnað</h2>

          <p className="mb-1 text-sm text-(--color-text-secondary)">Auðkenningartákn:</p>

          <div className="mb-4 break-all rounded-md bg-(--color-surface-hover) px-4 py-3 font-mono text-base text-(--color-text)">
            {createdToken}
          </div>


          <div className="flex justify-end">
            <Button onClick={onClose}>Loka</Button>
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
        <h2 className="mb-4 text-lg font-bold text-(--color-text)">Stofna auðkenningartákn</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Lýsing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="t.d. Bókhaldskerfi, DK One tenging"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-(--color-text)">Fyrirtæki</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-primary/20"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-(--color-error)">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Hætta við
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending || !description.trim()}
            >
              {createMutation.isPending ? "Stofna..." : "Stofna tákn"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
