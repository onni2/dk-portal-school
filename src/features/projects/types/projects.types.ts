/**
 * TypeScript types for a graduation project, including its status values.
 * Uses: nothing — standalone file
 * Exports: ProjectStatus, Project
 * Author: Haukur — example/scaffold, use as template
 */
export type ProjectStatus = "planning" | "in-progress" | "completed";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  semester: string;
  members: string[];
  tags: string[];
}
