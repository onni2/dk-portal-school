/**
 * React Query options and hooks for fetching all projects or a single project by ID.
 * Uses: ./projects.api
 * Exports: projectsQueryOptions, projectQueryOptions, useProjects, useProject
 * Author: Haukur — example/scaffold, use as template
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchProjectById, fetchProjects } from "./projects.api";

export const projectsQueryOptions = queryOptions({
  queryKey: ["projects"],
  queryFn: fetchProjects,
});

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: () => fetchProjectById(id),
  });

// Convenience hooks
/**
 *
 */
export function useProjects() {
  return useSuspenseQuery(projectsQueryOptions);
}

/**
 *
 */
export function useProject(id: string) {
  return useSuspenseQuery(projectQueryOptions(id));
}
