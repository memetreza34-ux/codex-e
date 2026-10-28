import { useLayoutEffect, useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Audio } from "@remotion/media";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../fonts";

type V = [number, number, number];
const AMBER = "#ffbc65",
  IVORY = "#f3eee4",
  BLUE = "#78d8e5",
  TOP = 270,
  HEIGHT = 1300;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lin = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, CLAMP);
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...CLAMP, easing: Easing.bezier(0.4, 0, 0.2, 1) });
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 19.4) * 43758.5453;
  return x - Math.floor(x);
};
const pop = (f: number, start: number) =>
  spring({
    frame: f - start,
    fps: 30,
    config: { damping: 16, stiffness: 150, mass: 0.75 },
  });
const open = (f: number) => ease(f, [92, 130, 236, 269], [0, 1, 1, 0]);
const heat = (f: number) => lin(f, [270, 450, 480, 505], [0, 1, 1, 0]);
const cameraAt = (f: number): V => [
  ease(
    f,
    [0, 90, 240, 390, 480, 540, 720],
    [-0.7, 0.2, 0.65, -0.15, 0.35, -0.8, 0.5],
  ),
  0.55,
  ease(
    f,
    [0, 90, 240, 390, 480, 540, 720],
    [9.8, 9.2, 9.6, 8.8, 8.6, 10.0, 9.0],
  ),
];
const turn = (f: number): V => [
  0.05 * Math.sin(f / 95),
  0.1 * Math.sin(f / 80),
  -0.06 + 0.025 * Math.sin(f / 57),
];
function kernelGeo(phi = 0, length = Math.PI * 2, theta = 0.0, span = Math.PI) {
  const g = new THREE.SphereGeometry(1, 96, 64, phi, length, theta, span),
    a = g.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i),
      y = a.getY(i),
      z = a.getZ(i),
      grain = 0.008 * Math.sin(x * 31 + y * 17) * Math.sin(z * 41 - y * 9);
    a.setXYZ(
      i,
      x * (0.36 + 0.62 * Math.pow((y + 1) / 2, 0.65)) * (1 + grain),
      (y > 0.66 ? 0.72 + (y - 0.66) * 0.18 : y * 1.08) + 0.08,
      Math.sign(z) * Math.pow(Math.abs(z), 0.72) * 0.55 * (1 + grain),
    );
  }
  a.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}
function kernelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#f2d17b");
  gradient.addColorStop(0.45, "#e8b64a");
  gradient.addColorStop(1, "#b77927");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18000; i++) {
    ctx.fillStyle = i % 3 ? "#fff5cf0c" : "#6b3c180c";
    ctx.fillRect(
      hash(i) * 512,
      hash(i + 760) * 512,
      0.5 + hash(i + 38) * 1.6,
      0.7 + hash(i + 3) * 2.6,
    );
  }
  ctx.strokeStyle = "#814a180b";
  ctx.lineWidth = 0.7;
  for (let x = 0; x < 512; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 15, 140, x - 18, 380, x + 2, 512);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
function flakeGeometry() {
  const lobes = [
    [0, 0, 0, 0.64],
    [-0.51, 0.28, 0.18, 0.53],
    [0.42, 0.43, 0.15, 0.59],
    [0.07, -0.48, 0.26, 0.54],
    [-0.16, 0.29, -0.46, 0.48],
    [0.51, -0.27, -0.22, 0.43],
    [-0.39, -0.34, -0.28, 0.48],
    [0.1, 0.04, 0.57, 0.39],
  ];
  const field = (x: number, y: number, z: number) => {
    let d = 10;
    for (const [cx, cy, cz, r] of lobes) {
      const b = Math.hypot(x - cx, (y - cy) * 1.03, (z - cz) * 1.04) - r;
      const k = 0.15,
        h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - d)) / k));
      d = b * (1 - h) + d * h - k * h * (1 - h);
    }
    return (
      d +
      0.017 *
        Math.sin(x * 29 + y * 11) *
        Math.sin(y * 31 - z * 9) *
        Math.sin(z * 27 + x * 13) +
      0.004 * Math.sin(x * 83 + z * 47) * Math.cos(y * 97 - x * 17)
    );
  };
  const n = 54,
    size = 2.8,
    step = size / n,
    side = n + 1;
  const values = new Float32Array(side * side * side);
  const key = (x: number, y: number, z: number) => (z * side + y) * side + x;
  for (let z = 0; z <= n; z++)
    for (let y = 0; y <= n; y++)
      for (let x = 0; x <= n; x++)
        values[key(x, y, z)] = field(
          x * step - size / 2,
          y * step - size / 2,
          z * step - size / 2,
        );
  const offsets = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ];
  const tetra = [
    [0, 5, 1, 6],
    [0, 1, 2, 6],
    [0, 2, 3, 6],
    [0, 3, 7, 6],
    [0, 7, 4, 6],
    [0, 4, 5, 6],
  ];
  const pos: number[] = [],
    norm: number[] = [],
    colors: number[] = [];
  const normal = (p: THREE.Vector3) =>
    new THREE.Vector3(
      field(p.x + 0.006, p.y, p.z) - field(p.x - 0.006, p.y, p.z),
      field(p.x, p.y + 0.006, p.z) - field(p.x, p.y - 0.006, p.z),
      field(p.x, p.y, p.z + 0.006) - field(p.x, p.y, p.z - 0.006),
    ).normalize();
  const add = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    const center = a
      .clone()
      .add(b)
      .add(c)
      .multiplyScalar(1 / 3);
    if (b.clone().sub(a).cross(c.clone().sub(a)).dot(normal(center)) < 0)
      [b, c] = [c, b];
    for (const p of [a, b, c]) {
      pos.push(p.x, p.y, p.z);
      const v = normal(p);
      norm.push(v.x, v.y, v.z);
      const toast = Math.max(0, -p.y - 0.15) * Math.max(0, p.z) * 0.35;
      const col = new THREE.Color("#f8eedb").lerp(
        new THREE.Color("#c29959"),
        toast +
          0.025 * (1 + Math.sin(p.x * 17 + p.y * 21) * Math.sin(p.z * 13)),
      );
      colors.push(col.r, col.g, col.b);
    }
  };
  for (let z = 0; z < n; z++)
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const d = offsets.map((o) => values[key(x + o[0], y + o[1], z + o[2])]);
        if (d.every((v) => v >= 0) || d.every((v) => v < 0)) continue;
        const p = offsets.map(
          (o) =>
            new THREE.Vector3(
              (x + o[0]) * step - size / 2,
              (y + o[1]) * step - size / 2,
              (z + o[2]) * step - size / 2,
            ),
        );
        const edge = (i: number, j: number) =>
          p[i].clone().lerp(p[j], d[i] / (d[i] - d[j]));
        for (const t of tetra) {
          const inside = t.filter((i) => d[i] < 0),
            outside = t.filter((i) => d[i] >= 0);
          if (inside.length === 1)
            add(
              ...(outside.map((j) => edge(inside[0], j)) as [
                THREE.Vector3,
                THREE.Vector3,
                THREE.Vector3,
              ]),
            );
          else if (inside.length === 3)
            add(
              ...(inside.map((j) => edge(outside[0], j)) as [
                THREE.Vector3,
                THREE.Vector3,
                THREE.Vector3,
              ]),
            );
          else if (inside.length === 2) {
            const a = edge(inside[0], outside[0]),
              b = edge(inside[0], outside[1]),
              c = edge(inside[1], outside[0]),
              d2 = edge(inside[1], outside[1]);
            add(a, b, c);
            add(b, d2, c);
          }
        }
      }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return g;
}
const Camera = ({ frame }: { frame: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cameraAt(frame));
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  }, [camera, frame]);
  return null;
};
const ShellMaterial = ({
  texture,
  opacity = 1,
}: {
  texture: THREE.Texture;
  opacity?: number;
}) => (
  <meshPhysicalMaterial
    map={texture}
    color="#fff1c1"
    roughness={0.31}
    clearcoat={0.65}
    clearcoatRoughness={0.22}
    side={THREE.DoubleSide}
    transparent
    opacity={opacity}
  />
);
const Tube = ({
  points,
  color = AMBER,
  r = 0.018,
  alpha = 1,
}: {
  points: V[];
  color?: string;
  r?: number;
  alpha?: number;
}) => {
  const g = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        80,
        r,
        8,
        false,
      ),
    [points, r],
  );
  return (
    <mesh geometry={g}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={alpha}
      />
    </mesh>
  );
};
const Heater = ({ frame }: { frame: number }) => {
  const points = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => {
        const t = (i / 149) * Math.PI * 7,
          r = 0.22 + (i / 149) * 1.25;
        return [Math.cos(t) * r, -1.94, Math.sin(t) * r] as V;
      }),
    [],
  );
  const a = ease(frame, [269, 292, 477, 505], [0, 1, 1, 0]);
  return (
    <group scale={Math.max(0.001, a)}>
      <mesh position={[0, -2.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.75, 1.82, 0.13, 64]} />
        <meshStandardMaterial
          color="#252b34"
          metalness={0.7}
          roughness={0.28}
        />
      </mesh>
      <Tube points={points} color="#f49043" r={0.032} alpha={a} />
      <pointLight
        position={[0, -1.7, 1]}
        color="#ff8d3a"
        intensity={heat(frame) * 7}
        distance={5}
      />
    </group>
  );
};
const Interior = ({ frame }: { frame: number }) => {
  const a = Math.max(
    open(frame),
    lin(frame, [280, 307, 366, 397], [0, 0.75, 0.75, 0]),
  );
  const grains = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const t = i * 2.399,
          r = Math.sqrt((i + 0.5) / 28) * 0.66;
        return [
          Math.cos(t) * r,
          Math.sin(t) * r * 1.15,
          0.13 + hash(i + 37) * 0.3,
        ] as V;
      }),
    [],
  );
  return (
    <group visible={a > 0.001} scale={Math.max(0.001, a)}>
      <mesh scale={[0.77, 0.99, 0.43]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color="#e8dab4" roughness={0.85} />
      </mesh>
      {grains.map((p, i) => (
        <mesh key={i} position={p} scale={[0.16, 0.2, 0.12]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial
            color={i % 2 ? "#f5e9c9" : "#dac99e"}
            roughness={0.8}
          />
        </mesh>
      ))}
      {[
        [-0.23, 0.3, 0.53],
        [0.25, -0.25, 0.53],
        [0.18, 0.5, 0.47],
      ].map((p, i) => (
        <mesh key={i} position={p as V} scale={[0.14, 0.19, 0.11]}>
          <sphereGeometry args={[1, 28, 24]} />
          <meshPhysicalMaterial
            color={BLUE}
            roughness={0.12}
            metalness={0.08}
            clearcoat={1}
            emissive={BLUE}
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
      {frame > 280 &&
        Array.from({ length: 18 }, (_, i) => {
          const t = (frame - 280) * (0.027 + heat(frame) * 0.065) + i * 2.399;
          return (
            <mesh
              key={i}
              position={[
                Math.sin(t) * (0.33 + hash(i) * 0.32),
                Math.cos(t * 0.87) * 0.75,
                0.5 + Math.sin(t * 1.4) * 0.15,
              ]}
            >
              <sphereGeometry args={[0.037 + hash(i + 9) * 0.025, 12, 12]} />
              <meshBasicMaterial color={BLUE} />
            </mesh>
          );
        })}
    </group>
  );
};
const Burst = ({
  frame,
  texture,
}: {
  frame: number;
  texture: THREE.Texture;
}) => {
  const dt = frame - 480,
    parts = useMemo(
      () =>
        Array.from({ length: 8 }, (_, i) =>
          kernelGeo((i * Math.PI) / 4, Math.PI / 4, 0.15, Math.PI - 0.3),
        ),
      [],
    );
  return (
    <group visible={dt >= 0 && dt < 100}>
      {parts.map((g, i) => {
        const a = (i * Math.PI) / 4,
          speed = 1.5 + hash(i + 5) * 1.0,
          t = Math.max(0, dt) / 30;
        return (
          <mesh
            key={i}
            geometry={g}
            position={[
              Math.cos(a) * speed * t,
              Math.sin(a) * speed * t - t * t * 0.7,
              Math.sin(i * 2.3) * t,
            ]}
            rotation={[t * (i % 2 ? 2 : -2), t * ((i % 3) - 1) * 3, t * 0.8]}
            scale={1.25}
            castShadow
          >
            <ShellMaterial
              texture={texture}
              opacity={lin(dt, [15, 65], [1, 0])}
            />
          </mesh>
        );
      })}
      {Array.from({ length: 38 }, (_, i) => {
        const t = Math.max(0, dt - (i % 5)) / 30,
          phi = i * 2.399,
          speed = 0.8 + hash(i + 79) * 2.1;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(phi) * speed * t,
              Math.sin(phi) * speed * t + t * 0.5,
              (hash(i + 8) - 0.5) * t * 4,
            ]}
            scale={0.03 + t * 0.14}
          >
            <sphereGeometry args={[1, 14, 12]} />
            <meshBasicMaterial
              color="#e8e5de"
              transparent
              opacity={lin(dt, [0, 10, 55, 90], [0, 0.45, 0.12, 0])}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
const World = ({ frame }: { frame: number }) => {
  const texture = useMemo(kernelTexture, []),
    full = useMemo(() => kernelGeo(), []),
    front = useMemo(() => kernelGeo(0, Math.PI), []),
    back = useMemo(() => kernelGeo(Math.PI, Math.PI), []),
    flake = useMemo(flakeGeometry, []),
    opening = open(frame),
    before = frame < 480;
  const inflate = lin(frame, [390, 478], [1, 1.055]),
    jitter =
      frame > 397 && before
        ? Math.sin(frame * 2.5) * lin(frame, [397, 479], [0, 0.035])
        : 0;
  const crack = useMemo(
    () =>
      [
        [0.03, 0.8, 0.37],
        [-0.05, 0.58, 0.52],
        [0.07, 0.37, 0.56],
        [-0.08, 0.13, 0.58],
        [0.04, -0.04, 0.58],
        [-0.08, -0.25, 0.54],
        [0.02, -0.46, 0.48],
      ] as V[],
    [],
  );
  const crackGeometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(crack.map((p) => new THREE.Vector3(...p))),
        90,
        0.011,
        6,
        false,
      ),
    [crack],
  );
  crackGeometry.setDrawRange(
    0,
    Math.floor(ease(frame, [449, 481], [0, 1]) * 90) * 6 * 6,
  );
  const after = frame >= 480,
    expand = Math.max(0.001, pop(frame, 480));
  return (
    <>
      <mesh
        position={[0, -2.13, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
      <Heater frame={frame} />
      <group
        position={[jitter, 0.08 + Math.sin(frame / 100) * 0.045, 0]}
        rotation={turn(frame)}
      >
        {before && (
          <group scale={1.25 * inflate}>
            {(frame < 92 || frame >= 269) && (
              <mesh geometry={full} castShadow receiveShadow>
                <ShellMaterial
                  texture={texture}
                  opacity={lin(frame, [278, 308, 363, 394], [1, 0.32, 0.32, 1])}
                />
              </mesh>
            )}
            {frame >= 92 && frame < 269 && (
              <>
                <mesh
                  geometry={back}
                  position={[-opening * 0.76, 0, -opening * 0.16]}
                  rotation={[0, -opening * 0.38, 0]}
                  castShadow
                >
                  <ShellMaterial texture={texture} />
                </mesh>
                <mesh
                  geometry={front}
                  position={[opening * 0.76, 0, opening * 0.24]}
                  rotation={[0, opening * 0.38, 0]}
                  castShadow
                >
                  <ShellMaterial texture={texture} />
                </mesh>
              </>
            )}
            <Interior frame={frame} />
            {frame > 449 && (
              <mesh geometry={crackGeometry}>
                <meshBasicMaterial color="#4b260c" />
              </mesh>
            )}
          </group>
        )}
        <Burst frame={frame} texture={texture} />
        {after && (
          <group
            rotation={[
              0.13 + Math.sin((frame - 480) / 80) * 0.15,
              (frame - 480) * 0.008,
              0.12,
            ]}
            scale={1.65 * expand}
          >
            <mesh geometry={flake} castShadow receiveShadow>
              <meshStandardMaterial vertexColors roughness={0.91} />
            </mesh>
            <mesh
              position={[0.03, -0.6, 0.28]}
              rotation={[0.25, 0.2, 0.1]}
              scale={[0.36, 0.23, 0.31]}
            >
              <sphereGeometry args={[1, 32, 20]} />
              <meshPhysicalMaterial
                color="#ad7937"
                roughness={0.6}
                clearcoat={0.15}
              />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
};
function screenPoint(f: number, p: V) {
  const c = new THREE.PerspectiveCamera(38, 1080 / HEIGHT, 0.1, 100);
  c.position.set(...cameraAt(f));
  c.lookAt(0, 0.05, 0);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).applyEuler(new THREE.Euler(...turn(f)));
  v.y += 0.08 + Math.sin(f / 100) * 0.045;
  v.project(c);
  return [(v.x + 1) * 540, TOP + ((1 - v.y) * HEIGHT) / 2];
}
const CutawayLabels = ({ frame }: { frame: number }) => {
  const a = ease(frame, [126, 143, 228, 250], [0, 1, 1, 0]);
  if (a < 0.001) return null;
  const labels = [
    {
      text: "SCHALE",
      x: 170,
      y: 780,
      p: [-1.52, 0.25, 0.1] as V,
      color: AMBER,
    },
    { text: "STÄRKE", x: 610, y: 580, p: [0, 0.92, 0.46] as V, color: IVORY },
    {
      text: "WASSER",
      x: 845,
      y: 1200,
      p: [-0.29, 0.375, 0.66] as V,
      color: BLUE,
    },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      {labels.map((l) => {
        const [x, y] = screenPoint(frame, l.p);
        return (
          <div key={l.text}>
            <svg
              width="1080"
              height="1920"
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d={`M${l.x} ${l.y + 38}L${l.x} ${l.y + 67}L${x} ${y}`}
                stroke={l.color}
                strokeWidth="1.5"
                opacity=".65"
                fill="none"
              />
              <circle cx={x} cy={y} r="4" fill={l.color} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: l.x - 100,
                top: l.y,
                width: 200,
                textAlign: "center",
                fontSize: 32,
                fontFamily: "SceneBold",
                letterSpacing: 3,
                color: l.color,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const PressureDial = ({ frame }: { frame: number }) => {
  const a = ease(frame, [386, 403, 474, 486], [0, 1, 1, 0]);
  if (a < 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 780,
        top: 670,
        width: 210,
        opacity: a,
        scale: 0.9 + 0.1 * a,
      }}
    >
      <svg width="210" height="210" viewBox="0 0 210 210">
        <circle
          cx="105"
          cy="105"
          r="86"
          fill="#141820"
          stroke="#ffffff2b"
          strokeWidth="1"
        />
        {Array.from({ length: 27 }, (_, i) => {
          const t = (((i / 26) * 270 + 135) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={105 + Math.cos(t) * 72}
              y1={105 + Math.sin(t) * 72}
              x2={105 + Math.cos(t) * (i % 3 ? 65 : 59)}
              y2={105 + Math.sin(t) * (i % 3 ? 65 : 59)}
              stroke={i > 20 ? "#e69b5c" : "#a7a9ad"}
              strokeWidth={i % 3 ? 1 : 2}
            />
          );
        })}
        <g
          transform={`rotate(${ease(frame, [393, 476], [-135, 135])} 105 105)`}
        >
          <path d="M101 110L105 38L109 110Z" fill={AMBER} />
        </g>
        <circle cx="105" cy="105" r="7" fill={IVORY} />
      </svg>
      <div
        style={{
          fontSize: 26,
          fontFamily: "SceneBold",
          textAlign: "center",
          letterSpacing: 3,
          color: AMBER,
          marginTop: -8,
        }}
      >
        DRUCK
      </div>
    </div>
  );
};
const Copy = ({ frame }: { frame: number }) => {
  const phases = [
    {
      from: 0,
      to: 92,
      kicker: "EIN KLEINES WUNDER",
      title: (
        <>
          Ein Korn.
          <br />
          Ein Knall.
        </>
      ),
      bottom: "Was passiert da drinnen?",
    },
    {
      from: 92,
      to: 269,
      kicker: "01 / IM SCHNITT",
      title: (
        <>
          Was steckt
          <br />
          drinnen?
        </>
      ),
      bottom: "Stärke. Und ein wenig Wasser.",
    },
    {
      from: 269,
      to: 390,
      kicker: "02 / WÄRME",
      title: (
        <>
          Wärme wird
          <br />
          Druck.
        </>
      ),
      bottom: "Die Stärke wird weich.",
    },
    {
      from: 390,
      to: 480,
      kicker: "03 / SPANNUNG",
      title: (
        <>
          Die Schale
          <br />
          hält dagegen.
        </>
      ),
      bottom: "Innen steigt der Dampfdruck.",
    },
    {
      from: 480,
      to: 570,
      kicker: "ZEITLUPE",
      title: <>POP!</>,
      bottom: "Die Stärke schäumt auf.",
    },
    {
      from: 570,
      to: 660,
      kicker: "04 / DIE VERWANDLUNG",
      title: (
        <>
          Aus Stärke
          <br />
          wird Schaum.
        </>
      ),
      bottom: "Leicht. Luftig. Aufgepoppt.",
    },
    {
      from: 660,
      to: 720,
      kicker: "DAS IST",
      title: <>POPCORN.</>,
      bottom: "Ein Korn. Ein großer Moment.",
    },
  ];
  const p = phases.find((p) => frame >= p.from && frame < p.to)!;
  const age = frame - p.from,
    a = ease(age, [0, 10], [0, 1]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 78,
          top: 94,
          opacity: a,
          translate: `0 ${18 * (1 - a)}px`,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontFamily: "SceneBold",
            letterSpacing: 4.2,
            color: "#b2aaa1",
            marginBottom: 35,
          }}
        >
          {p.kicker}
        </div>
        <div
          style={{
            fontFamily: "SceneBold",
            fontSize: p.from === 480 ? 212 : p.from === 660 ? 112 : 104,
            lineHeight: 0.99,
            letterSpacing: -3.5,
            color: p.from === 480 ? AMBER : IVORY,
          }}
        >
          {p.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 80,
          top: 1590,
          opacity: a,
          translate: `0 ${12 * (1 - a)}px`,
        }}
      >
        <div
          style={{ width: 44, height: 3, background: AMBER, marginBottom: 27 }}
        />
        <div
          style={{
            fontSize: 45,
            lineHeight: 1.22,
            fontFamily: "SceneSans",
            color: IVORY,
          }}
        >
          {p.bottom}
        </div>
      </div>
      {frame >= 480 && frame < 504 && (
        <svg
          width="1080"
          height="1920"
          style={{
            position: "absolute",
            inset: 0,
            opacity: lin(frame, [480, 486, 504], [0, 0.55, 0]),
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={540 + Math.cos(a) * 240}
                y1={930 + Math.sin(a) * 240}
                x2={540 + Math.cos(a) * 420}
                y2={930 + Math.sin(a) * 420}
                stroke={AMBER}
                strokeWidth="2"
              />
            );
          })}
        </svg>
      )}
    </>
  );
};
export const PopcornLab = () => {
  const f = useCurrentFrame(),
    h = heat(f);
  return (
    <AbsoluteFill
      style={{
        background: "#101319",
        color: IVORY,
        fontFamily: "SceneSans",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 48% 52%,#25272b 0%,#15191e 40%,#0c1016 78%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.1 + h * 0.15,
          background:
            "radial-gradient(ellipse at 50% 63%,#e38d34 0%,transparent 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 89,
          top: 66,
          height: 1,
          width: 900,
          background: "#ffffff13",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: TOP,
          left: 0,
          width: 1080,
          height: HEIGHT,
        }}
      >
        <ThreeCanvas
          width={1080}
          height={HEIGHT}
          shadows
          camera={{ position: cameraAt(f), fov: 38, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Camera frame={f} />
          <ambientLight intensity={0.6} color="#dfe7ef" />
          <directionalLight
            position={[-3, 5, 6]}
            intensity={2.2}
            color="#fff0d4"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-bias={-0.0002}
          />
          <directionalLight
            position={[4, 0, -1]}
            intensity={2.2}
            color="#76a6ca"
          />
          <pointLight
            position={[-3, 2, 4]}
            intensity={25}
            color="#ffe2b8"
            distance={12}
          />
          <World frame={f} />
        </ThreeCanvas>
      </div>
      <Copy frame={f} />
      <CutawayLabels frame={f} />
      <PressureDial frame={f} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 82,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
          letterSpacing: 2,
          color: "#908e89",
        }}
      >
        <span>VISUAL SCIENCE / 01</span>
        <span>
          {f < 480
            ? "SCHNITTANSICHT: MODELL"
            : f < 570
              ? "VERLANGSAMTE DARSTELLUNG"
              : "MODELLHAFTE DARSTELLUNG"}
        </span>
      </div>
      <Audio src={staticFile("audio/popcorn-lab.wav")} volume={1} />
    </AbsoluteFill>
  );
};
