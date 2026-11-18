import type { Project } from "./types";

// The three main projects first (shown in Featured work, in this order), then the rest.
// Covers live in /public/images/projects/<slug>.webp (1280×800); videos would go in /public/videos/<slug>.mp4.
// Projects without a live demo link their whole card to the repository.
export const projects: Project[] = [
  {
    slug: "ancla-calma",
    title: "Ancla Calma",
    description:
      "Emotional support web app for university students: self-regulation tools, crisis help and peer support, wrapped in a calm lighthouse-at-night world.",
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
    slug: "tickgo",
    title: "TickGo",
    description:
      "Wear OS app that gets you out the door on time: it plans your prep backwards from the event, walks you through four states with distinct vibrations, learns how long you really take and explains why it nudged you.",
    year: 2026,
    tags: ["Kotlin", "Wear OS", "Voice input"],
    image: "/images/projects/tickgo.webp",
    video: "/videos/tickgo.mp4",
    videoFull: "/videos/tickgo-full.mp4",
    github: "https://github.com/JuanRueda08-ucc/Smartwatch-project",
    hue: 200,
  },
  {
    slug: "vigia",
    title: "Vigía",
    description:
      "Android prototype that watches for eye signals of drowsiness on public-transport trips and warns the driver, all on the device.",
    year: 2026,
    tags: ["Flutter", "Dart", "Kotlin", "Firebase"],
    image: "/images/projects/vigia.webp",
    github: "https://github.com/JuanRueda08-ucc/mobile-final-interface",
    hue: 30,
  },
  {
    slug: "vinyl-player",
    title: "Vinyl Player",
    description:
      "Turntable-style music player whose playlist is a doubly linked list, with an LRU blob cache and a Web Audio visualizer. Built for Data Structures.",
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
    slug: "ecos-de-la-tierra",
    title: "Ecos de la Tierra",
    description:
      "Team project. A 2D pixel-art RPG with action and turn-based combat: every monster grows from a real cause, like deforestation, and only the right ecological skill heals the region.",
    year: 2026,
    tags: ["Godot 4", "GDScript", "Game design", "Team"],
    image: "/images/projects/ecos-de-la-tierra.webp",
    video: "/videos/ecos-de-la-tierra.mp4",
    videoFull: "/videos/ecos-de-la-tierra-full.mp4",
    github: "https://github.com/diarpicu2022-commits/ecos-de-la-tierra",
    hue: 130,
  },
];
