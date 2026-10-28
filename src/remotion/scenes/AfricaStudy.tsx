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
import countries from "../data/africa.json";
import "../fonts";

export {
  makeGeometry as makeCountryGeometry,
  paperTexture,
  Rod,
  Doodles,
  position as mapPosition,
};

const GREEN = "#bcf34a",
  WHITE = "#f5f4eb";
const LIMIT = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...LIMIT, easing: Easing.bezier(0.22, 1, 0.36, 1) });
const linear = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, LIMIT);
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 13.4) * 43758.5453;
  return x - Math.floor(x);
};
const STAGE_TOP = 322,
  STAGE_HEIGHT = 1260;
type V = [number, number, number];
const position = (p: number[]) => [(p[0] - 15) * 0.079, (p[1] - 1) * 0.079];

const selection = [
  { id: "EGY", name: "ÄGYPTEN", from: 91, to: 164, anchor: [30, 27] },
  { id: "NGA", name: "NIGERIA", from: 165, to: 238, anchor: [8, 9] },
  { id: "ZAF", name: "SÜDAFRIKA", from: 239, to: 312, anchor: [25, -29] },
];
const selected = (f: number) => selection.find((s) => f >= s.from && f < s.to);
const lift = (f: number, from: number, to: number) =>
  linear(f, [from, from + 13, to - 12, to], [0, 1, 1, 0]);
const boardRotation = (f: number): V => [
  0.025 * Math.sin(f / 140),
  ease(f, [0, 100, 420], [-0.19, -0.08, 0.12]),
  0.012 * Math.sin(f / 120),
];
const cameraPosition = (f: number): V => [
  ease(f, [0, 420], [2.1, -0.9]),
  1.8,
  14.4 - ease(f, [0, 80], [0.4, 0]),
];

function makeGeometry(parts: number[][][][]) {
  const points = parts.flatMap((poly) => poly[0].map(position));
  const minX = Math.min(...points.map((p) => p[0])),
    maxX = Math.max(...points.map((p) => p[0])),
    minY = Math.min(...points.map((p) => p[1])),
    maxY = Math.max(...points.map((p) => p[1]));
  const center = [(minX + maxX) / 2, (minY + maxY) / 2];
  const shapes = parts.map((poly) => {
    const shape = new THREE.Shape();
    poly.forEach((ring, j) => {
      const path = j === 0 ? shape : new THREE.Path();
      ring.forEach((p, i) => {
        const [x, y] = position(p);
        if (i === 0) path.moveTo(x - center[0], y - center[1]);
        else path.lineTo(x - center[0], y - center[1]);
      });
      path.closePath();
      if (j > 0) shape.holes.push(path as THREE.Path);
    });
    return shape;
  });
  const bevel = Math.min(0.03, (maxX - minX) * 0.075, (maxY - minY) * 0.075);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.21,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 4,
  });
  geometry.computeVertexNormals();
  return { geometry, center };
}

const Camera = ({ frame }: { frame: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cameraPosition(frame));
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();
  }, [camera, frame]);
  return null;
};

function paperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e6e2d4";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.strokeStyle = "#8b95831d";
  ctx.lineWidth = 1.2;
  for (let p = 0; p <= 1024; p += 43) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(1024, p);
    ctx.stroke();
  }
  for (let i = 0; i < 15000; i++) {
    ctx.fillStyle = i % 2 ? "#57493408" : "#ffffff0c";
    ctx.fillRect(
      hash(i + 13) * 1024,
      hash(i + 600) * 1024,
      0.6 + hash(i + 53) * 1.3,
      0.6,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const Rod = ({
  a,
  b,
  r = 0.025,
  color = "#bcb8a7",
}: {
  a: V;
  b: V;
  r?: number;
  color?: string;
}) => {
  const av = new THREE.Vector3(...a),
    bv = new THREE.Vector3(...b),
    d = bv.clone().sub(av),
    q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      d.clone().normalize(),
    );
  return (
    <mesh position={av.add(bv).multiplyScalar(0.5)} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, d.length(), 12]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
};

const Board = ({ frame }: { frame: number }) => {
  const texture = useMemo(paperTexture, []);
  const map = useMemo(
    () =>
      countries.map((country, i) => ({
        ...country,
        ...makeGeometry(country.parts),
        index: i,
      })),
    [],
  );
  const active = selected(frame);
  const drop = ease(frame, [0, 32], [-0.6, 0]);
  return (
    <group rotation={boardRotation(frame)} position={[0, drop, 0]}>
      <mesh position={[0, 0, -0.07]} receiveShadow>
        <boxGeometry args={[7.35, 7.38, 0.11]} />
        <meshStandardMaterial map={texture} roughness={1} color="#fffdf2" />
      </mesh>
      <mesh position={[0, 0, -0.14]}>
        <boxGeometry args={[7.39, 7.42, 0.025]} />
        <meshStandardMaterial color="#aaa38d" roughness={1} />
      </mesh>
      {[3.7, -3.7].map((y, i) => (
        <group key={i} position={[0, y, 0.02]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 7.75, 32]} />
            <meshStandardMaterial color="#946f45" roughness={0.8} />
          </mesh>
          <Rod
            a={[-3.7, -0.028, 0.079]}
            b={[3.7, -0.028, 0.079]}
            r={0.013}
            color="#ba996d"
          />
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 3.87, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <sphereGeometry args={[0.105, 20, 20]} />
              <meshStandardMaterial color="#aa8353" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      <Rod a={[-3.15, 3.72, -0.06]} b={[0, 4.37, -0.06]} r={0.015} />
      <Rod a={[0, 4.37, -0.06]} b={[3.15, 3.72, -0.06]} r={0.015} />
      <mesh position={[0, 4.42, -0.04]}>
        <torusGeometry args={[0.055, 0.014, 8, 24]} />
        <meshStandardMaterial color="#aeb2a6" metalness={0.4} />
      </mesh>
      {map.map((country) => {
        const start = 18 + Math.round(hash(country.index + 5) * 32),
          arrive = spring({
            frame: frame - start,
            fps: 30,
            config: { damping: 19, stiffness: 155, mass: 0.8 },
          }),
          height =
            active?.id === country.id
              ? lift(frame, active.from, active.to) * 0.58
              : 0;
        const muted = ["SAH", "SOL"].includes(country.id);
        const color = new THREE.Color(
          muted
            ? "#bec49b"
            : new THREE.Color()
                .setHSL(
                  0.218 + hash(country.index + 1) * 0.023,
                  0.88,
                  0.44 + hash(country.index + 19) * 0.04,
                )
                .convertSRGBToLinear(),
        );
        if (height > 0)
          color.lerp(new THREE.Color("#d7fa77"), (height / 0.58) * 0.3);
        return (
          <group
            key={country.id}
            position={[
              country.center[0],
              country.center[1],
              0.012 + (1 - arrive) * 1.4 + height,
            ]}
            scale={[
              Math.max(0.001, arrive) * 0.985,
              Math.max(0.001, arrive) * 0.985,
              1,
            ]}
          >
            <mesh geometry={country.geometry} castShadow receiveShadow>
              <meshStandardMaterial
                attach="material-0"
                color={color}
                roughness={0.33}
                emissive={color}
                emissiveIntensity={0.03}
              />
              <meshStandardMaterial
                attach="material-1"
                color={muted ? "#929b73" : "#77ac23"}
                roughness={0.7}
              />
            </mesh>
          </group>
        );
      })}
      {active &&
        (() => {
          const [x, y] = position(active.anchor);
          const amount = lift(frame, active.from, active.to);
          return (
            <group position={[x, y, 0.22 + amount * 0.58]} scale={amount}>
              <mesh position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.017, 0.017, 0.34, 12]} />
                <meshStandardMaterial color={WHITE} />
              </mesh>
              <mesh position={[0, 0, 0.36]}>
                <sphereGeometry args={[0.045, 20, 20]} />
                <meshBasicMaterial color={WHITE} />
              </mesh>
              <mesh>
                <torusGeometry args={[0.12, 0.012, 8, 32]} />
                <meshBasicMaterial color="#f6ffd8" transparent opacity={0.9} />
              </mesh>
            </group>
          );
        })()}
    </group>
  );
};

const Doodles = () => (
  <svg
    width="1080"
    height="1920"
    style={{ position: "absolute", inset: 0, opacity: 0.075 }}
  >
    <defs>
      <pattern
        id="study-doodles"
        width="200"
        height="200"
        patternUnits="userSpaceOnUse"
      >
        <g fill="none" stroke="#ccd2b8" strokeWidth="1.1">
          <g transform="translate(40 38) rotate(-13)">
            <circle r="17" />
            <ellipse rx="8" ry="17" />
            <path d="M-16-5h32m-32 10h32M0-17v34" />
          </g>
          <g transform="translate(138 100) rotate(15)">
            <path d="M-18-13Q-7-17 0-10Q7-17 18-13v27Q8 10 0 15Q-8 10-18 14ZM0-10v25" />
            <path d="M-13-5l8-1m-8 6 8-1M5-6l8 1M5-1l8 1" />
          </g>
          <g transform="translate(38 153) rotate(-20)">
            <path d="M-8 4Q-18-11-8-17Q5-25 12-12Q17-3 8 4v8H-8ZM-7 16H7M-4 21h8" />
            <path d="M-22-8h-6m47 0h7M0-29v-5" />
          </g>
        </g>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="url(#study-doodles)" />
  </svg>
);

function screenPoint(frame: number, coords: number[], z: number) {
  const cam = new THREE.PerspectiveCamera(38, 1080 / STAGE_HEIGHT, 0.1, 100);
  cam.position.set(...cameraPosition(frame));
  cam.lookAt(0, 0.35, 0);
  cam.updateMatrixWorld();
  const [x, y] = position(coords),
    p = new THREE.Vector3(x, y, z);
  p.applyEuler(new THREE.Euler(...boardRotation(frame)));
  p.y += ease(frame, [0, 32], [-0.6, 0]);
  p.project(cam);
  return [(p.x + 1) * 540, STAGE_TOP + ((1 - p.y) * STAGE_HEIGHT) / 2];
}

const Callout = ({ frame }: { frame: number }) => {
  const item = selected(frame);
  if (!item) return null;
  const amount = lift(frame, item.from, item.to),
    [x, y] = screenPoint(frame, item.anchor, 0.58 * amount + 0.54);
  const side = item.id === "NGA" ? -1 : 1,
    tx = Math.max(155, Math.min(918, x + side * 170)),
    ty = y - 83;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: amount,
        pointerEvents: "none",
      }}
    >
      <svg
        width="1080"
        height="1920"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d={`M${x} ${y}L${x + side * 45} ${ty + 22}H${tx}`}
          fill="none"
          stroke="#69734e"
          strokeWidth="2.3"
        />
        <circle cx={x} cy={y} r="5.5" fill={WHITE} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: tx - 132,
          top: ty - 26,
          width: 264,
          height: 66,
          borderRadius: 15,
          background: "linear-gradient(#424b38,#31372c)",
          boxShadow: "0 8px 12px #0003,0 1px 0 #ffffff2a inset",
          border: "1px solid #b9f34a80",
          display: "grid",
          placeItems: "center",
          fontFamily: "SceneBold",
          fontSize: 32,
          letterSpacing: 0.7,
          color: WHITE,
          translate: `0 ${12 * (1 - amount)}px`,
        }}
      >
        {item.name}
      </div>
    </div>
  );
};

export const AfricaStudy = () => {
  const frame = useCurrentFrame(),
    end = ease(frame, [310, 338], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: "#2b302a",
        fontFamily: "SceneSans",
        color: WHITE,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 48% 44%,#4a513d 0%,#34392f 43%,#222721 100%)",
        }}
      />
      <Doodles />
      <div
        style={{
          position: "absolute",
          top: 115,
          left: 80,
          right: 80,
          textAlign: "center",
          opacity: ease(frame, [0, 12], [0, 1]),
          translate: `0 ${ease(frame, [0, 25], [24, 0])}px`,
        }}
      >
        <div
          style={{
            fontFamily: "SceneBold",
            fontSize: 104,
            letterSpacing: 1,
            lineHeight: 1,
          }}
        >
          AFRIKA
        </div>
        <div
          style={{
            fontFamily: "SceneSerif",
            fontStyle: "italic",
            fontSize: 85,
            lineHeight: 1.1,
            letterSpacing: -2,
            color: GREEN,
            marginTop: 8,
          }}
        >
          kurz erklärt
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: STAGE_TOP,
          width: 1080,
          height: STAGE_HEIGHT,
        }}
      >
        <ThreeCanvas
          width={1080}
          height={STAGE_HEIGHT}
          shadows
          camera={{
            position: cameraPosition(frame),
            fov: 38,
            near: 0.1,
            far: 100,
          }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Camera frame={frame} />
          <ambientLight color="#fffde8" intensity={0.85} />
          <directionalLight
            position={[-4, 7, 8]}
            intensity={2.7}
            color="#fff9df"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-radius={4}
            shadow-bias={-0.00025}
          />
          <directionalLight
            position={[4, -1, 5]}
            intensity={0.5}
            color="#d9f3ba"
          />
          <Board frame={frame} />
        </ThreeCanvas>
      </div>
      <Callout frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 145,
          right: 145,
          top: 1602,
          textAlign: "center",
          opacity: 1 - end,
          translate: `0 ${-10 * end}px`,
        }}
      >
        <div
          style={{
            fontFamily: "SceneBold",
            fontSize: 54,
            textShadow: "0 3px 6px #0004",
          }}
        >
          Ein Kontinent.
        </div>
        <div style={{ fontSize: 29, color: "#d2d8c4", marginTop: 13 }}>
          Viele verschiedene Länder.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          top: 1570,
          opacity: end,
          scale: ease(frame, [310, 347], [0.93, 1]),
          textAlign: "center",
        }}
      >
        <div
          style={{
            height: 128,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 23,
            borderRadius: 25,
            background: "linear-gradient(#454d3b,#343c2f)",
            border: "1.5px solid #a9e13b9e",
            boxShadow:
              "0 12px 24px #11180c70,0 0 35px #a3d83615,0 2px 0 #ffffff12 inset",
          }}
        >
          <span
            style={{
              fontFamily: "SceneBold",
              fontSize: 94,
              color: GREEN,
              lineHeight: 1,
            }}
          >
            54
          </span>
          <span
            style={{
              textAlign: "left",
              fontFamily: "SceneBold",
              fontSize: 33,
              lineHeight: 1.15,
            }}
          >
            afrikanische
            <br />
            UN-Mitgliedstaaten
          </span>
        </div>
        <div style={{ fontFamily: "SceneBold", fontSize: 44, marginTop: 26 }}>
          Viele Länder. Ein Kontinent.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 63,
          textAlign: "center",
          fontSize: 21,
          color: "#afb9a0",
          letterSpacing: 0.5,
        }}
      >
        Vereinfachte Karte · Natural Earth · Quelle: UN
      </div>
      <Audio src={staticFile("audio/africa-study.wav")} volume={1} />
    </AbsoluteFill>
  );
};
