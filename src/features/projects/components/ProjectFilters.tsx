/**
 * Search and status filter controls for the project list. Reads and writes filter state via the projects store.
 * Uses: @/shared/components/Button, @/shared/components/Input, ../types/projects.types, ../store/projects.store
 * Exports: ProjectFilters
 * Author: Haukur — example/scaffold, use as template
 */
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import type { ProjectStatus } from "../types/projects.types";
import { useProjectFilters } from "../store/projects.store";

const statuses: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

/**
 *
 */
export function ProjectFilters() {
  const { search, status, setSearch, setStatus } = useProjectFilters();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-1.5">
        {statuses.map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={status === s.value ? "primary" : "ghost"}
            onClick={() => setStatus(s.value)}
            className="rounded-full"
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
