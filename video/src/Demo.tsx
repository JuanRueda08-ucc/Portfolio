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
import { FPS, INTRO, segmentFrames, type DemoProps, type Segment } from "./apps";

// The recording is 1440×900; on the 1280×800 canvas it sits in a browser window.
const SRC = { w: 1440, h: 900 };
const CLIP = { w: 1088, h: 680 };
const BAR = 30;
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export const Demo: React.FC<DemoProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // The window rises in after the title card.
  const rise = spring({ frame: frame - INTRO + 10, fps, config: { damping: 18, mass: 0.9 } });
  const winTop = (height - CLIP.h - BAR) / 2;
  const titleOut = interpolate(frame, [INTRO - 12, INTRO + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  let at = INTRO;
  const parts = p.segments.map((s) => {
    const start = at;
    at += segmentFrames(s);
    return { s, start };
  });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 20% 110%, ${p.bg[1]}, ${p.bg[0]} 70%)`, fontFamily: FONT }}>
      {/* Soft grid, like the portfolio covers */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Title card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: titleOut }}>
        <div style={{ color: "#fff", fontSize: 76, fontWeight: 700, letterSpacing: -2, opacity: interpolate(frame, [0, 10], [0, 1]) }}>
          {p.title}
        </div>
        <div style={{ color: "rgba(255,255,255,.7)", fontSize: 24, marginTop: 10, opacity: interpolate(frame, [6, 16], [0, 1], { extrapolateRight: "clamp" }) }}>
          {p.tagline}
        </div>
      </AbsoluteFill>

      {/* Browser window */}
      <div
        style={{
          position: "absolute",
          left: (width - CLIP.w) / 2,
          top: winTop + (1 - rise) * 120,
          opacity: rise,
          width: CLIP.w,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 40px 90px -20px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.08)",
          background: "#111",
        }}
      >
        <div style={{ height: BAR, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", background: "#1c1c1f" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
          ))}
          <span
            style={{
              margin: "0 auto",
              padding: "3px 14px",
              borderRadius: 7,
              background: "#2a2a2e",
              color: "rgba(255,255,255,.6)",
              fontSize: 12,
              transform: "translateX(-24px)",
            }}
          >
            {p.url}
          </span>
        </div>
        <div style={{ position: "relative", width: CLIP.w, height: CLIP.h, overflow: "hidden" }}>
          {parts.map(({ s, start }) => (
            <Sequence key={s.from} from={start} durationInFrames={segmentFrames(s)} layout="none">
              <Clip clip={p.clip} s={s} />
            </Sequence>
          ))}
        </div>
      </div>

      {/* Captions */}
      {parts.map(({ s, start }) =>
        s.caption ? (
          <Sequence key={"c" + s.from} from={start} durationInFrames={segmentFrames(s)} layout="none">
            <Caption text={s.caption} accent={p.accent} pos={s.captionTop ? { top: winTop + BAR + 22 } : { bottom: height - (winTop + BAR + CLIP.h) + 22 }} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/** One stretch of the recording, at its speed, with an optional eased zoom. */
const Clip: React.FC<{ clip: string; s: Segment }> = ({ clip, s }) => {
  const frame = useCurrentFrame();
  const len = segmentFrames(s);
  const k = s.zoom
    ? interpolate(frame, [0, 24, len - 18, len], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 0;
  const scale = 1 + ((s.zoom?.scale ?? 1) - 1) * k;
  // Keep the zoom point where it is on screen, clamped so no edge shows.
  const ox = ((s.zoom?.x ?? SRC.w / 2) / SRC.w) * 100;
  const oy = ((s.zoom?.y ?? SRC.h / 2) / SRC.h) * 100;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: `${ox}% ${oy}%` }}>
      <OffthreadVideo
        src={staticFile(clip)}
        trimBefore={Math.round(s.from * FPS)}
        playbackRate={s.rate}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

const Caption: React.FC<{ text: string; accent: string; pos: { top?: number; bottom?: number } }> = ({ text, accent, pos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - 4, fps, config: { damping: 20 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...pos, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(12,12,14,.78)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: -0.3,
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          opacity: inn,
          transform: `translateY(${(1 - inn) * 14}px)`,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 5, background: accent }} />
        {text}
      </div>
    </div>
  );
};
