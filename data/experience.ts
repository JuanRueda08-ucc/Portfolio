import type { ExperienceItem } from "./types";

// TODO(Juano): define real experience. Order from most recent to oldest.
export const experience: ExperienceItem[] = [
  {
    type: "education",
    title: "B.S. in Software Engineering",
    place: "University (TBD)",
    start: "2024",
    end: "Present",
    description: "Currently in 5th semester.",
    es: { title: "Ingeniería de Software", place: "Universidad (por definir)", description: "Actualmente en 5.º semestre." },
  },
  {
    type: "education",
    title: "Sample online course",
    place: "Online platform",
    start: "2025",
    end: "2025",
    es: { title: "Curso en línea de ejemplo", place: "Plataforma en línea" },
  },
  {
    type: "work",
    title: "Freelance Developer",
    place: "Independent projects",
    start: "2025",
    end: "Present",
    description: "Example: websites for small businesses.",
    es: { title: "Desarrollador freelance", place: "Proyectos independientes", description: "Ejemplo: sitios web para pequeños negocios." },
  },
];
