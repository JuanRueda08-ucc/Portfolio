import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, INTRO, OUTRO } from "./apps";

// A phone app on the 1280×800 canvas: the phone on the left, the chapter on the right.
// Times are seconds of the recording; x/y are device pixels.
export const DEVICE = { w: 1080, h: 2400 };
const SCREEN = { w: 324, h: 720 };
const K = SCREEN.w / DEVICE.w;
const BEZEL = 13;
const PHONE = { w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2 };
const PHONE_X = 384 - PHONE.w / 2;
const PANEL_X = 640;
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export type PhoneSegment = {
  from: number;
  to: number;
  rate: number;
  chapter?: string;
  caption?: string;
  /** Zoom into a device point between two recording times (eased in and out). */
  zoom?: { x: number; y: number; scale: number; at: number; until: number };
};
export type Tap = { t: number; x: number; y: number; to?: [number, number]; ms?: number };
export type PhoneProps = {
  clip: string;
  title: string;
  tagline: string;
  platform: string;
  bg: [string, string];
  accent: string;
  segments: PhoneSegment[];
  taps: Tap[];
  outro?: { github: string; demo?: string };
};

const frames = (s: PhoneSegment) => Math.round(((s.to - s.from) * FPS) / s.rate);

export function phoneTimeline(p: PhoneProps) {
  let at = INTRO;
  const parts = p.segments.map((s) => {
    const start = at;
    at += frames(s);
    return { s, start };
  });
  // A chapter lasts until the next segment that opens one.
  const chapters = parts
    .map((part, i) => ({ ...part, i }))
    .filter(({ s }) => s.chapter)
    .map((c, n, all) => ({ title: c.s.chapter!, n, start: c.start, end: all[n + 1]?.start ?? at }));
  return { parts, chapters, outroStart: at, duration: at + (p.outro ? OUTRO : 0) };
}

export const phoneFrames = (p: PhoneProps) => phoneTimeline(p).duration;

export const PhoneDemo: React.FC<PhoneProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const { parts, chapters, outroStart } = phoneTimeline(p);
  const rise = spring({ frame: frame - INTRO + 12, fps, config: { damping: 18, mass: 0.9 } });
  const titleOut = interpolate(frame, [INTRO - 12, INTRO + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phoneY = (height - PHONE.h) / 2;

  // Camera zoom: the whole phone grows toward the action, so the screen is never cropped sideways.
  const active = parts.find(({ s, start }) => frame >= start && frame < start + frames(s));
  let zoom = 1;
  let focusY = PHONE.h / 2;
  if (active?.s.zoom) {
    const { s, start } = active;
    const z = s.zoom!;
    const t = s.from + ((frame - start) * s.rate) / FPS;
    const k = interpolate(t, [z.at, z.at + 0.9, z.until - 0.7, z.until], [0, 1, 1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
    });
    zoom = 1 + (z.scale - 1) * k;
    focusY = BEZEL + z.y * K;
  }

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 20% 110%, ${p.bg[1]}, ${p.bg[0]} 70%)`, fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Title card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: titleOut }}>
        <div style={{ color: "#fff", fontSize: 84, fontWeight: 700, letterSpacing: -2, opacity: interpolate(frame, [0, 10], [0, 1]) }}>{p.title}</div>
        <div style={{ color: "rgba(255,255,255,.72)", fontSize: 25, marginTop: 10, opacity: interpolate(frame, [6, 16], [0, 1], { extrapolateRight: "clamp" }) }}>
          {p.tagline}
        </div>
      </AbsoluteFill>

      {/* Soft glow behind the phone */}
      <div
        style={{
          position: "absolute", left: PHONE_X - 160, top: phoneY - 40, width: PHONE.w + 320, height: PHONE.h + 80,
          background: `radial-gradient(closest-side, ${p.accent}40, transparent)`, opacity: rise,
        }}
      />

      {/* Phone */}
      <div
        style={{
          position: "absolute", left: PHONE_X, top: phoneY + (1 - rise) * 160, opacity: rise,
          transform: `scale(${zoom})`, transformOrigin: `50% ${focusY}px`,
          width: PHONE.w, height: PHONE.h, borderRadius: 54, background: "#0b0a0e", padding: BEZEL, boxSizing: "border-box",
          boxShadow: "0 50px 100px -30px rgba(0,0,0,.75), 0 0 0 1.5px rgba(255,255,255,.14), inset 0 0 0 2px #24222b",
        }}
      >
        {[{ top: 150, h: 46 }, { top: 214, h: 82 }].map((b) => (
          <span key={b.top} style={{ position: "absolute", right: -3, top: b.top, width: 3, height: b.h, borderRadius: 2, background: "#2c2a33" }} />
        ))}
        <div style={{ position: "relative", width: SCREEN.w, height: SCREEN.h, borderRadius: 42, overflow: "hidden", background: "#000" }}>
          {parts.map(({ s, start }) => (
            <Sequence key={s.from} from={start} durationInFrames={frames(s)} layout="none">
              <Screen clip={p.clip} s={s} taps={p.taps} />
            </Sequence>
          ))}
        </div>
      </div>

      {/* Chapter panel */}
      {chapters.map((c) => (
        <Sequence key={c.start} from={c.start} durationInFrames={c.end - c.start} layout="none">
          <ChapterTitle n={c.n + 1} total={chapters.length} title={c.title} accent={p.accent} length={c.end - c.start} />
        </Sequence>
      ))}
      {parts.map(({ s, start }) =>
        s.caption ? (
          <Sequence key={"c" + s.from} from={start} durationInFrames={frames(s)} layout="none">
            <Caption text={s.caption} length={frames(s)} />
          </Sequence>
        ) : null,
      )}
      <Progress chapters={chapters} accent={p.accent} platform={p.platform} />

      {p.outro && (
        <Sequence from={outroStart} durationInFrames={OUTRO}>
          <Outro title={p.title} accent={p.accent} background={p.bg[0]} links={[p.outro.github, p.outro.demo]} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

/** One stretch of the recording at its speed, with its taps. */
const Screen: React.FC<{ clip: string; s: PhoneSegment; taps: Tap[] }> = ({ clip, s, taps }) => {
  const frame = useCurrentFrame();
  const t = s.from + (frame * s.rate) / FPS; // recording time on screen now
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <OffthreadVideo
        src={staticFile(clip)}
        trimBefore={Math.round(s.from * FPS)}
        playbackRate={s.rate}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {taps.filter((tap) => tap.t >= s.from - 0.1 && tap.t < s.to).map((tap) => (
        <Touch key={tap.t} tap={tap} t={t} rate={s.rate} />
      ))}
    </div>
  );
};

/** A fingertip: presses in, then leaves a ring that spreads and fades. Swipes drag it along. */
const Touch: React.FC<{ tap: Tap; t: number; rate: number }> = ({ tap, t, rate }) => {
  const dt = ((t - tap.t) * FPS) / rate; // output frames since the press
  const hold = tap.to ? Math.max(6, ((tap.ms ?? 400) / 1000) * FPS / rate) : 3;
  if (dt < -5 || dt > hold + 18) return null;
  const move = tap.to ? interpolate(dt, [0, hold], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }) : 0;
  const x = (tap.x + ((tap.to?.[0] ?? tap.x) - tap.x) * move) * K;
  const y = (tap.y + ((tap.to?.[1] ?? tap.y) - tap.y) * move) * K;
  const dot = interpolate(dt, [-5, 0, hold, hold + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const press = interpolate(dt, [-5, 0, 2], [1.25, 0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate(dt, [hold, hold + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const R = 15;
  return (
    <>
      {!tap.to && dt >= hold && (
        <div style={{
          position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%",
          border: "2.5px solid rgba(255,255,255,.95)", boxShadow: "0 0 0 1px rgba(0,0,0,.25)",
          transform: `scale(${1 + ring * 1.6})`, opacity: 1 - ring,
        }} />
      )}
      <div style={{
        position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%",
        background: "rgba(255,255,255,.62)", border: "1.5px solid rgba(20,18,28,.45)",
        boxShadow: "0 4px 14px rgba(0,0,0,.35)", opacity: dot, transform: `scale(${press})`,
      }} />
    </>
  );
};

const ChapterTitle: React.FC<{ n: number; total: number; title: string; accent: string; length: number }> = ({ n, total, title, accent, length }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 20 } });
  const out = interpolate(frame, [length - 8, length], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: PANEL_X, top: 250, width: 560, opacity: inn * out, transform: `translateY(${(1 - inn) * 28 - (1 - out) * 16}px)` }}>
      <div style={{ color: accent, fontSize: 18, fontWeight: 600, letterSpacing: 3, fontFamily: "ui-monospace, Consolas, monospace" }}>
        {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div style={{ color: "#fff", fontSize: 54, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, marginTop: 14 }}>{title}</div>
    </div>
  );
};

const Caption: React.FC<{ text: string; length: number }> = ({ text, length }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - 6, fps, config: { damping: 20 } });
  const out = interpolate(frame, [length - 8, length], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: PANEL_X, top: 400, width: 540, color: "rgba(255,255,255,.8)", fontSize: 26, lineHeight: 1.45,
      opacity: inn * out, transform: `translateY(${(1 - inn) * 18}px)`,
    }}>
      {text}
    </div>
  );
};

const Progress: React.FC<{ chapters: { start: number; end: number }[]; accent: string; platform: string }> = ({ chapters, accent, platform }) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [INTRO, INTRO + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: PANEL_X, top: 590, width: 520, opacity: show }}>
      <div style={{ display: "flex", gap: 8 }}>
        {chapters.map((c) => {
          const fill = interpolate(frame, [c.start, c.end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={c.start} style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.16)", overflow: "hidden" }}>
              <div style={{ width: `${fill * 100}%`, height: "100%", background: accent }} />
            </div>
          );
        })}
      </div>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 16, marginTop: 16, letterSpacing: 0.3 }}>{platform}</div>
    </div>
  );
};

const Outro: React.FC<{ title: string; accent: string; background: string; links: (string | undefined)[] }> = ({ title, accent, background, links }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background, color: "white", alignItems: "center", justifyContent: "center", gap: 24, opacity: fade }}>
      <div style={{ width: 64, height: 4, background: accent }} />
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>{title}</div>
      <div style={{ fontSize: 27, textAlign: "center", lineHeight: 1.6, color: "rgba(255,255,255,.85)" }}>
        {links.filter(Boolean).map((l) => <div key={l}>{l!.replace(/^https?:\/\//, "")}</div>)}
      </div>
    </AbsoluteFill>
  );
};
