import type { ExperienceItem } from "./types";

// From the owner's CV and LinkedIn (2026-11-17). Most recent first.
export const experience: ExperienceItem[] = [
  {
    type: "education",
    title: "B.S. in Software Engineering",
    place: "Universidad Cooperativa de Colombia · Pasto",
    start: "2024",
    end: "Present",
    description: "5th semester, expected May 2028. Coursework includes Data Structures and Interface Design.",
    es: {
      title: "Ingeniería de Software",
      place: "Universidad Cooperativa de Colombia · Pasto",
      description: "5.º semestre, graduación esperada en mayo de 2028. Cursos como Estructuras de Datos y Diseño de Interfaces.",
    },
  },
  {
    type: "education",
    title: "General English Standard Course (C1)",
    place: "Bayswater College · Calgary, Canada",
    // Dates still to confirm with the owner: shown without a date range.
    start: "",
    end: "",
    description: "Advanced English, full professional proficiency.",
    es: {
      title: "General English Standard Course (C1)",
      place: "Bayswater College · Calgary, Canadá",
      description: "Inglés avanzado, dominio profesional completo.",
    },
  },
  {
    type: "education",
    title: "High School Diploma",
    place: "Colegio Filipense “Nuestra Señora de la Esperanza” · Pasto",
    start: "2010",
    end: "2022",
    es: {
      title: "Bachiller Académico",
      place: "Colegio Filipense “Nuestra Señora de la Esperanza” · Pasto",
    },
  },
  {
    type: "work",
    title: "Customer Service Representative",
    place: "Coldulces La 21 · Pasto",
    start: "2023",
    end: "2026",
    description:
      "Advised customers in person and remotely, managed billing, cash handling and inventory, and supported logistics and order distribution.",
    es: {
      title: "Representante de Atención al Cliente",
      place: "Coldulces La 21 · Pasto",
      description:
        "Asesoré a clientes de forma presencial y remota, gestioné facturación, caja e inventario, y apoyé la logística y distribución de pedidos.",
    },
  },
];
