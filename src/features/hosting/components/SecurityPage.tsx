/**
 * Security and privacy information page — shows ISO certifications, transparency items, and GDPR summary.
 * Static content only; real policy documents and legal text are placeholders pending legal review.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Card, @/shared/components/Badge
 * Exports: SecurityPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const ISO_STANDARDS = [
  {
    code: "ISO 27001",
    title: "Stjórnun upplýsingaöryggis",
    description:
      "Rammastaðall sem skilgreinir kröfur til stjórnunarkerfis fyrir upplýsingaöryggi (ISMS). Hann nær yfir áhættumat, öryggisreglur og stöðugt umbótaferli.",
  },
  {
    code: "ISO 27017",
    title: "Öryggi í skýjaþjónustu",
    description:
      "Viðauki við ISO 27001 sem fjallar sérstaklega um skýjaþjónustur og skýrir skyldur skýjaveitanda og viðskiptavinar gagnvart öryggisráðstöfunum.",
  },
  {
    code: "ISO 27018",
    title: "Persónuvernd í skýjaþjónustu",
    description:
      "Viðauki sem tekur á vinnslu persónugreinanlegra upplýsinga (PII) í skýjaþjónustu og setur fram reglur um meðferð, gagnsæi og réttindi skráðra einstaklinga.",
  },
  {
    code: "ISO 9001",
    title: "Gæðastjórnun",
    description:
      "Alþjóðlegur staðall um gæðastjórnunarkerfi. Leggur áherslu á ferlamiðaða nálgun, ánægju viðskiptavina og stöðugar umbætur á þjónustu og ferlum.",
  },
] as const;

const TRANSPARENCY_ITEMS = [
  {
    title: "Meðhöndlun gagna",
    description: "Hvernig gögn viðskiptavinar eru geymd, unnin og vernduð.",
  },
  {
    title: "Ábyrgð á vinnslu",
    description: "Hvaða aðili ber ábyrgð á vinnslu og hvaða aðili er vinnsluaðili.",
  },
  {
    title: "Öryggisráðstafanir",
    description: "Tæknileg og skipulagsleg ráðstafanir sem eru til staðar til verndar gögnum.",
  },
  {
    title: "Meðhöndlun öryggisatvika",
    description: "Hvernig atvik eru greind, tilkynnt og úrrædd.",
  },
  {
    title: "Persónuverndarfyrirspurnir",
    description: "Hvernig beiðnir og fyrirspurnir um persónuvernd eru teknar til meðferðar.",
  },
] as const;

const GDPR_ITEMS = [
  {
    label: "Vinnsluaðili / Ábyrgðaraðili",
    // TODO: legal review — confirm exact roles and wording
    value: "Rekstraraðili ber ábyrgð á gögnum sinna viðskiptavina. DK gegnir hlutverki vinnsluaðila.",
  },
  {
    label: "Tilgangur vinnslu",
    // TODO: legal review — confirm scope of processing
    value: "Gögn eru eingöngu unnin í þeim tilgangi sem rekstraraðili hefur samþykkt og tilgreint í vinnslusamningi.",
  },
  {
    label: "Aðgangsstýringar",
    // TODO: legal review
    value: "Aðgangur að gögnum er takmarkaður við starfsmenn sem þarfnast hans í starfi sínu. Skráning og eftirlit er við lýði.",
  },
  {
    label: "Varðveisla gagna",
    // TODO: legal review — confirm retention policy
    value: "Gögn eru geymd í samræmi við lagakröfur og samningslegar skuldbindingar. Við lok samningstíma eru gögn eytt eða afhent að beiðni.",
  },
  {
    label: "Trúnaður",
    // TODO: legal review
    value: "Starfsmenn sem vinna með gögn viðskiptavina eru bundnir trúnaðarskyldu samkvæmt ráðningarsamningi og gæðakerfi.",
  },
  {
    label: "Réttindi viðskiptavina",
    // TODO: legal review — link to formal privacy notice when available
    value: "Viðskiptavinir geta óskað eftir upplýsingum um gögn sín, leiðréttingu eða eyðingu í samræmi við GDPR.",
  },
] as const;

/** Renders ISO standards, customer transparency, GDPR summary, and a contact section. All legal text is pending review. */
export function SecurityPage() {
  return (
    <PageTemplate
      title="Öryggi og persónuvernd"
      description="Upplýsingar um ISO, persónuvernd, vinnslu gagna og öryggisráðstafanir."
      info="Þessi síða sýnir öryggisstaðla og persónuverndarstefnu dk hugbúnaðar. dk er með ISO 27001 vottun og fylgir GDPR reglum um vinnslu persónuupplýsinga."
    >
      {/* Intro banner */}
      <div className="flex items-start gap-4 rounded-lg border border-(--color-border) bg-(--color-success-bg) p-5">
        <ShieldIcon className="mt-0.5 h-8 w-8 shrink-0 text-(--color-success)" />
        <div>
          <p className="font-semibold text-(--color-text)">
            Skipulögð öryggis- og persónuverndarferli
          </p>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Við starfum eftir skipulögðum öryggis- og persónuverndarferlum sem
            styðjast við ISO 27001, ISO 27017, ISO 27018 og ISO 9001. Þessi síða
            veitir viðskiptavinum og endurskoðendum yfirlit yfir þær
            öryggisráðstafanir og gagnsæisþætti sem eru til staðar.
          </p>
        </div>
      </div>

      {/* ISO standards */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-(--color-text)">ISO staðlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ISO_STANDARDS.map((std) => (
            <Card key={std.code} padding="md">
              <Badge variant="info" className="mb-2">{std.code}</Badge>
              <p className="font-medium text-(--color-text)">{std.title}</p>
              <p className="mt-1 text-sm text-(--color-text-secondary)">{std.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Customer transparency */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-(--color-text)">Gagnsæi gagnvart viðskiptavinum</h2>
        <Card padding="md">
          <p className="mb-4 text-sm text-(--color-text-secondary)">
            Við tryggjum að viðskiptavinir geti fengið skýrar upplýsingar um eftirfarandi þætti:
          </p>
          <ul className="divide-y divide-(--color-border-light)">
            {TRANSPARENCY_ITEMS.map((item) => (
              <li key={item.title} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-(--color-text)">{item.title}</p>
                <p className="mt-0.5 text-sm text-(--color-text-secondary)">{item.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* GDPR / privacy */}
      {/* TODO: legal review — all text in this section must be approved before production use */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-(--color-text)">GDPR og persónuvernd</h2>
        <Card padding="md">
          <p className="mb-4 text-sm text-(--color-text-secondary)">
            Eftirfarandi er yfirlit yfir meginþætti vinnslu persónuupplýsinga í samræmi við persónuverndarlöggjöf.
          </p>
          <dl className="divide-y divide-(--color-border-light)">
            {GDPR_ITEMS.map((item) => (
              <div key={item.label} className="py-3 first:pt-0 last:pb-0 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-(--color-text)">{item.label}</dt>
                <dd className="mt-1 text-sm text-(--color-text-secondary) sm:col-span-2 sm:mt-0">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      {/* Documents / policies placeholder */}
      {/* TODO: replace with real document links when admin CMS or doc store is available */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-(--color-text)">Skjöl og stefnur</h2>
        <Card padding="md">
          <p className="text-sm text-(--color-text-muted)">
            Skjöl og stefnur — s.s. öryggisstefna, persónuverndaryfirlýsing og
            vinnslusamningur — verða birt hér þegar þau liggja fyrir.
          </p>
        </Card>
      </section>

      {/* Contact */}
      {/* TODO: replace placeholder email with confirmed security/privacy contact address */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-(--color-text)">Spurningar og samband</h2>
        <Card padding="md">
          <p className="text-sm text-(--color-text-secondary)">
            Spurningar um öryggi, persónuvernd eða ISO-vottunarferli má senda á:{" "}
            <a
              href="mailto:oryggi@dk.is"
              className="text-(--color-primary) hover:underline"
            >
              oryggi@dk.is
            </a>
            . Við svörum eins fljótt og auðið er.
          </p>
        </Card>
      </section>
    </PageTemplate>
  );
}
