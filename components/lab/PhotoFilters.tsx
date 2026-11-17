"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cssColor, subscribeTheme } from "@/lib/theme";

type Filter = "original" | "pixelate" | "duotone" | "dither" | "grain" | "ascii";

const FILTERS: { id: Filter; label: string; amount?: { min: number; max: number; def: number; name: string } }[] = [
  { id: "original", label: "Original" },
  { id: "pixelate", label: "Pixelate", amount: { min: 4, max: 40, def: 12, name: "Block" } },
  { id: "duotone", label: "Duotone", amount: { min: 0, max: 100, def: 60, name: "Contrast" } },
  { id: "dither", label: "Dither", amount: { min: 1, max: 6, def: 2, name: "Dot" } },
  { id: "grain", label: "Grain", amount: { min: 0, max: 100, def: 45, name: "Amount" } },
  { id: "ascii", label: "ASCII", amount: { min: 6, max: 20, def: 10, name: "Char" } },
];

const MAX = 900; // working resolution (longest side)
const ASCII_RAMP = " .:-=+*#%@";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Generated sample picture (no external assets): soft blobs + the initials. */
function sampleImage(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 675;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 900, 675);
  bg.addColorStop(0, "#1d1035");
  bg.addColorStop(1, "#f2c38b");
  g.fillStyle = bg;
  g.fillRect(0, 0, 900, 675);
  for (const [x, y, r, col] of [
    [250, 300, 220, "#c06dff"],
    [620, 380, 260, "#ff8a5b"],
    [470, 160, 150, "#5eead4"],
  ] as const) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, "transparent");
    g.fillStyle = rg;
    g.fillRect(0, 0, 900, 675);
  }
  g.fillStyle = "#fff8ee";
  g.font = "italic 700 260px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("hola", 450, 360);
  return c;
}

/** Photo Filters: pixelate, duotone, dither, grain and ASCII — all processed locally. */
export default function PhotoFilters() {
  const out = useRef<HTMLCanvasElement>(null);
  // Starts with a generated sample so the app is never empty (windows only render client-side).
  const [source, setSource] = useState<(CanvasImageSource & { width: number; height: number }) | null>(() =>
    typeof document === "undefined" ? null : sampleImage(),
  );
  const [filter, setFilter] = useState<Filter>("duotone");
  const [amount, setAmount] = useState(60);
  const [themeTick, setThemeTick] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  const render = useCallback(() => {
    const cvs = out.current;
    if (!cvs || !source) return;
    const scale = Math.min(1, MAX / Math.max(source.width, source.height));
    const w = Math.round(source.width * scale);
    const h = Math.round(source.height * scale);
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext("2d", { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(source, 0, 0, w, h);

    const ink = hexToRgb(cssColor("--color-ink"));
    const accent = hexToRgb(cssColor("--color-violet-bright"));
    const mix = (t: number) => [0, 1, 2].map((i) => ink[i] + (accent[i] - ink[i]) * t);

    if (filter === "pixelate") {
      const bw = Math.max(1, Math.round(w / amount));
      const bh = Math.max(1, Math.round(h / amount));
      const tmp = document.createElement("canvas");
      tmp.width = bw;
      tmp.height = bh;
      tmp.getContext("2d")!.drawImage(cvs, 0, 0, bw, bh);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(tmp, 0, 0, w, h);
      return;
    }

    if (filter === "ascii") {
      const cell = amount;
      const data = ctx.getImageData(0, 0, w, h).data;
      ctx.fillStyle = `rgb(${ink.join(",")})`;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${cell}px ui-monospace, monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell * 0.6) {
          const i = (Math.floor(y + cell / 2) * w + Math.floor(x)) * 4;
          const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          const ch = ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, Math.floor(l * ASCII_RAMP.length))];
          if (ch === " ") continue;
          ctx.fillStyle = `rgb(${mix(0.35 + l * 0.65).join(",")})`;
          ctx.fillText(ch, x, y);
        }
      }
      return;
    }

    if (filter === "original") return;

    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      if (filter === "duotone") {
        const k = 1 + (amount / 100) * 1.5; // contrast
        l = Math.min(1, Math.max(0, (l - 0.5) * k + 0.5));
        const c = mix(l);
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
      } else if (filter === "dither") {
        const x = Math.floor((p % w) / amount);
        const y = Math.floor(Math.floor(p / w) / amount);
        const on = l > (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        const c = on ? accent : ink;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
      } else if (filter === "grain") {
        const n = (Math.random() - 0.5) * (amount / 100) * 120;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
      }
    }
    ctx.putImageData(img, 0, 0);
    // themeTick is read so a theme change re-renders with the new accent.
    void themeTick;
  }, [source, filter, amount, themeTick]);

  useEffect(() => {
    render();
  }, [render]);

  const load = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSource(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const pick = (f: Filter) => {
    setFilter(f);
    const def = FILTERS.find((x) => x.id === f)?.amount?.def;
    if (def !== undefined) setAmount(def);
  };

  const current = FILTERS.find((f) => f.id === filter)!;

  const download = () => {
    if (!out.current) return;
    const a = document.createElement("a");
    a.download = `photo-${filter}.png`;
    a.href = out.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="grid gap-4 bg-ink-2 p-4 md:grid-cols-[1.4fr_1fr]" data-lenis-prevent>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          load(e.dataTransfer.files?.[0]);
        }}
        className={`flex items-center justify-center overflow-hidden rounded-xl bg-ink ${dragging ? "ring-2 ring-violet-bright" : ""}`}
      >
        <canvas ref={out} aria-label={`Photo with ${current.label} filter`} role="img" className="max-h-[55vh] w-full object-contain" />
      </div>

      <div className="flex flex-col gap-4">
        <label className="btn-text cursor-pointer rounded-full bg-violet px-4 py-2 text-center text-on-accent">
          Upload photo
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => load(e.target.files?.[0])} />
        </label>
        <p className="text-xs text-stone">…or drop one on the preview. Photos never leave your browser.</p>

        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Filter">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => pick(f.id)}
              className={`btn-text rounded-full px-2 py-1.5 ${filter === f.id ? "bg-violet text-on-accent" : "bg-ink text-stone hover:text-cream"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {current.amount && (
          <label className="grid gap-1.5">
            <span className="flex justify-between">
              <span className="label text-stone">{current.amount.name}</span>
              <span className="font-mono text-xs">{amount}</span>
            </span>
            <input
              type="range"
              min={current.amount.min}
              max={current.amount.max}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-3 accent-violet"
            />
          </label>
        )}

        <div className="mt-auto flex gap-2">
          <button type="button" onClick={() => setSource(sampleImage())} className="btn-text rounded-full bg-ink px-3 py-2 text-stone hover:text-cream">
            Sample
          </button>
          <button type="button" onClick={download} className="btn-text rounded-full bg-violet-bright px-3 py-2 text-on-accent">
            PNG ↓
          </button>
        </div>
      </div>
    </div>
  );
}
