/**
 * Settings page — general settings for Mínar síður.
 * Uses: @/shared/components/PageTemplate
 * Exports: SettingsPage
 */
import { PageTemplate } from "@/shared/components/PageTemplate";

export function SettingsPage() {
  return (
    <PageTemplate
      title="Stillingar"
      description="Almennar stillingar fyrir Mínar síður."
    >
      <p className="text-[var(--color-text-secondary)]">Hér munu koma almennar stillingar.</p>
    </PageTemplate>
  );
}
