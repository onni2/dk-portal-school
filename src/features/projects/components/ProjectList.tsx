/**
 * Renders the filtered list of project cards. Applies search text and status filters from the projects store.
 * Uses: ../api/projects.queries, ../store/projects.store, ./ProjectCard
 * Exports: ProjectList
 * Author: Haukur — example/scaffold, use as template
 */
import { useProjects } from "../api/projects.queries";
import { useProjectFilters } from "../store/projects.store";
import { ProjectCard } from "./ProjectCard";

/**
 *
 */
export function ProjectList() {
  const { data: projects } = useProjects();
  const { search, status } = useProjectFilters();

  const filtered = projects.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No projects match your filters.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
