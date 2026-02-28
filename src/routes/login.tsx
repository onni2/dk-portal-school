/**
 * Login page route (/login). Redirects to home if the user is already authenticated, otherwise renders the LoginForm.
 * Uses: @/features/auth/components/LoginForm, @/features/auth/store/auth.store
 * Exports: Route
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginForm,
});
