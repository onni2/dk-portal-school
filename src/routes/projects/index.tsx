import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { projectsQueryOptions } from "@/features/projects/api/projects.queries";
import { ProjectFilters } from "@/features/projects/components/ProjectFilters";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/projects/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <ProjectFilters />
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
