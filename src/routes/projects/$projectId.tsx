/**
 * Project detail page route (/projects/:projectId). Prefetches the individual project and renders its detail view.
 * Uses: @/features/projects/api/projects.queries, @/features/projects/components/ProjectDetail, @/shared/components/LoadingSpinner
 * Exports: Route
 * Author: Haukur — example/scaffold, use as template
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { projectQueryOptions } from "@/features/projects/api/projects.queries";
import { ProjectDetail } from "@/features/projects/components/ProjectDetail";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(projectQueryOptions(projectId)),
  component: ProjectDetailPage,
});

/**
 *
 */
function ProjectDetailPage() {
  const { projectId } = Route.useParams();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectDetail projectId={projectId} />
    </Suspense>
  );
}
