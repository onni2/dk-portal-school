/**
 * Accountant view — submission status per client company and period.
 * Mock data for now — wire to real API when available.
 * Uses: @/shared/utils/cn, @/features/auth/store/auth.store
 * Exports: BokariSubmissions
 */
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/auth.store";

type SubmissionStatus = "skilað" | "í bið" | "gjaldfallið";

interface Submission {
  companyId: string;
  companyName: string;
  period: string;
  type: string;
  status: SubmissionStatus;
  dueDate: string;
}

const STATUS_STYLES: Record<SubmissionStatus, { label: string; bg: string; text: string }> = {
  "skilað":      { label: "Skilað",      bg: "bg-green-50",  text: "text-green-700"  },
  "í bið":       { label: "Í bið",       bg: "bg-yellow-50", text: "text-yellow-700" },
  "gjaldfallið": { label: "Gjaldfallið", bg: "bg-red-50",    text: "text-red-700"    },
};

// Mock submissions — replace with API call later
const MOCK_SUBMISSIONS: Submission[] = [
  { companyId: "hr",       companyName: "HR",          period: "Mars 2026",     type: "VSK",          status: "skilað",      dueDate: "2026-04-05" },
  { companyId: "hr",       companyName: "HR",          period: "Mars 2026",     type: "Launaskýrsla", status: "í bið",       dueDate: "2026-04-10" },
  { companyId: "1001nott", companyName: "1001 Nott",   period: "Mars 2026",     type: "VSK",          status: "gjaldfallið", dueDate: "2026-04-05" },
  { companyId: "1001nott", companyName: "1001 Nott",   period: "Mars 2026",     type: "Launaskýrsla", status: "í bið",       dueDate: "2026-04-10" },
  { companyId: "hr",       companyName: "HR",          period: "Febrúar 2026",  type: "VSK",          status: "skilað",      dueDate: "2026-03-05" },
  { companyId: "hr",       companyName: "HR",          period: "Febrúar 2026",  type: "Launaskýrsla", status: "skilað",      dueDate: "2026-03-10" },
  { companyId: "1001nott", companyName: "1001 Nott",   period: "Febrúar 2026",  type: "VSK",          status: "skilað",      dueDate: "2026-03-05" },
  { companyId: "1001nott", companyName: "1001 Nott",   period: "Febrúar 2026",  type: "Launaskýrsla", status: "skilað",      dueDate: "2026-03-10" },
];

/**
 *
 */
export function AccountantSubmissions() {
  const companies = useAuthStore((s) => s.companies);
  const companyIds = companies.map((c) => c.id);

  // Only show submissions for companies the accountant is assigned to
  const submissions = MOCK_SUBMISSIONS.filter((s) => companyIds.includes(s.companyId));

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Skilastaða</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Yfirlit yfir skilastöðu skýrslna fyrir hvert fyrirtæki og tímabil
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Fyrirtæki</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Tímabil</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Tegund</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Skiladagur</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Staða</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Engar skýrslur fundust
                </td>
              </tr>
            ) : (
              submissions.map((s, i) => {
                const status = STATUS_STYLES[s.status];
                return (
                  <tr
                    key={i}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{s.companyName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{s.period}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{s.type}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(s.dueDate).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", status.bg, status.text)}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}