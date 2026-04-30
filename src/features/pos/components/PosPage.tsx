import { Suspense, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { usePosServices, usePosRestServices } from "../api/pos.queries";
import { PosServiceCard } from "./PosServiceCard";
import { PosLogPanel } from "./PosLogPanel";
import type { PosServiceType } from "../types/pos.types";

type Tab = PosServiceType;

function ServicesGrid({ serviceType }: { serviceType: Tab }) {
  const { data: dkServices } = usePosServices();
  const { data: restServices } = usePosRestServices();
  const services = serviceType === "dkpos" ? dkServices : restServices;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveId = selectedId ?? services[0]?.id ?? null;
  const selectedService = services.find((s) => s.id === effectiveId) ?? null;

  if (services.length === 0) {
    return (
      <p className="text-sm text-(--color-text-secondary)">
        Engar þjónustur skráðar fyrir þetta fyrirtæki.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-5 items-start gap-6">
      <div className="col-span-2 flex flex-col gap-4">
        {services.map((service) => (
          <PosServiceCard
            key={service.id}
            service={service}
            serviceType={serviceType}
            isSelected={service.id === effectiveId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
      <div className="col-span-3">
        {selectedService && (
          <PosLogPanel
            serviceId={effectiveId!}
            serviceType={serviceType}
            serviceDisplay={selectedService.display}
          />
        )}
      </div>
    </div>
  );
}

export function PosPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dkpos");

  return (
    <PageTemplate title="dkPOS" description="dkPOS þjónustur">
      <div className="flex gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) p-1 w-fit mb-6">
        {(["dkpos", "rest"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-(--color-primary) text-white shadow-sm"
                : "text-(--color-text-secondary) hover:text-(--color-text)",
            )}
          >
            {tab === "dkpos" ? "dkPOS þjónustur" : "REST POS þjónustur"}
          </button>
        ))}
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ServicesGrid key={activeTab} serviceType={activeTab} />
      </Suspense>
    </PageTemplate>
  );
}
