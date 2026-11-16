import type { SkillGroup } from "./types";

// TODO(Juano): adjust to your real stack.
export const skills: SkillGroup[] = [
  {
    title: "Frontend",
    subtitle: "Living interfaces",
    description: "I build responsive, accessible and animated interfaces.",
    items: ["React", "Next.js", "TypeScript", "Tailwind", "GSAP"],
  },
  {
    title: "Backend",
    subtitle: "Logic & APIs",
    description: "I design APIs and services following solid practices.",
    items: ["Node.js", "Java", "Python"],
  },
  {
    title: "Data",
    subtitle: "Databases",
    description: "I model and query relational and NoSQL data.",
    items: ["PostgreSQL", "MySQL", "MongoDB"],
  },
  {
    title: "Tooling",
    subtitle: "Workflow",
    description: "Version control, design and deployment.",
    items: ["Git", "GitHub", "Figma", "Vercel"],
  },
];
