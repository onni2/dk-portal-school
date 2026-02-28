/**
 * Static list of sample graduation projects used by the projects API while no real backend is connected.
 * Uses: @/features/projects/types/projects.types
 * Exports: MOCK_PROJECTS
 * Author: Haukur — example/scaffold, use as template
 */
import type { Project } from "@/features/projects/types/projects.types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Online Bookstore",
    description:
      "A full-stack e-commerce platform for buying and selling books, featuring user authentication, shopping cart, and payment integration.",
    status: "in-progress",
    semester: "Spring 2025",
    members: ["Alice", "Bob", "Charlie"],
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "2",
    title: "Campus Event Planner",
    description:
      "Mobile-first web application for organizing and discovering campus events, with calendar sync and notifications.",
    status: "completed",
    semester: "Fall 2024",
    members: ["Diana", "Eve"],
    tags: ["React", "Firebase", "Tailwind"],
  },
  {
    id: "3",
    title: "AI Study Assistant",
    description:
      "An intelligent study assistant that generates practice quizzes from uploaded notes using natural language processing.",
    status: "in-progress",
    semester: "Spring 2025",
    members: ["Frank", "Grace", "Heidi"],
    tags: ["Python", "React", "OpenAI"],
  },
  {
    id: "4",
    title: "Fitness Tracker Dashboard",
    description:
      "A health and fitness tracking dashboard that integrates with wearable devices and provides visual analytics.",
    status: "planning",
    semester: "Spring 2025",
    members: ["Ivan", "Judy"],
    tags: ["React", "D3.js", "Express"],
  },
  {
    id: "5",
    title: "Recipe Sharing Platform",
    description:
      "Community-driven recipe sharing platform with image upload, rating system, and dietary filter support.",
    status: "completed",
    semester: "Fall 2024",
    members: ["Karl", "Lena", "Mallory"],
    tags: ["Next.js", "Prisma", "S3"],
  },
  {
    id: "6",
    title: "Budget Tracker",
    description:
      "Personal finance management tool with expense categorization, monthly budgets, and spending insights.",
    status: "planning",
    semester: "Spring 2025",
    members: ["Niaj", "Olivia"],
    tags: ["React", "Supabase", "Chart.js"],
  },
];
