import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import { useProject } from "../api/projects.queries";

const statusStyles = {
  planning: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
} as const;

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to projects
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusStyles[project.status],
            )}
          >
            {project.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{project.semester}</p>
      </div>

      <p className="text-gray-700">{project.description}</p>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Team</h2>
        <ul className="mt-1 flex flex-wrap gap-2">
          {project.members.map((member) => (
            <li
              key={member}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {member}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Technologies</h2>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
