import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Card } from "@/shared/components/Card";
import { login } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useRoleStore } from "@/features/licence/store/role.store";
import { authRoleToUserRole } from "../utils/role-mapping";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useRoleStore((s) => s.setRole);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, token } = await login({ email, password });
      setAuth(user, token);
      setRole(authRoleToUserRole(user.role));
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Innskráning mistókst");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            dk
          </span>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Skráðu þig inn á Mínar síður
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Netfang"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="netfang@dk.is"
            required
          />

          <Input
            label="Lykilorð"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Skrái inn..." : "Innskrá"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
