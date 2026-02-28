/**
 * Login form. Takes a DK API token, verifies it against the API, stores the user, and navigates home.
 * Uses: @/shared/components/Button, @/shared/components/Input, @/shared/components/Card, ../api/auth.api, ../store/auth.store, @/features/licence/store/role.store, ../utils/role-mapping
 * Exports: LoginForm
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Card } from "@/shared/components/Card";
import { login } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useRoleStore } from "@/features/licence/store/role.store";
import { authRoleToUserRole } from "../utils/role-mapping";

/**
 * Login form component — renders a token input and handles the full login flow.
 */
export function LoginForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useRoleStore((s) => s.setRole);

  /**
   * Submits the token to the API, stores the result, and redirects to the dashboard.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, token: authToken } = await login({ token });
      setAuth(user, authToken);
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
            label="API tókn"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            required
          />

          <p className="text-xs text-[var(--color-text-muted)]">
            Tóknið er fáanlegt í DK Plus stillingunum þínum.
          </p>

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
