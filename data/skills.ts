import type { SkillGroup } from "./types";

// TODO(Juano): adjust to your real stack.
export const skills: SkillGroup[] = [
  {
    title: "Frontend",
    subtitle: "Living interfaces",
    description: "I build responsive, accessible and animated interfaces.",
    items: ["React", "Next.js", "TypeScript", "Tailwind", "GSAP"],
    es: { title: "Frontend", subtitle: "Interfaces vivas", description: "Construyo interfaces responsivas, accesibles y animadas." },
  },
  {
    title: "Backend",
    subtitle: "Logic & APIs",
    description: "I design APIs and services following solid practices.",
    items: ["Node.js", "Java", "Python"],
    es: { title: "Backend", subtitle: "Lógica y APIs", description: "Diseño APIs y servicios con buenas prácticas." },
  },
  {
    title: "Data",
    subtitle: "Databases",
    description: "I model and query relational and NoSQL data.",
    items: ["PostgreSQL", "MySQL", "MongoDB"],
    es: { title: "Datos", subtitle: "Bases de datos", description: "Modelo y consulto datos relacionales y NoSQL." },
  },
  {
    title: "Tooling",
    subtitle: "Workflow",
    description: "Version control, design and deployment.",
    items: ["Git", "GitHub", "Figma", "Vercel"],
    es: { title: "Herramientas", subtitle: "Flujo de trabajo", description: "Control de versiones, diseño y despliegue." },
  },
];
