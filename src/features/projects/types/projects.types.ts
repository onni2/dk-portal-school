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
