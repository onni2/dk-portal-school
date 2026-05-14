/**
 * Two-step confirmation modal for adding a product to the subscription: confirm step and success step.
 * Uses: @/shared/components/Button, @/shared/utils/cn, ../types/products.types
 * Exports: AddProductModal
 */
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { cn } from "@/shared/utils/cn";
import type { SubscriptionProduct } from "../types/products.types";

type Step = "confirm" | "success";

interface Props {
  product: SubscriptionProduct;
  onClose: () => void;
  onGoToInstructions: () => void;
}

/** Modal that asks for confirmation before adding a product, then offers to navigate to its setup guide. */
export function AddProductModal({ product, onClose, onGoToInstructions }: Props) {
  const [step, setStep] = useState<Step>("confirm");

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30"
        onClick={step === "confirm" ? onClose : undefined}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-(--color-surface) shadow-xl">
        {step === "confirm" ? (
          <div className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-(--color-text)">
              Ertu alveg viss?
            </h2>
            <p className="text-sm text-(--color-text-secondary)">
              Á að bæta{" "}
              <span className="font-medium text-(--color-text)">
                {product.Description}
              </span>{" "}
              við leyfið?
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setStep("success")} className="flex-1">
                Já, bæta við
              </Button>
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Hætta við
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  "bg-green-100",
                )}
              >
                <svg
                  className="h-4 w-4 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-(--color-text)">
                  {product.Description} hefur verið bætt í leyfið
                </h2>
                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  Viltu sjá leiðbeiningar um uppsetningu og virkni fyrir vöruna?
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={onGoToInstructions} className="flex-1">
                Já, sjá leiðbeiningar
              </Button>
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Nei, takk
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
