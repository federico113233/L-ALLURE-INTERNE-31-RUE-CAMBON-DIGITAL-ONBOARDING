"use client";

// Procedural, stylised models of the Maison's icons — built in code so the
// world has one coherent art direction and no third-party assets.
import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { n5Label, quiltTextures } from "./textures";

const GOLD = "#C5A059";

export function GoldMaterial() {
  return <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} envMapIntensity={1.4} />;
}

/* ─────────────────────────────── N°5 ─────────────────────────────── */
export function Bottle() {
  const label = useMemo(() => n5Label(), []);
  return (
    <group>
      {/* glass body — clear, so the golden juice reads through it */}
      <RoundedBox args={[1.05, 1.25, 0.5]} radius={0.05} smoothness={4} position={[0, -0.05, 0]} renderOrder={2}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.28}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={2.4}
          depthWrite={false}
        />
      </RoundedBox>
      {/* the juice */}
      <RoundedBox args={[0.9, 1.0, 0.36]} radius={0.03} position={[0, -0.14, 0]}>
        <meshStandardMaterial color="#e2b660" roughness={0.2} metalness={0.05} emissive="#8a5f1c" emissiveIntensity={0.35} />
      </RoundedBox>
      {/* label */}
      <mesh position={[0, 0.02, 0.252]}>
        <planeGeometry args={[0.46, 0.54]} />
        <meshStandardMaterial map={label} roughness={0.6} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.12, 0.13, 0.08, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.3} roughness={0.05} ior={1.5} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.02, 32]} />
        <GoldMaterial />
      </mesh>
      {/* octagonal stopper — Place Vendôme */}
      <mesh position={[0, 0.83, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.24, 8, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.6}
          roughness={0.02}
          ior={1.55}
          clearcoat={1}
          flatShading
          envMapIntensity={1.8}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────── 2.55 ─────────────────────────────── */
function chainCurve(side: 1 | -1) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.74 * side, 0.5, 0),
    new THREE.Vector3(0.86 * side, 1.0, 0),
    new THREE.Vector3(0.55 * side, 1.55, 0),
    new THREE.Vector3(0, 1.72, 0),
  ]);
}

function Chain() {
  const links = useMemo(() => {
    const out: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];
    for (const side of [1, -1] as const) {
      const curve = chainCurve(side);
      const n = 26;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const pos = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        if (i % 2) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
        out.push({ pos, quat: q });
      }
    }
    return out;
  }, []);
  const leather = useMemo(() => [chainCurve(1), chainCurve(-1)], []);
  return (
    <group>
      {links.map((l, i) => (
        <mesh key={i} position={l.pos} quaternion={l.quat}>
          <torusGeometry args={[0.034, 0.009, 8, 18]} />
          <GoldMaterial />
        </mesh>
      ))}
      {leather.map((c, i) => (
        <mesh key={`l${i}`}>
          <tubeGeometry args={[c, 60, 0.011, 8, false]} />
          <meshStandardMaterial color="#050505" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export function Bag({ open }: { open: boolean }) {
  const { map, bump } = useMemo(() => quiltTextures(), []);
  const flap = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (flap.current) easing.damp(flap.current.rotation, "x", open ? -1.95 : 0, 0.45, dt);
  });
  const leather = (
    <meshStandardMaterial color="#ffffff" map={map} bumpMap={bump} bumpScale={2.2} roughness={0.42} metalness={0.05} />
  );
  return (
    <group position={[0, -0.55, 0]}>
      {/* body */}
      <RoundedBox args={[1.6, 1.0, 0.44]} radius={0.06} smoothness={4}>
        {leather}
      </RoundedBox>
      {/* burgundy interior, visible when open */}
      <mesh position={[0, 0.505, 0]}>
        <boxGeometry args={[1.48, 0.01, 0.36]} />
        <meshStandardMaterial color="#6b1420" roughness={0.6} />
      </mesh>
      {/* flap, hinged at the back top edge */}
      <group ref={flap} position={[0, 0.52, -0.22]}>
        <RoundedBox args={[1.62, 0.04, 0.46]} radius={0.015} position={[0, 0.02, 0.23]}>
          {leather}
        </RoundedBox>
        <mesh position={[0, -0.002, 0.23]}>
          <boxGeometry args={[1.56, 0.005, 0.42]} />
          <meshStandardMaterial color="#7a1624" roughness={0.6} />
        </mesh>
        <RoundedBox args={[1.62, 0.62, 0.04]} radius={0.015} position={[0, -0.29, 0.46]}>
          {leather}
        </RoundedBox>
        <mesh position={[0, -0.29, 0.437]}>
          <boxGeometry args={[1.56, 0.58, 0.005]} />
          <meshStandardMaterial color="#7a1624" roughness={0.6} />
        </mesh>
        {/* Mademoiselle lock */}
        <RoundedBox args={[0.24, 0.14, 0.035]} radius={0.012} position={[0, -0.53, 0.49]}>
          <GoldMaterial />
        </RoundedBox>
        <mesh position={[0, -0.53, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 24]} />
          <GoldMaterial />
        </mesh>
      </group>
      <Chain />
    </group>
  );
}

/* ─────────────────────────────── Camellia ─────────────────────────────── */
// One cupped petal: a disc bent into a shallow bowl, ivory at the heart,
// pure white at the rim (vertex colours give depth without textures).
function usePetalGeometry() {
  return useMemo(() => {
    const g = new THREE.CircleGeometry(1, 40, 0, Math.PI * 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const heart = new THREE.Color("#c9bb9f");
    const rim = new THREE.Color("#ffffff");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // petal outline: wider at the top, narrow at the base
      const px = x * (0.78 + 0.22 * y);
      const r = Math.min(1, Math.hypot(x, y));
      const z = 0.32 * (px * px) + 0.12 * (y + 1) * (y + 1) * 0.5 - 0.08 * Math.sin(r * Math.PI);
      pos.setXYZ(i, px, y + 1, z);
      const c = heart.clone().lerp(rim, Math.min(1, Math.pow((y + 1) / 1.6, 0.8)));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

export function Camellia() {
  const petal = usePetalGeometry();
  const petals = useMemo(() => {
    const out: { rotY: number; tilt: number; s: number; y: number }[] = [];
    const rings = [
      { n: 8, tilt: 1.2, s: 0.5, y: 0, off: 0 },
      { n: 7, tilt: 0.95, s: 0.42, y: 0.04, off: 0.45 },
      { n: 6, tilt: 0.7, s: 0.33, y: 0.08, off: 0.2 },
      { n: 5, tilt: 0.42, s: 0.24, y: 0.12, off: 0.7 },
      { n: 4, tilt: 0.2, s: 0.15, y: 0.15, off: 0.1 },
    ];
    rings.forEach((ring) => {
      for (let i = 0; i < ring.n; i++) {
        out.push({ rotY: (i / ring.n) * Math.PI * 2 + ring.off, tilt: ring.tilt, s: ring.s, y: ring.y });
      }
    });
    return out;
  }, []);
  return (
    <group rotation={[1.15, 0, 0]} position={[0, 0.1, 0]}>
      {petals.map((p, i) => (
        <group key={i} rotation={[0, p.rotY, 0]} position={[0, p.y, 0]}>
          <mesh geometry={petal} rotation={[p.tilt, 0, 0]} scale={p.s}>
            <meshPhysicalMaterial
              vertexColors
              side={THREE.DoubleSide}
              roughness={0.55}
              sheen={0.6}
              sheenColor="#ffffff"
              sheenRoughness={0.5}
              envMapIntensity={0.55}
            />
            <Edges threshold={40} color="#b9ab92" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <GoldMaterial />
      </mesh>
      {/* black lacquered leaves */}
      {[-0.7, 2.6].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.62, -0.06, Math.sin(a) * 0.62]} rotation={[0, -a, 0.08]} scale={[0.28, 0.016, 0.11]}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshPhysicalMaterial color="#050505" roughness={0.12} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────── Mirrored staircase ─────────────────────────────── */
export function Stair() {
  const steps = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => ({
        a: i * 0.42,
        y: -0.85 + i * 0.14,
      })),
    [],
  );
  return (
    <group scale={0.95}>
      {steps.map((s, i) => (
        <group key={i} rotation={[0, s.a, 0]} position={[0, s.y, 0]}>
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.85, 0.06, 0.34]} />
            <meshStandardMaterial color="#f2f2f2" metalness={1} roughness={0.04} envMapIntensity={1.6} />
          </mesh>
          <mesh position={[0.55, -0.032, 0]}>
            <boxGeometry args={[0.86, 0.006, 0.35]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.95, 24]} />
        <meshStandardMaterial color="#000000" roughness={0.3} />
      </mesh>
      {/* faceted mirror wall */}
      {[-0.9, -0.3, 0.3, 0.9].map((a, i) => (
        <group key={i} rotation={[0, Math.PI + a, 0]}>
          <mesh position={[0, 0.05, -1.25]}>
            <boxGeometry args={[0.62, 2.1, 0.02]} />
            <meshStandardMaterial color="#e9e9e9" metalness={1} roughness={0.03} envMapIntensity={1.4} />
          </mesh>
          <mesh position={[0.31, 0.05, -1.24]}>
            <boxGeometry args={[0.012, 2.1, 0.03]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────── Sealed letter ─────────────────────────────── */
function CC({ r = 0.075, tube = 0.013 }: { r?: number; tube?: number }) {
  const arc = Math.PI * 1.55;
  return (
    <group>
      <mesh position={[-r * 0.55, 0, 0]} rotation={[0, 0, Math.PI - arc / 2 + Math.PI]}>
        <torusGeometry args={[r, tube, 12, 48, arc]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[r * 0.55, 0, 0.004]} rotation={[0, 0, -arc / 2 + Math.PI]}>
        <torusGeometry args={[r, tube, 12, 48, arc]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

export function Letter() {
  const flapShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.75, 0.47);
    s.lineTo(0.75, 0.47);
    s.lineTo(0, -0.08);
    s.closePath();
    return s;
  }, []);
  return (
    <group rotation={[-0.25, 0.25, 0.08]}>
      <RoundedBox args={[1.5, 0.95, 0.03]} radius={0.01}>
        <meshStandardMaterial color="#F5F2EB" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0, 0.017]}>
        <shapeGeometry args={[flapShape]} />
        <meshStandardMaterial color="#efe9de" roughness={0.9} />
      </mesh>
      {/* edge of the flap */}
      <lineSegments position={[0, 0, 0.019]}>
        <edgesGeometry args={[new THREE.ShapeGeometry(flapShape)]} />
        <lineBasicMaterial color="#d9cfbd" />
      </lineSegments>
      {/* black wax seal with gold CC */}
      <group position={[0, -0.08, 0.03]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.2, 0.04, 40]} />
          <meshPhysicalMaterial color="#080808" roughness={0.25} clearcoat={1} />
        </mesh>
        <group position={[0, 0, 0.03]}>
          <CC />
        </group>
      </group>
      {/* fountain pen */}
      <group position={[0.15, -0.62, 0.12]} rotation={[0, 0, 0.32]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 1.2, 24]} />
          <meshPhysicalMaterial color="#050505" roughness={0.12} clearcoat={1} />
        </mesh>
        <mesh position={[0.64, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.03, 0.12, 24]} />
          <GoldMaterial />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.03, 24]} />
          <GoldMaterial />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────────── Pearls ─────────────────────────────── */
export function Pearls({ locked }: { locked: boolean }) {
  const strands = useMemo(() => {
    const out: { pos: THREE.Vector3; r: number }[] = [];
    [0.55, 0.75, 0.95].forEach((depth, si) => {
      const n = 34 + si * 8;
      const r = 0.055 - si * 0.004;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        // a draped loop: wide at the top, deeper at the bottom
        const x = Math.sin(t) * (0.62 + si * 0.08);
        const y = Math.cos(t) * 0.35 - (Math.cos(t) < 0 ? depth * 0.55 * -Math.cos(t) : 0);
        const z = Math.cos(t) * 0.18;
        out.push({ pos: new THREE.Vector3(x, y, z), r });
      }
    });
    return out;
  }, []);
  return (
    <group>
      {strands.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.r, 20, 14]} />
          <meshPhysicalMaterial
            color={locked ? "#d9d6d0" : "#f7f2ea"}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
            sheen={1}
            sheenColor="#ffffff"
            iridescence={locked ? 0 : 0.35}
            iridescenceIOR={1.3}
            transparent={locked}
            opacity={locked ? 0.45 : 1}
          />
        </mesh>
      ))}
      <group position={[0, 0.38, 0.2]}>
        <CC r={0.06} tube={0.011} />
      </group>
    </group>
  );
}
