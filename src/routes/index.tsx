import { createFileRoute } from "@tanstack/react-router";
import { PageTemplate } from "@/shared/components/PageTemplate";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PageTemplate title="Yfirlit" description="Velkomin í DK Portal">
      <p className="text-[var(--color-text-secondary)]">
        Veldu síðu úr valmyndinni til vinstri.
      </p>
    </PageTemplate>
  );
}
