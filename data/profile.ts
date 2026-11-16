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
  /** TODO(Juano): add your photo at /public/images/me.jpg and set this to "/images/me.jpg". */
  photo: undefined as string | undefined,
  /** Phrase scattered across the About section; letters scramble randomly. */
  manifesto: "Why not build software that feels just a little bit magical?",
  about:
    "I'm a Software Engineering student from Pasto, Colombia. I love building interfaces that feel alive: clean code on the inside, carefully crafted details on the outside. Placeholder text — we'll rewrite it together.",
  interests: ["Web development", "UI/UX", "Motion", "Video games"],
};

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/JuanRueda08-ucc" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;
