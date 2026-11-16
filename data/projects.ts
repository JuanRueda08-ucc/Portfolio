import type { Project } from "./types";

// TODO(Juano): replace with your real projects (GitHub + Vercel links).
export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    description: "Short description: what problem it solves and how.",
    year: 2026,
    tags: ["Next.js", "TypeScript", "Tailwind"],
    github: "https://github.com/",
    demo: "https://vercel.com/",
    featured: true,
  },
  {
    slug: "project-two",
    title: "Project Two",
    description: "Short description: what problem it solves and how.",
    year: 2025,
    tags: ["React", "Node.js"],
    github: "https://github.com/",
    demo: "https://vercel.com/",
    featured: true,
  },
  {
    slug: "project-three",
    title: "Project Three",
    description: "Short description: what problem it solves and how.",
    year: 2025,
    tags: ["Java", "Spring Boot"],
    github: "https://github.com/",
    demo: "https://vercel.com/",
  },
];
