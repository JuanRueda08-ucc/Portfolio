import type { SocialLink } from "./types";

// Real data from the owner's CV and LinkedIn (2026-11-17).
export const profile = {
  displayName: "Juano Rueda",
  initials: "JR",
  role: "Software & AI Engineer",
  tagline: "I build software that feels a little bit magical.",
  career: "Software Engineering",
  semester: "5th semester",
  city: "San Juan de Pasto",
  timezone: "America/Bogota",
  email: "juanjoruedav@gmail.com",
  /** Harvard-format CV (built by scripts/cv/build_cv.py); the Spanish one is `es.cv`. */
  cv: "/cv.pdf",
  /** Profile photo (hero avatar). */
  photo: "/images/me.webp" as string | undefined,
  /** Personal JR monogram logo (chrome on blue). Drawn with lines in About and used as avatar until there's a photo. */
  logo: "/images/logo-jr.webp",
  /** Phrase scattered across the About section; letters scramble randomly. */
  manifesto: "Why not build software that feels just a little bit magical?",
  about:
    "I'm a Software Engineering student from Pasto, Colombia, with a C1 level of English. I build web, desktop and mobile apps, from AI agents to on-device computer vision, and I love interfaces that feel alive: clean code on the inside, carefully crafted details on the outside. Years of customer service taught me to listen first, which is how I turn other people's ideas into products.",
  interests: ["Web development", "UI/UX", "Motion", "Video games"],
  /** Spanish copy (same keys). The manifesto keeps 11 words to match About's word positions. */
  es: {
    role: "Ingeniero de Software e IA",
    cv: "/cv-es.pdf",
    tagline: "Construyo software que se siente un poquito mágico.",
    career: "Ingeniería de Software",
    semester: "5.º semestre",
    manifesto: "¿Por qué no construir software que se sienta un poquito mágico?",
    about:
      "Soy estudiante de Ingeniería de Software de Pasto, Colombia, con nivel C1 de inglés. Construyo apps web, de escritorio y móviles, desde agentes de IA hasta visión por computadora en el dispositivo, y me encantan las interfaces que se sienten vivas: código limpio por dentro y detalles cuidados por fuera. Años de atención al cliente me enseñaron a escuchar primero, y así convierto las ideas de otros en productos.",
    interests: ["Desarrollo web", "UI/UX", "Animación", "Videojuegos"],
  },
};

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/JuanRueda08-ucc" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/juan-jos%C3%A9-rueda-viveros-75b8972a6" },
];

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;
