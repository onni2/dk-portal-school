/**
 * OAuth2 callback route (/callback). Exchanges the authorization code from
 * Auðkenni for tokens, fetches user info, and redirects to the dashboard.
 * Uses: audkenni.api, auth.store, role.store, role-mapping
 * Exports: Route
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  handleAudkenniCallback,
  fetchAudkenniUserInfo,
} from "@/features/auth/api/audkenni.api";
import { fetchEmployees } from "@/features/employees/api/employees.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRoleStore } from "@/features/licence/store/role.store";
import { usePortalUsersStore } from "@/features/users/store/users.store";
import { authRoleToUserRole } from "@/features/auth/utils/role-mapping";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useRoleStore((s) => s.setRole);
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");

    if (errorParam) {
      setError(errorDescription ?? errorParam);
      return;
    }

    if (!code || !state) {
      setError("Ógild svörun frá Auðkenni — vantar code eða state");
      return;
    }

    handleAudkenniCallback(code, state)
      .then(async ({ accessToken }) => {
        const userInfo = await fetchAudkenniUserInfo(accessToken);

        const kennitala = userInfo.nationalRegisterId;

        // Match to a portal user by kennitala — this determines their role
        const portalUsers = usePortalUsersStore.getState().users;
        const portalUser = kennitala
          ? portalUsers.find((u) => u.kennitala === kennitala)
          : undefined;

        if (!portalUser) {
          setError("Notandi ekki skráður í gáttina — hafðu samband við stjórnanda");
          return;
        }

        // Also fetch DK Plus employee info for name/email if available
        const employees = await fetchEmployees().catch(() => []);
        const employee = kennitala
          ? employees.find((e) => e.SSNumber === kennitala)
          : undefined;

        const user = {
          id: portalUser.id,
          name: employee?.Name ?? portalUser.name,
          email: employee?.Email ?? portalUser.email,
          kennitala,
          role: portalUser.role,
          mustResetPassword: portalUser.mustResetPassword,
        };

        const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;
        setAuth(user, apiToken ?? accessToken);
        setRole(authRoleToUserRole(user.role));
        navigate({ to: portalUser.mustResetPassword ? "/reset-password" : "/" });
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Auðkenning mistókst — reyndu aftur",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
        <p className="text-[var(--color-error)]">{error}</p>
        <a
          href="/login"
          className="text-sm text-[var(--color-primary)] underline"
        >
          Til baka í innskráningu
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Auðkenning í gangi…
        </p>
      </div>
    </div>
  );
}
