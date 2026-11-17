"use client";

import {
  Center,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  Text3D,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { createGridMaterial } from "./gridMaterial";

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

function GridBackground({ state }: { state: RefObject<HeroState> }) {
  const material = useMemo(() => createGridMaterial(), []);
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, size, viewport } = useThree();
  // Plane exactly covering the viewport at its depth.
  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, BG_DEPTH));
  const smooth = useRef({ x: 0.5, y: 0.3, hover: 0 });

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const s = state.current;
    // Uniforms are mutated through the mesh ref (React Compiler forbids mutating hook values).
    const u = (mesh.current.material as THREE.ShaderMaterial).uniforms;
    smooth.current.x = damp(smooth.current.x, s.mouse.x, 6, dt);
    smooth.current.y = damp(smooth.current.y, s.mouse.y, 6, dt);
    smooth.current.hover = damp(smooth.current.hover, s.hover, 4, dt);
    u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);
    u.uMouse.value.set(smooth.current.x, smooth.current.y);
    u.uHover.value = smooth.current.hover;
    u.uScroll.value = s.scroll;
    u.uIntro.value = s.intro;
  });

  return (
    <mesh ref={mesh} position={[0, 0, BG_DEPTH]} scale={[vp.width * 1.15, vp.height * 1.15, 1]} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function GlassWord({ state, text, quality }: { state: RefObject<HeroState>; text: string; quality: "high" | "low" }) {
  const group = useRef<THREE.Group>(null);
  // Width of the word at scale 1, measured once the geometry is centered.
  const wordWidth = useRef(0);

  useFrame(({ clock, viewport }, dt) => {
    const g = group.current;
    if (!g || !wordWidth.current) return;
    const s = state.current;
    const t = clock.elapsedTime;
    const narrow = viewport.aspect < 1;
    // Tilt toward the pointer, bob gently, and sink back on scroll.
    const tx = (s.mouse.x - 0.5) * 2;
    const ty = (s.mouse.y - 0.5) * 2;
    g.rotation.y = damp(g.rotation.y, tx * 0.35 * s.hover, 3, dt);
    g.rotation.x = damp(g.rotation.x, -ty * 0.25 * s.hover + Math.sin(t * 0.6) * 0.04, 3, dt);
    // Sit above center so the headline below stays readable.
    g.position.y = viewport.height * (narrow ? 0.12 : 0.06) + Math.sin(t * 0.8) * 0.06 + s.scroll * 1.6;
    g.position.z = -s.scroll * 2.5;
    // Fit the word to ~58% of the viewport width (84% on portrait screens).
    const fit = (viewport.width * (narrow ? 0.84 : 0.58)) / wordWidth.current;
    g.scale.setScalar(damp(g.scale.x, fit * (0.6 + 0.4 * s.intro), 5, dt));
  });

  const hi = quality === "high";

  return (
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
        >
          {text}
          <MeshTransmissionMaterial
            samples={hi ? 6 : 3}
            resolution={hi ? 768 : 256}
            transmission={1}
            roughness={0.06}
            thickness={0.7}
            ior={1.45}
            chromaticAberration={0.08}
            anisotropicBlur={0.15}
            distortion={0.15}
            distortionScale={0.4}
            temporalDistortion={0.08}
            color="#efe6ff"
            attenuationColor="#c06dff"
            attenuationDistance={2.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
            backside={hi}
            backsideThickness={0.4}
          />
        </Text3D>
      </Center>
    </group>
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
      {/* Drop resolution (then quality) on devices that can't keep up. */}
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
      <GridBackground state={state} />
      <GlassWord state={state} text={text} quality={quality} />
      {/* Procedural studio lighting (no HDR download). */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[10, 1, 1]} />
        <Lightformer form="rect" intensity={2} color="#c06dff" position={[-5, -1, 1]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, 1, 1]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 0, 6]} scale={4} />
      </Environment>
    </Canvas>
  );
}
