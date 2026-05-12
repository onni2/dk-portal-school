/**
 * Accountant view — list of assigned client companies with stats.
 * Only shows companies where user has accountant role.
 * Exports: AccountantCompanies
 */
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { switchCompany } from "@/features/company/api/company.api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSubmissions } from "../api/accountant.queries";

export function AccountantCompanies() {
  const companies = useAuthStore((s) => s.companies);
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const setActiveCompany = useAuthStore((s) => s.setActiveCompany);
  const queryClient = useQueryClient();
  const [switching, setSwitching] = useState<string | null>(null);
  const { data: submissions = [] } = useSubmissions();

  // Only show companies where user has accountant role
  const accountantCompanies = companies.filter((c) => c.role === "accountant" || c.role === "admin");

  async function handleSwitch(companyId: string) {
    setSwitching(companyId);
    try {
      const { token } = await switchCompany(companyId);
      setToken(token);
      setActiveCompany(companyId);
      queryClient.invalidateQueries();
    } catch (err) {
      console.error("Failed to switch company", err);
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[30px] font-bold text-[#0B0F1A]">Fyrirtækin mín</h1>
        <p className="text-[15px] text-[#5C667A]">
          Yfirlit yfir fyrirtæki sem þú starfar sem bókari fyrir
        </p>
      </div>

      {accountantCompanies.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white py-16">
          <p className="text-sm text-[var(--color-text-secondary)]">Engin fyrirtæki tengd við þinn aðgang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accountantCompanies.map((company) => {
            const isActive = company.id === user?.companyId;
            const companySubmissions = submissions.filter((s) => s.companyId === company.id);
            const overdue = companySubmissions.filter((s) => s.status === "gjaldfallið").length;
            const pending = companySubmissions.filter((s) => s.status === "í bið").length;
            const submitted = companySubmissions.filter((s) => s.status === "skilað").length;

            return (
              <div
                key={company.id}
                className={cn(
                  "rounded-xl border bg-white p-5 transition-shadow hover:shadow-md",
                  isActive ? "border-[#4743F7]" : "border-[var(--color-border)]",
                )}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#0B0F1A]">{company.name}</h3>
                    <span className="mt-1 inline-block rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-medium text-[#4743F7]">
                      Bókari
                    </span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-medium text-[#4743F7]">
                      Virkt
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#F6F8FC] p-2 text-center">
                    <p className="text-[18px] font-bold text-[#2E7D32]">{submitted}</p>
                    <p className="text-[10px] text-[#5C667A]">Skilað</p>
                  </div>
                  <div className="rounded-lg bg-[#F6F8FC] p-2 text-center">
                    <p className="text-[18px] font-bold text-[#F59E0B]">{pending}</p>
                    <p className="text-[10px] text-[#5C667A]">Í bið</p>
                  </div>
                  <div className="rounded-lg bg-[#F6F8FC] p-2 text-center">
                    <p className={cn("text-[18px] font-bold", overdue > 0 ? "text-red-600" : "text-[#5C667A]")}>{overdue}</p>
                    <p className="text-[10px] text-[#5C667A]">Gjaldfallið</p>
                  </div>
                </div>

                {/* Switch button */}
                <button
                  type="button"
                  disabled={isActive || switching === company.id}
                  onClick={() => handleSwitch(company.id)}
                  className={cn(
                    "w-full rounded-lg py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "cursor-default bg-[#EEF2FF] text-[#4743F7]"
                      : "bg-[#4743F7] text-white hover:bg-[#3835d4]",
                  )}
                >
                  {switching === company.id ? "Hleður..." : isActive ? "Virkt fyrirtæki" : "Skipta yfir"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}