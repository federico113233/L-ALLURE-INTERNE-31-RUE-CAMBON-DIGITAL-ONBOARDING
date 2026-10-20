"use client";

import {
  ContactShadows,
  Environment,
  Float,
  Html,
  Lightformer,
  PresentationControls,
  Sparkles,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { CHAPTERS, ORAL_UNLOCK, type Chapter, type ChapterId, type Hotspot } from "@/lib/journey/content";
import { chaptersDone, useJourney } from "@/lib/journey/store";
import type { DeptId } from "@/lib/departments";
import { Bag, Bottle, Camellia, Letter, Pearls, Stair } from "./objects";

// How large each icon appears once you step inside its chapter.
const ROOM_SCALE: Record<Chapter["object"], number> = {
  bottle: 1.15,
  bag: 0.82,
  camellia: 0.85,
  stair: 0.9,
  letter: 1.05,
  pearls: 1.1,
};

export interface WorldHandlers {
  onOpen: (id: ChapterId) => void;
  onHover: (id: ChapterId | null) => void;
  onHotspot: (h: Hotspot) => void;
}

/* ───────────── Camera direction ───────────── */
function CameraRig() {
  const { camera, size } = useThree();
  const phase = useJourney((s) => s.phase);
  const room = useJourney((s) => s.room);
  const look = useRef(new THREE.Vector3(0, 0.2, 0));
  const pos = useRef(new THREE.Vector3());
  const tgt = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const mobile = size.width < 900;
    const px = state.pointer.x;
    const py = state.pointer.y;
    if (phase === "room" && room) {
      const c = CHAPTERS.find((x) => x.id === room)!;
      const [x, y, z] = c.position;
      const dist = mobile ? 5.2 : 4.3;
      const shiftX = mobile ? 0 : 0.85;
      const shiftY = mobile ? -0.75 : 0.05;
      pos.current.set(x + shiftX + px * 0.08, y + 0.3 + shiftY + py * 0.05, z + dist);
      tgt.current.set(x + shiftX, y + shiftY, z);
    } else if (phase === "prologue") {
      pos.current.set(0, 4.5, 16);
      tgt.current.set(0, 0.6, 0);
    } else {
      // fit the whole arc of objects to the viewport width
      const aspect = size.width / size.height;
      const dist = Math.max(10.5, 6.1 / (Math.tan((35 / 2) * (Math.PI / 180)) * aspect) + 1);
      pos.current.set(px * 0.6, 0.8 + py * 0.3, dist);
      tgt.current.set(0, -0.25, 0);
    }
    easing.damp3(camera.position, pos.current, phase === "room" ? 0.9 : 1.1, dt);
    easing.damp3(look.current, tgt.current, phase === "room" ? 0.8 : 1.0, dt);
    camera.lookAt(look.current);
  });
  return null;
}

/* ───────────── Hotspot ───────────── */
function HotspotDot({
  h,
  found,
  active,
  visible,
  onClick,
}: {
  h: Hotspot;
  found: boolean;
  active: boolean;
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <Html position={h.position} center zIndexRange={[30, 0]} style={{ display: visible ? "block" : "none" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={h.title}
        className="group relative flex h-9 w-9 items-center justify-center"
      >
        {!found && <span className="absolute h-9 w-9 animate-ping rounded-full border border-or opacity-60" />}
        <span
          className={`relative h-4 w-4 rounded-full border-2 transition-all duration-500 ${
            active ? "scale-125 border-blanc bg-noir" : found ? "border-or bg-blanc" : "border-blanc bg-or shadow-[0_0_18px_4px_rgba(197,160,89,0.75)]"
          }`}
        />
        <span className="label pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blanc/95 px-3 py-1.5 text-[0.6rem] text-noir opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
          {h.title.split(" · ")[0]}
        </span>
      </button>
    </Html>
  );
}

/* ───────────── An object on its pedestal of air ───────────── */
function Slot({
  chapter,
  handlers,
  dept,
  unlockAll,
}: {
  chapter: Chapter;
  handlers: WorldHandlers;
  dept: DeptId | null;
  unlockAll: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const frame = useRef(0);
  const v = useRef(new THREE.Vector3());

  const phase = useJourney((s) => s.phase);
  const room = useJourney((s) => s.room);
  const hovered = useJourney((s) => s.hovered);
  const step = useJourney((s) => s.step);
  const bagOpen = useJourney((s) => s.bagOpen);
  const found = useJourney((s) => s.found);
  const spot = useJourney((s) => s.spot);
  const done = useJourney((s) => s.done);
  const setScreen = useJourney((s) => s.setScreen);

  const isRoom = phase === "room" && room === chapter.id;
  const visible = phase === "hub" || phase === "finale" || isRoom;
  const isHover = phase === "hub" && hovered === chapter.id;
  const locked = chapter.id === "oral" && !unlockAll && chaptersDone(done) < ORAL_UNLOCK;
  void dept;

  useFrame((state, dt) => {
    if (!group.current) return;
    const target = !visible ? 0.0001 : isRoom ? ROOM_SCALE[chapter.object] : isHover ? 1.14 : 1;
    easing.damp3(group.current.scale, [target, target, target], visible ? 0.35 : 0.25, dt);
    if (spin.current) {
      if (isRoom) easing.dampE(spin.current.rotation, [0, 0, 0], 0.6, dt);
      else spin.current.rotation.y += dt * (isHover ? 0.6 : 0.18);
    }
    // project to screen for Mademoiselle (every few frames)
    if (++frame.current % 4 === 0) {
      // anchor = just below the object, where its caption sits
      group.current.getWorldPosition(v.current);
      v.current.y -= 1.3;
      v.current.project(camera);
      setScreen(chapter.id, {
        x: ((v.current.x + 1) / 2) * size.width,
        y: ((1 - v.current.y) / 2) * size.height,
      });
    }
    void state;
  });

  // Html overlays stay mounted (toggled by visibility) — mounting/unmounting
  // drei <Html> roots during a render races React.
  const current = isRoom ? chapter.steps[step] : undefined;
  const exploring = current?.kind === "explore";
  const hotspots = chapter.steps.flatMap((s) => (s.kind === "explore" ? s.hotspots : []));

  const model = (() => {
    switch (chapter.object) {
      case "bottle":
        return <Bottle />;
      case "bag":
        return <Bag open={bagOpen && isRoom} />;
      case "camellia":
        return <Camellia />;
      case "stair":
        return <Stair />;
      case "letter":
        return <Letter />;
      case "pearls":
        return <Pearls locked={locked} />;
    }
  })();

  return (
    <group position={chapter.position}>
      <group ref={group} scale={0.0001}>
        <PresentationControls
          enabled={isRoom}
          global={false}
          cursor={isRoom}
          snap
          speed={1.4}
          polar={[-0.25, 0.25]}
          azimuth={[-0.7, 0.7]}
        >
          <Float speed={isRoom ? 0.8 : 1.4} rotationIntensity={isRoom ? 0.05 : 0.25} floatIntensity={isRoom ? 0.15 : 0.6}>
            <group
              ref={spin}
              onPointerOver={(e) => {
                if (phase !== "hub") return;
                e.stopPropagation();
                handlers.onHover(chapter.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                if (phase !== "hub") return;
                handlers.onHover(null);
                document.body.style.cursor = "";
              }}
              onClick={(e) => {
                if (phase !== "hub") return;
                e.stopPropagation();
                document.body.style.cursor = "";
                handlers.onOpen(chapter.id);
              }}
            >
              {model}
              {/* invisible hit area so thin objects are easy to click */}
              <mesh visible={false}>
                <sphereGeometry args={[1.1, 12, 12]} />
              </mesh>
              {hotspots.map((h) => (
                <HotspotDot
                  key={h.id}
                  h={h}
                  visible={exploring}
                  found={Boolean(found[`${chapter.id}:${h.id}`])}
                  active={spot === h.id}
                  onClick={() => handlers.onHotspot(h)}
                />
              ))}
            </group>
          </Float>
        </PresentationControls>

      </group>
    </group>
  );
}

function Scene({ handlers, dept, unlockAll }: { handlers: WorldHandlers; dept: DeptId | null; unlockAll: boolean }) {
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <fog attach="fog" args={["#ffffff", 13, 30]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#f5f2eb" />
      <Environment resolution={256}>
        <color attach="background" args={["#e9e9e9"]} />
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="rect" intensity={4} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.5, 1]} />
          <Lightformer form="rect" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
          <Lightformer form="ring" color="#C5A059" intensity={1.2} position={[-3, 2, 4]} scale={2} />
          <Lightformer form="rect" color="#000000" intensity={1} position={[0, -4, 2]} scale={[20, 2, 1]} />
        </group>
      </Environment>
      <CameraRig />
      {CHAPTERS.map((c) => (
        <Slot key={c.id} chapter={c} handlers={handlers} dept={dept} unlockAll={unlockAll} />
      ))}
      <Sparkles count={70} scale={[16, 6, 10]} size={2.2} speed={0.18} opacity={0.55} color="#C5A059" />
      <ContactShadows position={[0, -1.75, 0]} opacity={0.22} scale={22} blur={2.8} far={4} resolution={512} color="#000000" />
    </>
  );
}

export default function World({
  handlers,
  dept,
  unlockAll,
}: {
  handlers: WorldHandlers;
  dept: DeptId | null;
  unlockAll: boolean;
}) {
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 4.5, 16], fov: 35, near: 0.1, far: 80 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <Suspense fallback={null}>
        <Scene handlers={handlers} dept={dept} unlockAll={unlockAll} />
      </Suspense>
    </Canvas>
  );
}
