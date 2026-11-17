// What each project video shows. Times are in seconds of the raw recording (1440×900).
export type Segment = {
  from: number;
  to: number;
  /** Playback speed of this stretch (navigation goes faster, the good parts at 1×). */
  rate: number;
  caption?: string;
  /** Put the caption at the top when the action is at the bottom of the screen. */
  captionTop?: boolean;
  /** Zoom into a point of the recording (source px) while this segment plays. */
  zoom?: { x: number; y: number; scale: number };
};

export type DemoProps = {
  clip: string;
  title: string;
  tagline: string;
  url: string;
  /** Background gradient stops. */
  bg: [string, string];
  accent: string;
  segments: Segment[];
};

export const FPS = 30;
export const INTRO = 36; // frames of title card before the clip slides in

export const anclaCalma: DemoProps = {
  clip: "clips/ancla-calma.mp4",
  title: "Ancla Calma",
  tagline: "Emotional support for university students",
  url: "ancla-calma.vercel.app",
  bg: ["#071735", "#123f7a"],
  accent: "#f5a742",
  segments: [
    { from: 0.6, to: 5.8, rate: 1, caption: "A calm place, wherever you are" },
    { from: 5.8, to: 9.3, rate: 1.4, caption: "Spanish or English" },
    { from: 9.3, to: 15, rate: 1.3, caption: "Get help, or learn to help someone" },
    { from: 15, to: 25, rate: 1.25, caption: "An island map of support tools" },
    { from: 25, to: 35.5, rate: 1, caption: "Guided box breathing", zoom: { x: 713, y: 330, scale: 1.45 } },
    { from: 35.5, to: 43, rate: 2.4 },
    { from: 43, to: 48, rate: 1, caption: "Recognise the signs of distress" },
  ],
};

export const vinylPlayer: DemoProps = {
  clip: "clips/vinyl-player.mp4",
  title: "Vinyl Player",
  tagline: "A turntable music player built on a doubly linked list",
  url: "vinyl-player-beryl.vercel.app",
  bg: ["#1a0a0e", "#5c0f1f"],
  accent: "#e8143c",
  segments: [
    { from: 0.4, to: 9.2, rate: 1.5, caption: "Drop in your MP3s" },
    { from: 9.2, to: 17.5, rate: 1.15, caption: "Hit play and the record spins" },
    { from: 17.5, to: 36.8, rate: 1.7, caption: "Next, shuffle, repeat and seek" },
    {
      from: 36.8,
      to: 48.6,
      rate: 1,
      caption: "Every track is a node: prev ↔ next",
      captionTop: true,
      zoom: { x: 250, y: 860, scale: 1.35 },
    },
  ],
};

/** Frames a list of segments takes once each runs at its own speed. */
export const segmentFrames = (s: Segment) => Math.round(((s.to - s.from) * FPS) / s.rate);
export const totalFrames = (p: DemoProps) => INTRO + p.segments.reduce((n, s) => n + segmentFrames(s), 0);
