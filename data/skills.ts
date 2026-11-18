import type { SkillGroup } from "./types";

// From the owner's LinkedIn skills (2026-11-17) and the stacks used in his projects.
export const skills: SkillGroup[] = [
  {
    title: "Frontend",
    subtitle: "Living interfaces",
    description: "Responsive, accessible and animated interfaces, from the first sketch to the last detail.",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "Tailwind", "Svelte", "GSAP"],
    es: {
      title: "Frontend",
      subtitle: "Interfaces vivas",
      description: "Interfaces responsivas, accesibles y animadas, del primer boceto al último detalle.",
    },
  },
  {
    title: "Backend",
    subtitle: "Logic & APIs",
    description: "REST APIs and services with clear architecture, plus AI agents that do real work.",
    items: ["Java", "Python", "Node.js", "Django", "REST APIs", "AWS Lambda", "LangGraph"],
    es: {
      title: "Backend",
      subtitle: "Lógica y APIs",
      description: "APIs REST y servicios con una arquitectura clara, más agentes de IA que hacen trabajo real.",
    },
  },
  {
    title: "Data",
    subtitle: "Databases",
    description: "I design databases and query relational and NoSQL data.",
    items: ["SQL", "PostgreSQL", "MongoDB", "Supabase"],
    es: {
      title: "Datos",
      subtitle: "Bases de datos",
      description: "Diseño bases de datos y consulto datos relacionales y NoSQL.",
    },
  },
  {
    title: "Apps & tooling",
    subtitle: "Beyond the browser",
    description: "Desktop, mobile and wearable apps, with version control and deployment.",
    items: ["Electron", "Flutter", "Kotlin", "Git", "GitHub", "Vercel"],
    es: {
      title: "Apps y herramientas",
      subtitle: "Más allá del navegador",
      description: "Apps de escritorio, móviles y de reloj, con control de versiones y despliegue.",
    },
  },
];
