import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to DK Portal</h1>
      <p className="text-gray-600">
        Browse graduation projects and track progress across semesters.
      </p>
      <Link
        to="/projects"
        className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        View Projects
      </Link>
    </div>
  );
}
