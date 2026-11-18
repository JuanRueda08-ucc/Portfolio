/** Spanish copy of an item's text fields; anything missing falls back to English. */
export type Es<T> = { es?: Partial<T> };

type ProjectText = { description: string };

export type Project = ProjectText & Es<ProjectText> & {
  slug: string;
  title: string;
  year: number;
  tags: string[];
  /** Cover image in /public/images/projects */
  image?: string;
  /** Short video (MP4/WebM) in /public/videos */
  video?: string;
  /** Full walkthrough for the Watch demo player. */
  videoFull?: string;
  github: string;
  /** Live demo; projects without one link to the repository instead. */
  demo?: string;
  /** Shown in the pinned "Featured work" section. */
  featured?: boolean;
  /** Hue (0–360) for the generated cover when there's no image/video yet. */
  hue?: number;
};

type TestimonialText = {
  relation: string; // Professor, Classmate, Client…
  quote: string;
};

export type Testimonial = TestimonialText & Es<TestimonialText> & {
  name: string;
  avatar?: string;
};

type ExperienceText = {
  title: string;
  place: string;
  description?: string;
};

export type ExperienceItem = ExperienceText & Es<ExperienceText> & {
  type: "education" | "work";
  start: string;
  /** "Present" if ongoing (translated on screen). */
  end: string;
};

type SkillText = {
  title: string;
  subtitle: string;
  description: string;
};

export type SkillGroup = SkillText & Es<SkillText> & {
  items: string[];
};

export type SocialLink = {
  label: string;
  href: string;
};
