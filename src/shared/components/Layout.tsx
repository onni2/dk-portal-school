import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto max-w-5xl flex items-center gap-6 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-blue-600">
            DK Portal
          </Link>
          <Link
            to="/projects"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 [&.active]:text-blue-600"
          >
            Projects
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        DK Portal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
