import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.displayName} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card generated at build time (dark, purple grid, big name). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f3eadf",
          backgroundColor: "#0b0a09",
          backgroundImage:
            "radial-gradient(ellipse at 50% 120%, #9b5de5 0%, #3b1a6e 35%, transparent 70%), linear-gradient(to right, rgba(155,93,229,.18) 2px, transparent 2px), linear-gradient(to bottom, rgba(155,93,229,.18) 2px, transparent 2px)",
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#c4a1ff", textTransform: "uppercase" }}>
          {profile.city} · Portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{profile.displayName}</div>
          <div style={{ fontSize: 44, marginTop: 16, color: "#c06dff" }}>{profile.role}</div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#a39a90" }}>{profile.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
