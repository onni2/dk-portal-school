import { delay } from "@/mocks/handlers";
import { MOCK_PROJECTS } from "@/mocks/projects.mock";
import type { Project } from "../types/projects.types";

// -- Mock implementations --
// Replace the body of each function with apiClient calls when the backend is ready.
// e.g. return apiClient.get<Project[]>("/projects");

export async function fetchProjects(): Promise<Project[]> {
  await delay(400);
  return MOCK_PROJECTS;
}

export async function fetchProjectById(id: string): Promise<Project> {
  await delay(300);
  const project = MOCK_PROJECTS.find((p) => p.id === id);
  if (!project) throw new Error(`Project ${id} not found`);
  return project;
}
