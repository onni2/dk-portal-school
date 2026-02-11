import { Link, useRouter } from "@tanstack/react-router";

export function RouteError({ error }: { error: unknown }) {
  const router = useRouter();
  const message =
    error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8">
        <h1 className="text-lg font-semibold text-red-800">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-red-600">{message}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.invalidate()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
