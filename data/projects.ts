import type { Project } from "./types";

// The three main projects first (shown in Featured work, in this order), then the rest by
// the owner's preference (2026-11-18): Vigía, Ecos de la Tierra, Vinyl Player, TickGo last.
// Covers live in /public/images/projects/<slug>.webp (1280×800); videos would go in /public/videos/<slug>.mp4.
// Projects without a live demo link their whole card to the repository.
export const projects: Project[] = [
  {
    slug: "ancla-calma",
    title: "Ancla Calma",
    description:
      "Emotional support web app for university students: self-regulation tools, crisis help and peer support, wrapped in a calm lighthouse-at-night world.",
    es: { description: "App web de apoyo emocional para universitarios: herramientas de autorregulación, ayuda en crisis y apoyo entre pares, en un mundo tranquilo de faro nocturno." },
    year: 2026,
    tags: ["React", "Vite", "Tailwind", "Supabase"],
    image: "/images/projects/ancla-calma.webp",
    video: "/videos/ancla-calma.mp4",
    videoFull: "/videos/ancla-calma-full.mp4",
    github: "https://github.com/JuanRueda08-ucc/ancla-calma",
    demo: "https://ancla-calma.vercel.app",
    featured: true,
    hue: 220,
  },
  {
    slug: "finanzia",
    title: "FinanzIA",
    description:
      "Team project. Conversational personal-finance assistant: a Next.js chat with a secure backend-for-frontend, a Java backend and a LangGraph AI agent.",
    es: { description: "Proyecto en equipo. Asistente conversacional de finanzas personales: un chat en Next.js con un backend-for-frontend seguro, un backend en Java y un agente de IA con LangGraph." },
    year: 2026,
    tags: ["Next.js", "LangGraph", "Java", "Team"],
    image: "/images/projects/finanzia.webp",
    video: "/videos/finanzia.mp4",
    videoFull: "/videos/finanzia-full.mp4",
    github: "https://github.com/Proyecto-final-4",
    demo: "https://frontend-sooty-five-52.vercel.app",
    featured: true,
    hue: 110,
  },
  {
    slug: "chef-digital",
    title: "Chef Digital",
    description:
      "Desktop cooking assistant for Windows, macOS and Linux: pick what's in your kitchen and an animated chef guides you step by step with voice, timers and hands-free voice control.",
    es: { description: "Asistente de cocina de escritorio para Windows, macOS y Linux: eliges lo que hay en tu cocina y un chef animado te guía paso a paso con voz, temporizadores y control por voz sin manos." },
    year: 2026,
    tags: ["Electron", "Svelte", "TypeScript", "Supabase"],
    image: "/images/projects/chef-digital.webp",
    video: "/videos/chef-digital.mp4",
    videoFull: "/videos/chef-digital-full.mp4",
    github: "https://github.com/JuanRueda08-ucc/assistant-chef-desktop",
    featured: true,
    hue: 18,
  },
  {
    slug: "vigia",
    title: "Vigía",
    description:
      "Android prototype that watches for eye signals of drowsiness on public-transport trips and warns the driver, all on the device.",
    es: { description: "Prototipo Android que detecta señales de somnolencia en los ojos durante viajes en transporte público y alerta al conductor, todo en el dispositivo." },
    year: 2026,
    tags: ["Flutter", "Dart", "Kotlin", "Firebase"],
    image: "/images/projects/vigia.webp",
    github: "https://github.com/JuanRueda08-ucc/mobile-final-interface",
    hue: 30,
  },
  {
    slug: "ecos-de-la-tierra",
    title: "Ecos de la Tierra",
    description:
      "Team project. A 2D pixel-art RPG with action and turn-based combat: every monster grows from a real cause, like deforestation, and only the right ecological skill heals the region.",
    es: { description: "Proyecto en equipo. Un RPG 2D en pixel art con combate de acción y por turnos: cada monstruo nace de una causa real, como la deforestación, y solo la habilidad ecológica correcta sana la región." },
    year: 2026,
    tags: ["Godot 4", "GDScript", "Game design", "Team"],
    image: "/images/projects/ecos-de-la-tierra.webp",
    video: "/videos/ecos-de-la-tierra.mp4",
    videoFull: "/videos/ecos-de-la-tierra-full.mp4",
    github: "https://github.com/diarpicu2022-commits/ecos-de-la-tierra",
    hue: 130,
  },
  {
    slug: "vinyl-player",
    title: "Vinyl Player",
    description:
      "Turntable-style music player whose playlist is a doubly linked list, with an LRU blob cache and a Web Audio visualizer. Built for Data Structures.",
    es: { description: "Reproductor de música estilo tocadiscos cuya lista de reproducción es una lista doblemente enlazada, con caché LRU de blobs y visualizador Web Audio. Hecho para Estructuras de Datos." },
    year: 2026,
    tags: ["TypeScript", "Web Audio API", "Data structures"],
    image: "/images/projects/vinyl-player.webp",
    video: "/videos/vinyl-player.mp4",
    videoFull: "/videos/vinyl-player-full.mp4",
    github: "https://github.com/JuanRueda08-ucc/Vinyl-Player",
    demo: "https://vinyl-player-beryl.vercel.app",
    hue: 350,
  },
  {
    slug: "tickgo",
    title: "TickGo",
    description:
      "Wear OS app that gets you out the door on time: it plans your prep backwards from the event, walks you through four states with distinct vibrations, learns how long you really take and explains why it nudged you.",
    es: { description: "App para Wear OS que te ayuda a salir a tiempo: planea tu preparación hacia atrás desde el evento, te guía por cuatro estados con vibraciones distintas, aprende cuánto tardas de verdad y te explica por qué te avisó." },
    year: 2026,
    tags: ["Kotlin", "Wear OS", "Voice input"],
    image: "/images/projects/tickgo.webp",
    video: "/videos/tickgo.mp4",
    videoFull: "/videos/tickgo-full.mp4",
    github: "https://github.com/JuanRueda08-ucc/Smartwatch-project",
    hue: 200,
  },
];
