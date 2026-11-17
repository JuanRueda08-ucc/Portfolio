export type Project = {
  slug: string;
  title: string;
  description: string;
  year: number;
  tags: string[];
  /** Cover image in /public/images/projects */
  image?: string;
  /** Short video (MP4/WebM) in /public/videos */
  video?: string;
  github: string;
  /** Live demo; projects without one link to the repository instead. */
  demo?: string;
  /** Shown in the pinned "Featured work" section. */
  featured?: boolean;
  /** Hue (0–360) for the generated cover when there's no image/video yet. */
  hue?: number;
};

export type Testimonial = {
  name: string;
  relation: string; // Professor, Classmate, Client…
  avatar?: string;
  quote: string;
};

export type ExperienceItem = {
  type: "education" | "work";
  title: string;
  place: string;
  start: string;
  end: string; // "Present" if ongoing
  description?: string;
};

export type SkillGroup = {
  title: string;
  subtitle: string;
  description: string;
  items: string[];
};

export type SocialLink = {
  label: string;
  href: string;
};
