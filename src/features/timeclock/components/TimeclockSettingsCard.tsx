/**
 * Read-only card showing the current timeclock settings fetched from the API.
 * Uses: @/shared/components/Card, ../api/timeclock.queries
 * Exports: TimeclockSettingsCard
 */
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { useTimeclockSettings } from "../api/timeclock.queries";

const ROUND_FACTOR_LABELS: Record<number, string> = {
  1: "Ekkert sléttun",
  2: "5 mínútur",
  3: "10 mínútur",
  4: "15 mínútur",
  5: "30 mínútur",
};

const FIELD_LABELS: Record<number, string> = {
  0: "Óvirkt",
  1: "Valkvætt",
  2: "Skyldulegt",
};

export function TimeclockSettingsCard() {
  const { data: settings } = useTimeclockSettings();

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-(--color-text)">
            Stillingar
          </h2>
          <div className="group relative">
            <span className="flex h-4 w-4 cursor-default items-center justify-center rounded-full border border-(--color-text-muted) text-[10px] font-bold leading-none text-(--color-text-muted)">
              i
            </span>
            <div className="pointer-events-none absolute left-1/2 top-6 z-10 w-64 -translate-x-1/2 rounded-[var(--radius-md)] border border-(--color-border) bg-(--color-surface) p-3 text-xs text-(--color-text-secondary) opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <p className="mb-1 font-semibold text-(--color-text)">
                Um stillingar
              </p>
              <p>
                Þessar stillingar eru sóttar beint úr DK og sýna hvernig
                stimpilklukkukerfið er uppsett. Hér má sjá hvort kerfið sé
                virkt, hvernig tímar eru slétttaðir og hvaða reiti starfsmenn
                þurfa að fylla út þegar þeir stimpla sig inn.
              </p>
              <p className="mt-1.5 text-(--color-text-muted)">
                Ekki er hægt að breyta þessum stillingum hér — þær eru stilltar
                í DK.
              </p>
            </div>
          </div>
        </div>
        <Badge variant={settings.Enabled ? "success" : "default"}>
          {settings.Enabled ? "Virkt" : "Óvirkt"}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-(--color-text-muted)">Sléttun</p>
          <p className="text-sm font-medium text-(--color-text)">
            {ROUND_FACTOR_LABELS[settings.RoundFactor] ?? settings.RoundFactor}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">
            Slétta dagvinnuinnslætti
          </p>
          <p className="text-sm font-medium text-(--color-text)">
            {settings.RoundUpDaytimeAlso ? "Já" : "Nei"}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Texti</p>
          <p className="text-sm font-medium text-(--color-text)">
            {FIELD_LABELS[settings.Text] ?? settings.Text}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Verk</p>
          <p className="text-sm font-medium text-(--color-text)">
            {FIELD_LABELS[settings.Project] ?? settings.Project}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Verkefni</p>
          <p className="text-sm font-medium text-(--color-text)">
            {FIELD_LABELS[settings.Phase] ?? settings.Phase}
          </p>
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">Verkliður</p>
          <p className="text-sm font-medium text-(--color-text)">
            {FIELD_LABELS[settings.Task] ?? settings.Task}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-(--color-text-muted)">
        Stillingar eru lesnar úr DK og er ekki hægt að breyta þeim hér.
      </p>
    </Card>
  );
}
