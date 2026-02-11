import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import type { Project } from "../types/projects.types";

const statusStyles = {
  planning: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyles[project.status],
          )}
        >
          {project.status}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
        {project.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {project.members.length} member{project.members.length !== 1 && "s"}{" "}
        &middot; {project.semester}
      </p>
    </Link>
  );
}
