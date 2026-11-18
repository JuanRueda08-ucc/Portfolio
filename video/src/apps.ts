// What each project video shows. Times are in seconds of the raw recording (1440×900).
export type Segment = {
  from: number;
  to: number;
  /** Playback speed of this stretch (navigation goes faster, the good parts at 1×). */
  rate: number;
  /** Show this title card immediately before the segment. */
  chapter?: string;
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
  outro?: { github: string; demo?: string };
};

export const FPS = 30;
export const WINDOW = { x: 96, y: 75, width: 1088, height: 680 };
export const INTRO = 36; // frames of title card before the clip slides in
export const CHAPTER = FPS * 2;
export const OUTRO = FPS * 6;

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

export const chefDigital: DemoProps = {
  clip: "clips/chef-digital.mp4",
  title: "Chef Digital",
  tagline: "A desktop kitchen assistant that cooks with you, step by step",
  url: "Chef Digital · Windows · macOS · Linux",
  bg: ["#170f02", "#6b4a00"],
  accent: "#ffc83d",
  segments: [
    { from: 0.3, to: 12, rate: 1.6, caption: "Tell it what you have, it plans the meal" },
    { from: 12, to: 25.5, rate: 2.2, caption: "Ideas for today" },
    { from: 25.5, to: 38.5, rate: 1.25, caption: "Just tell the chef what you have", zoom: { x: 1430, y: 250, scale: 1.3 } },
    { from: 38.5, to: 54, rate: 1.7, caption: "Or add it by hand, and choose servings" },
    { from: 54, to: 62, rate: 1.15, caption: "Recipes from what is in your kitchen" },
    { from: 62, to: 72, rate: 1.5, caption: "What you have, and what is missing" },
    { from: 72, to: 82, rate: 1.1, caption: "Cook step by step with the chef's tips" },
    { from: 82, to: 89.4, rate: 1, caption: "Built-in timers for every step", zoom: { x: 1425, y: 200, scale: 1.45 } },
  ],
};

export const finanziaFull: DemoProps = {
  clip: "clips/finanzia-full.mp4",
  title: "FinanzIA",
  tagline: "A personal finance assistant",
  url: "frontend-sooty-five-52.vercel.app",
  bg: ["#09110b", "#21402b"],
  accent: "#bcff70",
  segments: [
    { from: 0, to: 31, rate: 1.15, chapter: "Explore the workspace", caption: "Sign in and review transactions, budgets and goals" },
    { from: 31, to: 100, rate: 1.3, chapter: "Review spending", caption: "Ask the assistant to record an expense and explain the month" },
    { from: 100, to: 134, rate: 1.15, chapter: "Record income", caption: "Choose the salary category and confirm the deposit" },
    { from: 134, to: 190.8, rate: 1.2, chapter: "Track savings goals", caption: "Review the conversation and check the updated goals" },
  ],
  outro: { github: "https://github.com/Proyecto-final-4", demo: "https://frontend-sooty-five-52.vercel.app" },
};

export const chefDigitalFull: DemoProps = {
  ...chefDigital,
  clip: "clips/chef-digital-full.mp4",
  outro: { github: "https://github.com/JuanRueda08-ucc/assistant-chef-desktop" },
  segments: [
    { from: 0, to: 4, rate: 1, chapter: "Welcome", caption: "Plan a meal from what you already have" },
    { from: 13, to: 17, rate: 1 },
    { from: 24, to: 27, rate: 1 },
    { from: 114, to: 120, rate: 1 },
    { from: 210, to: 242.96, rate: 1.1, chapter: "Build your pantry", caption: "Tell the chef what you have, then add vegetables and adjust servings" },
    { from: 242.96, to: 263.2, rate: 1.1, chapter: "Ask the chef", caption: "Compare pantry matches with ideas from the chef" },
    { from: 263.2, to: 292.5, rate: 1.05, chapter: "Cook all nine steps", caption: "Ask about a technique without leaving the current step", captionTop: true },
    { from: 292.5, to: 317.15, rate: 1, captionTop: true },
    { from: 317.15, to: 352.2, rate: 1.1 },
    { from: 352.2, to: 407.6, rate: 1.25, chapter: "Save a chef idea", caption: "Finish the suggested dish and reopen it from your collection", captionTop: true },
    { from: 407.6, to: 429, rate: 1.12, chapter: "Make it yours", caption: "Visit the local profile and return home in dark mode" },
  ],
};

export const anclaCalmaFull: DemoProps = {
  ...anclaCalma,
  clip: "clips/ancla-calma-full.mp4",
  outro: { github: "https://github.com/JuanRueda08-ucc/ancla-calma", demo: "https://ancla-calma.vercel.app" },
  segments: [
    { from: 0, to: 12, rate: 1, chapter: "Choose your path", caption: "Explore the islands in daylight and after dark" },
    { from: 12, to: 18, rate: 1, chapter: "Find support", caption: "Set up a trusted contact on the island of help" },
    { from: 18, to: 39, rate: 1, chapter: "Breathe with the waves", caption: "Follow a complete guided breathing cycle" },
    { from: 39, to: 102, rate: 1, chapter: "Anchor your senses", caption: "Practice grounding, muscle relaxation and sensory awareness" },
    { from: 102, to: 112, rate: 1, chapter: "Visit the lighthouse", caption: "Save a tool to your personal collection" },
    { from: 112, to: 135, rate: 1, chapter: "Keep a journal", caption: "Record how you feel and add a voice note" },
    { from: 135, to: 144, rate: 1, chapter: "Recognise the signs", caption: "Read about the signs of distress" },
    { from: 144, to: 154.5, rate: 1, chapter: "Support someone", caption: "Explore resources for accompanying someone through distress" },
    { from: 154.5, to: 160.8, rate: 1, chapter: "Return to the map", caption: "Review the profile and return to the islands" },
  ],
};
export const vinylPlayerFull: DemoProps = {
  ...vinylPlayer,
  clip: "clips/vinyl-player-full.mp4",
  outro: { github: "https://github.com/JuanRueda08-ucc/Vinyl-Player", demo: "https://vinyl-player-beryl.vercel.app" },
  segments: [
    { from: 0, to: 9, rate: 1, chapter: "Build the queue", caption: "Append two tracks, then put Lo-fi Sunrise first" },
    { from: 9, to: 20.7, rate: 1, chapter: "Insert at a position", caption: "Insert Ocean Static into the second slot" },
    { from: 20.7, to: 36, rate: 1, chapter: "Play a record", caption: "Play the first record and skip between tracks" },
    { from: 36, to: 45.4, rate: 1, chapter: "Playback controls", caption: "Seek within a track, adjust the volume and mute" },
    { from: 45.4, to: 66.8, rate: 1, chapter: "Shuffle and repeat", caption: "Shuffle the next track and cycle through the repeat modes" },
    { from: 66.8, to: 90.2, rate: 1, chapter: "Inspect the linked list", caption: "Follow the links between the head, current track and tail" },
    { from: 90.2, to: 113.7, rate: 1, chapter: "Edit the playlist", caption: "Remove a track, check the new links and pause the record" },
  ],
};

/** Frames a list of segments takes once each runs at its own speed. */
export const segmentFrames = (s: Segment) => Math.round(((s.to - s.from) * FPS) / s.rate);
export function timeline(p: DemoProps) {
  let at = INTRO;
  const parts = p.segments.map((s) => {
    const cardStart = at;
    if (s.chapter) at += CHAPTER;
    const start = at;
    at += segmentFrames(s);
    return { s, cardStart, start };
  });
  return { parts, outroStart: at, duration: at + (p.outro ? OUTRO : 0) };
}

export const totalFrames = (p: DemoProps) => timeline(p).duration;
