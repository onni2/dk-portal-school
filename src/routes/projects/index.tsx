import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { projectsQueryOptions } from "@/features/projects/api/projects.queries";
import { ProjectFilters } from "@/features/projects/components/ProjectFilters";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageTemplate } from "@/shared/components/PageTemplate";

export const Route = createFileRoute("/projects/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <PageTemplate title="Projects" description="Browse graduation projects">
      <ProjectFilters />
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectList />
      </Suspense>
    </PageTemplate>
  );
}
