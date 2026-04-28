/**
 * Security & privacy page for hosting.
 * Uses: @/shared/components/PageTemplate
 * Exports: SecurityPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

const standards = [
  {
    code: "ISO 27001",
    title: "Upplýsingaöryggisstjórnun",
    description:
      "DK Hugbúnaður ehf. uppfyllir kröfur ISO 27001 um stjórnun upplýsingaöryggis. Við höfum komið á fót formlegri öryggisstefnu, áhættumat og ferli til að tryggja trúnað, heilleika og aðgengi að gögnum.",
  },
  {
    code: "ISO 27017",
    title: "Öryggi í skýjaþjónustu",
    description:
      "Við fylgjum leiðbeiningum ISO 27017 um öryggi í skýjaþjónustu. Þetta felur í sér skýrar reglur um aðgangsstýringu, skráningu atburða og vernd gagna sem geymd eru í skýjaumhverfi.",
  },
  {
    code: "ISO 27018",
    title: "Vernd persónuupplýsinga í skýi",
    description:
      "ISO 27018 fjallar um vernd persónugreinanlegra upplýsinga í skýjaþjónustu. DK Hugbúnaður ehf. tryggir að persónuupplýsingar séu aðeins notaðar í þágu viðkomandi fyrirtækis og að þær séu varðveittar á öruggan hátt.",
  },
];

export function SecurityPage() {
  return (
    <PageTemplate
      title="Öryggi og persónuvernd"
      description="Hér finnur þú yfirlit yfir hvernig DK Hugbúnaður ehf. uppfyllir kröfur ISO 27001, 27017 og 27018, með áherslu á gagnsæi, ábyrgð og örugga meðferð persónuupplýsinga."
    >
      <div className="flex flex-col gap-4">
        {standards.map((s) => (
          <div
            key={s.code}
            className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-md bg-(--color-surface-hover) px-2.5 py-1 font-mono text-xs font-semibold text-(--color-text-secondary)">
                {s.code}
              </span>
              <h3 className="font-semibold text-(--color-text)">{s.title}</h3>
            </div>
            <p className="text-sm text-(--color-text-secondary)">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </PageTemplate>
  );
}
