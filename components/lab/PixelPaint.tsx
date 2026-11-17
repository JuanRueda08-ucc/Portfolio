"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 32;
const PALETTE = ["#0b0a09", "#3b1a6e", "#9b5de5", "#c06dff", "#c4a1ff", "#f3eadf", "#a39a90", "#ff6b9a", "#ffd166", "#5eead4"];
type Tool = "pencil" | "eraser" | "fill";

/** A tiny pixel-art editor: pencil, eraser, bucket fill, mirror, undo and PNG export. */
export default function PixelPaint() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<(string | null)[]>(Array(SIZE * SIZE).fill(null));
  const undo = useRef<(string | null)[][]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(PALETTE[3]);
  const [tool, setTool] = useState<Tool>("pencil");
  const [mirror, setMirror] = useState(false);

  const render = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    pixels.current.forEach((c, i) => {
      if (!c) return;
      ctx.fillStyle = c;
      ctx.fillRect(i % SIZE, Math.floor(i / SIZE), 1, 1);
    });
  }, []);

  // Start with a small heart so the canvas isn't empty.
  useEffect(() => {
    const heart = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"];
    heart.forEach((row, y) =>
      [...row].forEach((b, x) => {
        if (b === "1") pixels.current[(y + 12) * SIZE + x + 12] = PALETTE[3];
      }),
    );
    render();
  }, [render]);

  const set = (x: number, y: number, value: string | null) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    pixels.current[y * SIZE + x] = value;
    if (mirror) pixels.current[y * SIZE + (SIZE - 1 - x)] = value;
  };

  const fill = (x: number, y: number, value: string) => {
    const target = pixels.current[y * SIZE + x];
    if (target === value) return;
    const stack = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cy < 0 || cx >= SIZE || cy >= SIZE || pixels.current[cy * SIZE + cx] !== target) continue;
      pixels.current[cy * SIZE + cx] = value;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  };

  const toCell = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return {
      x: Math.floor(((e.clientX - r.left) / r.width) * SIZE),
      y: Math.floor(((e.clientY - r.top) / r.height) * SIZE),
    };
  };

  // Bresenham line so fast strokes don't leave gaps.
  const line = (a: { x: number; y: number }, b: { x: number; y: number }, v: string | null) => {
    let { x, y } = a;
    const dx = Math.abs(b.x - x);
    const dy = -Math.abs(b.y - y);
    const sx = x < b.x ? 1 : -1;
    const sy = y < b.y ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      set(x, y, v);
      if (x === b.x && y === b.y) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const onDown = (e: React.PointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // keep drawing when leaving the canvas
    } catch {
      /* not capturable (e.g. synthetic pointer) — drawing still works */
    }
    undo.current.push([...pixels.current]);
    if (undo.current.length > 50) undo.current.shift();
    const c = toCell(e);
    if (tool === "fill") {
      fill(c.x, c.y, color);
      if (mirror) fill(SIZE - 1 - c.x, c.y, color);
    } else {
      set(c.x, c.y, tool === "eraser" ? null : color);
      last.current = c;
    }
    render();
  };

  const onMove = (e: React.PointerEvent) => {
    if (!last.current) return;
    const c = toCell(e);
    line(last.current, c, tool === "eraser" ? null : color);
    last.current = c;
    render();
  };

  const onUp = () => (last.current = null);

  const doUndo = () => {
    const prev = undo.current.pop();
    if (prev) {
      pixels.current = prev;
      render();
    }
  };

  const clear = () => {
    undo.current.push([...pixels.current]);
    pixels.current = Array(SIZE * SIZE).fill(null);
    render();
  };

  const download = () => {
    const out = document.createElement("canvas");
    out.width = out.height = SIZE * 16;
    const ctx = out.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0b0a09";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas.current!, 0, 0, out.width, out.height);
    const a = document.createElement("a");
    a.download = "pixel-art.png";
    a.href = out.toDataURL("image/png");
    a.click();
  };

  const toolBtn = (t: Tool, label: string) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      aria-pressed={tool === t}
      className={`btn-text rounded-full px-3 py-1.5 ${tool === t ? "bg-violet text-on-accent" : "bg-ink text-stone hover:text-cream"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full flex-col gap-3 bg-ink-2 p-4 md:flex-row" data-lenis-prevent>
      <canvas
        ref={canvas}
        width={SIZE}
        height={SIZE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-cursor="Draw"
        aria-label="Pixel art canvas"
        className="aspect-square w-full max-w-[min(100%,24rem)] touch-none self-center rounded-lg bg-ink [image-rendering:pixelated]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #1c1714 25%, transparent 25%, transparent 75%, #1c1714 75%), linear-gradient(45deg, #1c1714 25%, transparent 25%, transparent 75%, #1c1714 75%)",
          backgroundSize: "6.25% 6.25%",
          backgroundPosition: "0 0, 3.125% 3.125%",
        }}
      />
      <div className="flex flex-col gap-3 md:w-40">
        <div className="flex flex-wrap gap-1.5">
          {toolBtn("pencil", "Pen")}
          {toolBtn("eraser", "Erase")}
          {toolBtn("fill", "Fill")}
        </div>
        <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Color">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("pencil");
              }}
              className={`aspect-square rounded-md border ${color === c ? "border-cream ring-2 ring-violet-bright" : "border-ink-3"}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="label flex items-center gap-2 text-stone">
          <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} className="accent-violet" />
          Mirror
        </label>
        <div className="mt-auto flex flex-wrap gap-1.5">
          <button type="button" onClick={doUndo} className="btn-text rounded-full bg-ink px-3 py-1.5 text-stone hover:text-cream">
            Undo
          </button>
          <button type="button" onClick={clear} className="btn-text rounded-full bg-ink px-3 py-1.5 text-stone hover:text-cream">
            Clear
          </button>
          <button type="button" onClick={download} className="btn-text rounded-full bg-violet-bright px-3 py-1.5 text-on-accent">
            PNG ↓
          </button>
        </div>
      </div>
    </div>
  );
}
