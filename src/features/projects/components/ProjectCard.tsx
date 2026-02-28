/**
 * Card component for a single project. Shows the title, status badge, description, tags, and member count; links to the project detail page.
 * Uses: @/shared/components/Badge, @/shared/components/Card, ../types/projects.types
 * Exports: ProjectCard
 * Author: Haukur — example/scaffold, use as template
 */
import { Link } from "@tanstack/react-router";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import type { Project } from "../types/projects.types";

const statusVariant = {
  planning: "warning",
  "in-progress": "info",
  completed: "success",
} as const;

/**
 *
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to="/projects/$projectId" params={{ projectId: project.id }}>
      <Card className="transition hover:shadow-[var(--shadow-md)]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            {project.title}
          </h3>
          <Badge variant={statusVariant[project.status]}>
            {project.status}
          </Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
          {project.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="default" className="rounded">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          {project.members.length} member{project.members.length !== 1 && "s"}{" "}
          &middot; {project.semester}
        </p>
      </Card>
    </Link>
  );
}
