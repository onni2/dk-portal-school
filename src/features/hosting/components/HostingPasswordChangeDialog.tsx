/**
 * Modal dialog for changing the password of the logged-in user's hosting account.
 * Enforces the password policy rules (length, upper/lower case, digit, special char) before enabling the save button.
 * Uses: @/shared/utils/cn, ../api/hosting.api, ../api/hosting.queries
 * Exports: HostingPasswordChangeDialog
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { changeMyHostingPassword } from "../api/hosting.api";
import { hostingQueryKeys } from "../api/hosting.queries";

interface HostingPasswordChangeDialogProps {
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PASSWORD_RULES = [
  { label: "Að minnsta kosti 12 stafir", test: (pw: string) => pw.length >= 12 },
  { label: "Stór stafur (A-Z)", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Lítill stafur (a-z)", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Tölustafur (0-9)", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "Sértákn (!@#$%^&*)", test: (pw: string) => /[!@#$%^&*]/.test(pw) },
] as const;

/** Password-change modal with live rule validation. Save is blocked until all rules pass and both fields match. */
export function HostingPasswordChangeDialog({
  username,
  onClose,
  onSuccess,
}: HostingPasswordChangeDialogProps) {
  const qc = useQueryClient();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const passwordMutation = useMutation({
    mutationFn: changeMyHostingPassword,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: hostingQueryKeys.me });
      onSuccess();
      onClose();
    },
  });

  const passwordRulesPassed = PASSWORD_RULES.every((rule) =>
    rule.test(password),
  );

  const passwordsMatch =
    password.length > 0 &&
    passwordConfirm.length > 0 &&
    password === passwordConfirm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-(--color-text)">
          Breyta lykilorði
        </h2>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Sláðu inn nýtt lykilorð fyrir hýsingaraðganginn{" "}
          <span className="font-mono font-medium text-(--color-text)">
            {username}
          </span>
          .
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
              Nýtt lykilorð
            </label>

            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>

          <ul className="space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(password);

              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    passed
                      ? "text-(--color-success)"
                      : password.length > 0
                        ? "text-(--color-error)"
                        : "text-(--color-text-muted)",
                  )}
                >
                  <span>{passed ? "✓" : "○"}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>

          <div>
            <label className="mb-1 block text-xs font-medium text-(--color-text-secondary)">
              Staðfesta lykilorð
            </label>

            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>

          {passwordConfirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-(--color-error)">
              Lykilorðin stemma ekki.
            </p>
          )}

          {passwordMutation.isError && (
            <p className="text-xs text-(--color-error)">
              {(passwordMutation.error as { message?: string })?.message ??
                "Tókst ekki að breyta lykilorði."}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-hover)"
          >
            Hætta við
          </button>

          <button
            onClick={() => passwordMutation.mutate(password)}
            disabled={
              !passwordRulesPassed ||
              !passwordsMatch ||
              passwordMutation.isPending
            }
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-50"
          >
            {passwordMutation.isPending ? "Vista..." : "Vista lykilorð"}
          </button>
        </div>
      </div>
    </div>
  );
}