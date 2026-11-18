import type { SocialLink } from "./types";

// TODO(Juano): fill in real email and links.
export const profile = {
  displayName: "Juano Rueda",
  initials: "JR",
  role: "Software Engineering Student",
  tagline: "I build software that feels a little bit magical.",
  career: "Software Engineering",
  semester: "5th semester",
  city: "San Juan de Pasto",
  timezone: "America/Bogota",
  email: "hello@example.com",
  cv: "/cv.pdf",
  /** Profile photo (hero avatar). */
  photo: "/images/me.webp" as string | undefined,
  /** Personal JR monogram logo (chrome on blue). Drawn with lines in About and used as avatar until there's a photo. */
  logo: "/images/logo-jr.webp",
  /** Phrase scattered across the About section; letters scramble randomly. */
  manifesto: "Why not build software that feels just a little bit magical?",
  about:
    "I'm a Software Engineering student from Pasto, Colombia. I love building interfaces that feel alive: clean code on the inside, carefully crafted details on the outside. Placeholder text — we'll rewrite it together.",
  interests: ["Web development", "UI/UX", "Motion", "Video games"],
  /** Spanish copy (same keys). The manifesto keeps 11 words to match About's word positions. */
  es: {
    role: "Estudiante de Ingeniería de Software",
    tagline: "Construyo software que se siente un poquito mágico.",
    career: "Ingeniería de Software",
    semester: "5.º semestre",
    manifesto: "¿Por qué no construir software que se sienta un poquito mágico?",
    about:
      "Soy estudiante de Ingeniería de Software de Pasto, Colombia. Me encanta crear interfaces que se sienten vivas: código limpio por dentro y detalles cuidados por fuera. Texto provisional — lo reescribimos juntos.",
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
