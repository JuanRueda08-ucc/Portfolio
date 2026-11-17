"use client";

import { Center, PerformanceMonitor, Text3D } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { createGlassMaterial, createGridMaterial, createHeroUniforms } from "./gridMaterial";

/** Shared, mutable state written by the DOM (pointer, scroll, intro) and read every frame. */
export type HeroState = {
  /** Pointer in 0..1 (x right, y up), relative to the hero. */
  mouse: { x: number; y: number };
  /** 0 when the pointer is outside the hero, 1 inside. */
  hover: number;
  /** Scroll progress through the hero, 0..1. */
  scroll: number;
  /** Intro progress after the loader, 0..1. */
  intro: number;
};

const BG_DEPTH = -3;
const damp = THREE.MathUtils.damp;

function Scene({ state, text, quality }: { state: RefObject<HeroState>; text: string; quality: "high" | "low" }) {
  // One uniforms object drives both the grid and the glass (they render the same grid).
  const { grid, glass } = useMemo(() => {
    const uniforms = createHeroUniforms();
    return { grid: createGridMaterial(uniforms), glass: createGlassMaterial(uniforms) };
  }, []);
  useEffect(
    () => () => {
      grid.dispose();
      glass.dispose();
    },
    [grid, glass],
  );

  const bg = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const wordWidth = useRef(0); // width of the word at scale 1, measured by <Center>
  const smooth = useRef({ x: 0.5, y: 0.3, hover: 0 });
  const { camera, viewport } = useThree();
  // Background plane covering the viewport at its depth.
  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, BG_DEPTH));

  useFrame(({ clock, size, viewport: v, gl }, dt) => {
    const s = state.current;
    const m = smooth.current;
    m.x = damp(m.x, s.mouse.x, 6, dt);
    m.y = damp(m.y, s.mouse.y, 6, dt);
    m.hover = damp(m.hover, s.hover, 4, dt);

    // Uniforms are mutated through the mesh ref (React Compiler forbids mutating hook values).
    if (bg.current) {
      const u = (bg.current.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value += dt;
      u.uRes.value.set(size.width, size.height);
      u.uDpr.value = gl.getPixelRatio();
      u.uMouse.value.set(m.x, m.y);
      u.uHover.value = m.hover;
      u.uScroll.value = s.scroll;
      u.uIntro.value = s.intro;
    }

    const g = group.current;
    if (!g || !wordWidth.current) return;
    const t = clock.elapsedTime;
    const narrow = v.aspect < 1;
    // Tilt toward the pointer, bob gently, and sink back on scroll.
    g.rotation.y = damp(g.rotation.y, (s.mouse.x - 0.5) * 2 * 0.35 * s.hover, 3, dt);
    g.rotation.x = damp(g.rotation.x, -(s.mouse.y - 0.5) * 2 * 0.25 * s.hover + Math.sin(t * 0.6) * 0.04, 3, dt);
    // Sit above center so the headline below stays readable.
    g.position.y = v.height * (narrow ? 0.12 : 0.06) + Math.sin(t * 0.8) * 0.06 + s.scroll * 1.6;
    g.position.z = -s.scroll * 2.5;
    // Fit the word to ~58% of the viewport width (84% on portrait screens).
    const fit = (v.width * (narrow ? 0.84 : 0.58)) / wordWidth.current;
    g.scale.setScalar(damp(g.scale.x, fit * (0.6 + 0.4 * s.intro), 5, dt));
  });

  const hi = quality === "high";

  return (
    <>
      <mesh ref={bg} position={[0, 0, BG_DEPTH]} scale={[vp.width * 1.15, vp.height * 1.15, 1]} material={grid}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={group} scale={0.001}>
        <Center cacheKey={text} onCentered={({ width }) => (wordWidth.current = width)}>
          <Text3D
            font="/fonts/pacifico.typeface.json"
            size={1}
            height={0.35}
            // Segment counts drive triangulation cost on the main thread; these keep curves smooth.
            curveSegments={hi ? 14 : 8}
            bevelEnabled
            bevelSize={0.045}
            bevelThickness={0.12}
            bevelSegments={hi ? 6 : 3}
            material={glass}
          >
            {text}
          </Text3D>
        </Center>
      </group>
    </>
  );
}

type Props = {
  state: RefObject<HeroState>;
  text?: string;
  /** Pause rendering when the hero is off-screen. */
  active: boolean;
};

export default function HeroScene({ state, text = "hello", active }: Props) {
  const [quality, setQuality] = useState<"high" | "low">(() =>
    typeof window !== "undefined" && (window.innerWidth < 768 || navigator.hardwareConcurrency <= 4) ? "low" : "high",
  );
  const [dpr, setDpr] = useState(() => (quality === "high" ? 1.5 : 1));

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 0, 8], fov: 35 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#0b0a09")}
    >
      {/* Drop resolution (then geometry quality) on devices that can't keep up. */}
      <PerformanceMonitor
        onDecline={() => {
          setDpr((d) => Math.max(0.75, d - 0.25));
          if (dpr <= 1) setQuality("low");
        }}
        onIncline={() => setDpr((d) => Math.min(quality === "high" ? 1.75 : 1.25, d + 0.25))}
        flipflops={3}
        onFallback={() => {
          setDpr(0.75);
          setQuality("low");
        }}
      />
      <Scene state={state} text={text} quality={quality} />
    </Canvas>
  );
}
