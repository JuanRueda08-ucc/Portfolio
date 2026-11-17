"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import LineDrawing from "@/components/ui/LineDrawing";

const MOTION = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type Props = {
  src?: string;
  fallbackText?: string;
  label: string;
  className?: string;
};

/**
 * Phones: the same line drawing as on desktop, but there is no cursor to draw it and
 * the idle self-drawing is slow, so it waits for a "Generate" press and then draws the
 * whole logo in ~3 s. The pill and the % counter are the Generate component's
 * (`.gen-go` / `.gen-pct` in globals.css); once drawn the button is gone for good, so
 * nothing covers the logo (owner's request).
 */
export default function LogoReveal({
  src,
  fallbackText,
  label,
  className = "",
}: Props) {
  const reduce = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION).matches,
    () => false,
  );
  const [signal, setSignal] = useState(0);
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((p: number) => setProgress(p), []);

  const state = reduce || progress >= 1 ? "done" : signal ? "drawing" : "idle";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`gen ${className}`} data-loading={state === "drawing"}>
        <LineDrawing
          src={src}
          trace="light"
          fallbackText={fallbackText}
          label={label}
          autoDraw={false}
          drawSignal={signal}
          onProgress={onProgress}
          className="size-full"
        />
        {state === "idle" && (
          <button
            type="button"
            className="gen-go"
            onClick={() => setSignal((s) => s + 1)}
          >
            <span>Generate</span>
          </button>
        )}
        {state !== "done" && (
          <span className="gen-pct" role="status" aria-live="off">
            {Math.min(99, Math.floor(progress * 100))}%
          </span>
        )}
      </div>
      {/* The hint goes with the button; kept as an empty line so nothing below jumps. */}
      <p className="label min-h-[1lh] text-stone">
        {state === "idle" ? "( Tap Generate to draw my logo )" : ""}
      </p>
    </div>
  );
}
