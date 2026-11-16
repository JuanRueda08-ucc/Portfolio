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
  demo: string;
  featured?: boolean;
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
