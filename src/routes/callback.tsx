/**
 * OAuth2 callback route (/callback). Exchanges the authorization code from
 * Auðkenni for tokens, fetches user info, and redirects to the dashboard.
 * Uses: audkenni.api, auth.store, role.store, role-mapping
 * Exports: Route
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  handleAudkenniCallback,
  fetchAudkenniUserInfo,
} from "@/features/auth/api/audkenni.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRoleStore } from "@/features/licence/store/role.store";
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

  useEffect(() => {
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
        const user = {
          id: userInfo.sub,
          name: userInfo.name ?? "Notandi",
          email: userInfo.email ?? "",
          kennitala: userInfo.sub,
          role: "standard" as const,
        };
        setAuth(user, accessToken);
        setRole(authRoleToUserRole(user.role));
        navigate({ to: "/" });
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
