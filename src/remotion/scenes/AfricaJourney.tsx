import { useLayoutEffect, useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import countries from "../data/africa.json";
import {
  makeCountryGeometry,
  paperTexture,
  Rod,
  Doodles,
  mapPosition,
} from "./AfricaStudy";
import "../fonts";

type V = [number, number, number];
type Stop = "EGY" | "NGA" | "ZAF";
const GREEN = "#bcf34a",
  WHITE = "#f5f4eb",
  BLUE = "#49c5df";
const TOP = 350,
  HEIGHT = 1190;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lin = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, CLAMP);
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...CLAMP, easing: Easing.bezier(0.45, 0, 0.2, 1) });
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 13.4) * 43758.5453;
  return x - Math.floor(x);
};
const stops = [
  {
    id: "EGY" as Stop,
    name: "ÄGYPTEN",
    region: "IM NORDOSTEN",
    from: 110,
    to: 365,
    city: "KAIRO",
    anchor: [31.2, 30.04],
    fact: "Kairo liegt am Nil.",
    detail: "Der Fluss zieht durch das Land.",
  },
  {
    id: "NGA" as Stop,
    name: "NIGERIA",
    region: "IN WESTAFRIKA",
    from: 365,
    to: 615,
    city: "ABUJA",
    anchor: [7.4, 9.08],
    fact: "Die Hauptstadt heißt Abuja.",
    detail: "Eine Stadt im Landesinneren.",
  },
  {
    id: "ZAF" as Stop,
    name: "SÜDAFRIKA",
    region: "IM SÜDEN",
    from: 615,
    to: 865,
    city: "KAP AGULHAS",
    anchor: [20, -34.833],
    fact: "Hier treffen sich zwei Ozeane.",
    detail: "Am Kap Agulhas.",
  },
];
const active = (f: number) => stops.find((s) => f >= s.from && f < s.to);
const focus = (f: number) => {
  const s = active(f);
  return s ? ease(f, [s.from, s.from + 36, s.to - 34, s.to], [0, 1, 1, 0]) : 0;
};
const pop = (f: number, start: number) =>
  spring({
    frame: f - start,
    fps: 30,
    config: { damping: 18, stiffness: 150, mass: 0.8 },
  });
const rotation = (f: number): V => [
  0.025 * Math.sin(f / 130) - 0.66 * focus(f),
  -0.1 + 0.13 * Math.sin(f / 260),
  0.012 * Math.sin(f / 130),
];
const cameraAt = (f: number): V => [
  0.85 * Math.sin(f / 210),
  1.7 + 0.8 * focus(f),
  14.7 - focus(f) * 1.15,
];
const vec = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2] ?? 0);
function countryPose(f: number, id: string, center: number[], width: number) {
  const a = active(f),
    q = focus(f),
    isActive = a?.id === id;
  return {
    position: [
      center[0] * (1 - (isActive ? q : 0)),
      center[1] * (1 - (isActive ? q : 0)) + (isActive ? 0.3 * q : 0),
      isActive ? 0.03 + 0.48 * q : 0.03,
    ] as V,
    scale: isActive ? 1 + (6 / width - 1) * q : 1,
    alpha: isActive ? 1 : 1 - lin(q, [0, 0.7], [0, 1]),
  };
}
const Camera = ({ frame }: { frame: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cameraAt(frame));
    camera.lookAt(0, 0.3, 0);
    camera.updateProjectionMatrix();
  }, [camera, frame]);
  return null;
};
const Curve = ({
  points,
  progress = 1,
  color = WHITE,
  radius = 0.018,
  opacity = 1,
}: {
  points: V[];
  progress?: number;
  color?: string;
  radius?: number;
  opacity?: number;
}) => {
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map(vec)),
        100,
        radius,
        8,
        false,
      ),
    [points, radius],
  );
  geometry.setDrawRange(0, Math.max(0, Math.floor(progress * 100)) * 8 * 6);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.28}
        roughness={0.45}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};
function Pyramid({
  x,
  y,
  size,
  frame,
  from,
}: {
  x: number;
  y: number;
  size: number;
  frame: number;
  from: number;
}) {
  const p = Math.max(0.001, pop(frame, from));
  return (
    <group position={[x, y, 0.24]} scale={p}>
      <mesh
        position={[0, 0, size * 0.58]}
        rotation={[Math.PI / 2, 0, Math.PI / 4]}
        castShadow
      >
        <coneGeometry args={[size * 0.7, size * 1.16, 4, 1]} />
        <meshStandardMaterial color="#dcb969" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0, 0.015]} receiveShadow>
        <boxGeometry args={[size * 1.06, size * 1.06, 0.03]} />
        <meshStandardMaterial color="#cba45b" />
      </mesh>
    </group>
  );
}
const Nile = ({ frame, center }: { frame: number; center: number[] }) => {
  const points = useMemo(
    () =>
      [
        [31.5, 22],
        [32.6, 24],
        [32.8, 25.2],
        [31.7, 26.3],
        [31.2, 27.4],
        [30.8, 28.6],
        [31.2, 30],
        [30.7, 30.7],
        [30.4, 31.4],
      ].map((p) => {
        const xy = mapPosition(p);
        return [xy[0] - center[0], xy[1] - center[1], 0.252] as V;
      }),
    [center],
  );
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(vec)),
    [points],
  );
  const delta = useMemo(() => {
    const p = mapPosition([31.2, 30]);
    return [p[0] - center[0], p[1] - center[1], 0.254] as V;
  }, [center]);
  const branch1 = useMemo(
    () =>
      [
        delta,
        [delta[0] - 0.03, delta[1] + 0.07, 0.254],
        [delta[0] - 0.1, delta[1] + 0.12, 0.254],
      ] as V[],
    [delta],
  );
  const branch2 = useMemo(
    () =>
      [
        delta,
        [delta[0] + 0.04, delta[1] + 0.06, 0.254],
        [delta[0] + 0.06, delta[1] + 0.13, 0.254],
      ] as V[],
    [delta],
  );
  return (
    <group>
      <Curve
        points={points}
        progress={ease(frame, [159, 215], [0, 1])}
        color={BLUE}
        radius={0.009}
      />
      <Curve
        points={branch1}
        progress={ease(frame, [220, 245], [0, 1])}
        color={BLUE}
        radius={0.006}
      />
      <Curve
        points={branch2}
        progress={ease(frame, [227, 252], [0, 1])}
        color={BLUE}
        radius={0.006}
      />
      {frame > 205 &&
        [0, 0.33, 0.67].map((offset, i) => (
          <mesh
            key={i}
            position={curve.getPoint(((frame - 205) / 110 + offset) % 1)}
          >
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshBasicMaterial color="#e4fbff" />
          </mesh>
        ))}
    </group>
  );
};
const City = ({ frame }: { frame: number }) => {
  const buildings = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: ((i % 3) - 1) * 0.58,
        y: (Math.floor(i / 3) - 1) * 0.48,
        h: 0.55 + rnd(i + 7) * 0.9,
      })),
    [],
  );
  const road1 = useMemo(
      () =>
        [
          [-1.3, 0, 0.24],
          [0, 0, 0.24],
          [1.3, 0, 0.24],
        ] as V[],
      [],
    ),
    road2 = useMemo(
      () =>
        [
          [0, -1.1, 0.24],
          [0, 0, 0.24],
          [0, 1.1, 0.24],
        ] as V[],
      [],
    );
  return (
    <group>
      <Curve
        points={road1}
        progress={ease(frame, [411, 443], [0, 1])}
        color="#e7f4c8"
        radius={0.035}
      />
      <Curve
        points={road2}
        progress={ease(frame, [422, 455], [0, 1])}
        color="#e7f4c8"
        radius={0.035}
      />
      {buildings.map((b, i) => {
        const p = Math.max(0.001, pop(frame, 438 + i * 8));
        return (
          <group key={i} position={[b.x + 0.22, b.y + 0.22, 0.24]} scale={p}>
            <mesh position={[0, 0, b.h / 2]} castShadow receiveShadow>
              <boxGeometry args={[0.35, 0.29, b.h]} />
              <meshStandardMaterial
                color={
                  i % 3 === 0 ? "#e2e8d8" : i % 3 === 1 ? "#aebda1" : "#7a8d72"
                }
                roughness={0.46}
              />
            </mesh>
            <mesh position={[0, 0, b.h + 0.025]}>
              <boxGeometry args={[0.38, 0.32, 0.05]} />
              <meshStandardMaterial color="#4a6140" />
            </mesh>
            {Array.from({ length: Math.floor(b.h / 0.18) }, (_, j) => (
              <group key={j}>
                <mesh position={[0.178, 0, 0.15 + j * 0.18]}>
                  <boxGeometry args={[0.008, 0.16, 0.065]} />
                  <meshBasicMaterial
                    color={frame > 495 + i * 4 ? "#edfac3" : "#446256"}
                  />
                </mesh>
                <mesh position={[0, -0.148, 0.15 + j * 0.18]}>
                  <boxGeometry args={[0.2, 0.008, 0.065]} />
                  <meshBasicMaterial
                    color={frame > 495 + i * 4 ? "#edfac3" : "#446256"}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};
const Coast = ({ frame }: { frame: number }) => {
  const p = Math.max(0.001, pop(frame, 721));
  const west = useMemo(
      () =>
        [
          [-2, 0.7, 0.26],
          [-1.7, -0.18, 0.26],
          [-0.8, -0.6, 0.26],
          [0, 0, 0.26],
        ] as V[],
      [],
    ),
    east = useMemo(
      () =>
        [
          [2.7, 0.35, 0.26],
          [2.1, -0.3, 0.26],
          [1.2, -0.8, 0.26],
          [0, 0, 0.26],
        ] as V[],
      [],
    );
  const w = useMemo(() => new THREE.CatmullRomCurve3(west.map(vec)), [west]),
    e = useMemo(() => new THREE.CatmullRomCurve3(east.map(vec)), [east]);
  return (
    <group>
      <Curve
        points={west}
        progress={ease(frame, [669, 730], [0, 1])}
        color="#68b9e9"
        radius={0.043}
      />
      <Curve
        points={east}
        progress={ease(frame, [687, 748], [0, 1])}
        color="#63dbcf"
        radius={0.043}
      />
      {[w, e].map((curve, j) =>
        [0, 0.33, 0.67].map((offset, i) => (
          <mesh
            key={`${j}-${i}`}
            position={curve.getPoint(((frame - 690) / 130 + offset + 20) % 1)}
            scale={frame > 710 ? 1 : 0}
          >
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={j ? "#b9fff0" : "#bddfff"} />
          </mesh>
        )),
      )}
      <group scale={p}>
        <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.26, 1.05, 32]} />
          <meshStandardMaterial color="#f4f0da" roughness={0.6} />
        </mesh>
        {[0.51, 0.85].map((z) => (
          <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.222, 0.235, 0.16, 32]} />
            <meshStandardMaterial color="#a75a44" />
          </mesh>
        ))}
        <mesh position={[0, 0, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.19, 24]} />
          <meshStandardMaterial color="#3b5047" />
        </mesh>
        <mesh position={[0, 0, 1.35]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#fff0ad" />
        </mesh>
        <mesh position={[0, 0, 1.56]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.29, 0.28, 24]} />
          <meshStandardMaterial color="#a4523f" />
        </mesh>
        <group position={[0, 0, 1.35]} rotation={[0, 0, (frame - 730) * 0.025]}>
          <mesh position={[0, 1.06, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.35, 2.1, 24, 1, true]} />
            <meshBasicMaterial
              color="#fff2b0"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
const Pin = ({ frame, from }: { frame: number; from: number }) => {
  const p = Math.max(0.001, pop(frame, from));
  return (
    <group scale={p}>
      <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.66, 16]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0, 0.94]}>
        <sphereGeometry args={[0.105, 24, 24]} />
        <meshBasicMaterial color={WHITE} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          position={[0, 0, 0.25]}
          scale={1 + (((frame - from + i * 30) % 60) / 60) * 0.8}
        >
          <torusGeometry args={[0.22, 0.013, 8, 48]} />
          <meshBasicMaterial
            color={WHITE}
            transparent
            opacity={0.7 * (1 - ((frame - from + i * 30) % 60) / 60)}
          />
        </mesh>
      ))}
    </group>
  );
};
const JourneyWorld = ({ frame }: { frame: number }) => {
  const texture = useMemo(paperTexture, []),
    q = focus(frame),
    stop = active(frame);
  const map = useMemo(
    () =>
      countries.map((country, i) => {
        const model = makeCountryGeometry(country.parts);
        model.geometry.computeBoundingBox();
        return {
          ...country,
          ...model,
          width:
            model.geometry.boundingBox!.max.x -
            model.geometry.boundingBox!.min.x,
          index: i,
        };
      }),
    [],
  );
  const path = useMemo(
    () =>
      [
        [31.2, 30.04],
        [19, 21],
        [7.4, 9.08],
        [16, -10],
        [20, -34.83],
      ].map((p) => {
        const xy = mapPosition(p);
        return [xy[0], xy[1], 0.48] as V;
      }),
    [],
  );
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(path.map(vec)),
    [path],
  );
  const routeProgress =
    frame < 110
      ? ease(frame, [61, 108], [0, 1])
      : ease(frame, [877, 942], [0, 1]);
  return (
    <group
      rotation={rotation(frame)}
      position={[0, ease(frame, [0, 35], [-0.5, 0]), 0]}
    >
      <mesh position={[0, 0, -0.08]} receiveShadow>
        <boxGeometry args={[7.5, 7.4, 0.1]} />
        <meshStandardMaterial map={texture} color="#fffdf2" roughness={1} />
      </mesh>
      {[3.7, -3.7].map((y) => (
        <group key={y} position={[0, y, 0.01]}>
          <Rod a={[-3.9, 0, 0]} b={[3.9, 0, 0]} r={0.09} color="#a07b4d" />
          <Rod
            a={[-3.8, -0.035, 0.075]}
            b={[3.8, -0.035, 0.075]}
            r={0.013}
            color="#d0ac75"
          />
        </group>
      ))}
      <Rod a={[-3.2, 3.7, -0.04]} b={[0, 4.3, -0.04]} r={0.015} />
      <Rod a={[0, 4.3, -0.04]} b={[3.2, 3.7, -0.04]} r={0.015} />
      {map.map((c) => {
        const pose = countryPose(frame, c.id, c.center, c.width),
          arrive =
            frame < 100
              ? Math.max(0.001, pop(frame, 9 + Math.floor(rnd(c.index) * 30)))
              : 1,
          isActive = c.id === stop?.id;
        const color = new THREE.Color(
            ["SAH", "SOL"].includes(c.id)
              ? "#b9c196"
              : isActive
                ? "#a8dc3b"
                : "#9ed32b",
          ),
          anchor = isActive ? mapPosition(stop!.anchor) : [0, 0],
          effects = isActive ? lin(q, [0.65, 1], [0, 1]) : 0;
        return (
          <group
            key={c.id}
            visible={pose.alpha > 0.001}
            position={[
              pose.position[0],
              pose.position[1],
              pose.position[2] + (1 - arrive) * 1.6,
            ]}
            scale={[
              pose.scale * arrive * 0.983,
              pose.scale * arrive * 0.983,
              1,
            ]}
          >
            <mesh geometry={c.geometry} castShadow receiveShadow>
              <meshStandardMaterial
                attach="material-0"
                color={color}
                roughness={0.35}
                transparent
                opacity={pose.alpha}
              />
              <meshStandardMaterial
                attach="material-1"
                color="#70a825"
                roughness={0.6}
                transparent
                opacity={pose.alpha}
              />
            </mesh>
            {isActive && stop && effects > 0.001 && (
              <group scale={effects}>
                {stop.id === "EGY" && <Nile frame={frame} center={c.center} />}
                <group
                  position={[
                    anchor[0] - c.center[0],
                    anchor[1] - c.center[1],
                    0,
                  ]}
                  scale={[1 / pose.scale, 1 / pose.scale, 1]}
                >
                  {stop.id === "EGY" && (
                    <group position={[-1.05, -0.6, 0]}>
                      <Pyramid
                        x={0}
                        y={0}
                        size={0.9}
                        frame={frame}
                        from={222}
                      />
                      <Pyramid
                        x={-0.75}
                        y={-0.35}
                        size={0.63}
                        frame={frame}
                        from={238}
                      />
                      <Pyramid
                        x={0.43}
                        y={-0.65}
                        size={0.44}
                        frame={frame}
                        from={253}
                      />
                    </group>
                  )}
                  {stop.id === "NGA" && <City frame={frame} />}{" "}
                  {stop.id === "ZAF" && <Coast frame={frame} />}
                  <Pin
                    frame={frame}
                    from={
                      stop.id === "EGY" ? 285 : stop.id === "NGA" ? 531 : 774
                    }
                  />
                </group>
              </group>
            )}
          </group>
        );
      })}
      {(frame < 110 || frame > 865) && (
        <group scale={1 - q}>
          <Curve
            points={path}
            progress={routeProgress}
            color="#f6ffdc"
            radius={0.023}
          />
          {routeProgress > 0 && (
            <mesh position={curve.getPoint(routeProgress)}>
              <sphereGeometry args={[0.085, 20, 20]} />
              <meshBasicMaterial color={GREEN} />
            </mesh>
          )}
          {stops.map((s, i) => {
            const xy = mapPosition(s.anchor),
              p =
                frame < 110 ? pop(frame, 55 + i * 9) : pop(frame, 887 + i * 10);
            return (
              <group
                key={s.id}
                position={[xy[0], xy[1], 0.34]}
                scale={Math.max(0.001, p)}
              >
                <mesh>
                  <torusGeometry args={[0.11, 0.025, 8, 32]} />
                  <meshBasicMaterial color={WHITE} />
                </mesh>
                <mesh position={[0, 0, 0.05]}>
                  <sphereGeometry args={[0.055, 16, 16]} />
                  <meshBasicMaterial color={GREEN} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};
function project(f: number, p: V) {
  const cam = new THREE.PerspectiveCamera(38, 1080 / HEIGHT, 0.1, 100);
  cam.position.set(...cameraAt(f));
  cam.lookAt(0, 0.3, 0);
  cam.updateMatrixWorld();
  const v = vec(p).applyEuler(new THREE.Euler(...rotation(f)));
  v.y += ease(f, [0, 35], [-0.5, 0]);
  v.project(cam);
  return [(v.x + 1) * 540, TOP + ((1 - v.y) * HEIGHT) / 2];
}
const LocationLabel = ({ frame }: { frame: number }) => {
  const s = active(frame),
    c = useMemo(() => {
      if (!s) return null;
      const model = makeCountryGeometry(
        countries.find((c) => c.id === s.id)!.parts,
      );
      model.geometry.computeBoundingBox();
      return {
        ...model,
        width:
          model.geometry.boundingBox!.max.x - model.geometry.boundingBox!.min.x,
      };
    }, [s]);
  if (!s || !c) return null;
  const from = s.id === "EGY" ? 285 : s.id === "NGA" ? 531 : 774,
    a = ease(frame, [from, from + 15, s.to - 35, s.to - 10], [0, 1, 1, 0]);
  if (a < 0.001) return null;
  const xy = mapPosition(s.anchor),
    pose = countryPose(frame, s.id, c.center, c.width),
    p: V = [
      pose.position[0] + (xy[0] - c.center[0]) * pose.scale * 0.983,
      pose.position[1] + (xy[1] - c.center[1]) * pose.scale * 0.983,
      pose.position[2] + 0.94,
    ];
  const [x, y] = project(frame, p),
    tx = Math.max(240, Math.min(835, x + (s.id === "NGA" ? -190 : 200))),
    ty = y - 75;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width="1080" height="1920">
        <path
          d={`M${x} ${y}L${x + (tx > x ? 40 : -40)} ${ty + 20}H${tx}`}
          stroke={WHITE}
          strokeWidth="2"
          fill="none"
        />
        <circle cx={x} cy={y} r="5" fill={WHITE} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: tx - 150,
          top: ty - 25,
          width: 300,
          height: 72,
          display: "grid",
          placeItems: "center",
          background: "#313b2d",
          border: `1px solid ${GREEN}`,
          borderRadius: 16,
          fontFamily: "SceneBold",
          fontSize: 35,
          boxShadow: "0 8px 20px #0005",
        }}
      >
        {s.city}
      </div>
    </div>
  );
};
const Caption = ({ frame }: { frame: number }) => {
  const s = active(frame),
    q = focus(frame),
    isEnd = frame >= 865,
    start = s ? s.from + 45 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 95,
        right: 95,
        top: 1570,
        textAlign: "center",
      }}
    >
      {s ? (
        <div
          style={{
            opacity: ease(
              frame,
              [start, start + 18, s.to - 32, s.to - 8],
              [0, 1, 1, 0],
            ),
            translate: `0 ${20 * (1 - q)}px`,
          }}
        >
          {s.id === "ZAF" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 30,
                marginBottom: 24,
                fontSize: 28,
                fontFamily: "SceneBold",
              }}
            >
              <span style={{ color: "#83c6ef" }}>ATLANTIK</span>
              <span style={{ color: "#84e9dc" }}>INDISCHER OZEAN</span>
            </div>
          )}
          <div
            style={{ fontFamily: "SceneBold", fontSize: 49, lineHeight: 1.15 }}
          >
            {s.fact}
          </div>
          <div style={{ fontSize: 33, color: "#d4dcc9", marginTop: 18 }}>
            {s.detail}
          </div>
        </div>
      ) : isEnd ? (
        <div style={{ opacity: ease(frame, [900, 925], [0, 1]) }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{ fontFamily: "SceneBold", fontSize: 98, color: GREEN }}
            >
              {Math.round(ease(frame, [912, 957], [3, 54]))}
            </div>
            <div
              style={{
                textAlign: "left",
                fontFamily: "SceneBold",
                fontSize: 35,
                lineHeight: 1.18,
              }}
            >
              afrikanische
              <br />
              UN-Mitgliedstaaten
            </div>
          </div>
          <div style={{ fontSize: 42, fontFamily: "SceneBold", marginTop: 14 }}>
            Viele Länder. Viele Geschichten.
          </div>
        </div>
      ) : (
        <div style={{ opacity: ease(frame, [15, 35], [0, 1]) }}>
          <div style={{ fontFamily: "SceneBold", fontSize: 56 }}>
            Ein Kontinent.
          </div>
          <div style={{ fontSize: 37, color: "#d4dcc9", marginTop: 14 }}>
            Drei Stationen. Drei Geschichten.
          </div>
        </div>
      )}
    </div>
  );
};
export const AfricaJourney = () => {
  const f = useCurrentFrame(),
    s = active(f);
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
            "radial-gradient(ellipse at 50% 43%,#4a513d,#30382d 55%,#20261f)",
        }}
      />
      <Doodles />
      <div
        style={{
          position: "absolute",
          top: 94,
          left: 90,
          right: 90,
          textAlign: "center",
          opacity: ease(f, [0, 12], [0, 1]),
        }}
      >
        <div
          style={{
            fontFamily: "SceneBold",
            fontSize: 28,
            letterSpacing: 5,
            color: "#c4d0b4",
            marginBottom: 24,
          }}
        >
          {s ? s.region : "EINE REISE DURCH"}
        </div>
        <div
          style={{
            fontFamily: "SceneBold",
            fontSize: s?.id === "ZAF" ? 88 : 106,
            lineHeight: 1,
            letterSpacing: 1,
            scale: 1 + 0.018 * Math.sin(f / 90),
          }}
        >
          {s ? s.name : "AFRIKA"}
        </div>
        <div
          style={{
            fontFamily: "SceneSerif",
            fontStyle: "italic",
            fontSize: 70,
            color: GREEN,
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {s
            ? s.id === "EGY"
              ? "am Nil"
              : s.id === "NGA"
                ? "die Hauptstadt"
                : "am Kap"
            : "drei Stationen"}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: TOP,
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
          <ambientLight color="#fffde8" intensity={0.85} />
          <directionalLight
            position={[-4, 7, 8]}
            intensity={2.7}
            color="#fff9df"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-bias={-0.00025}
          />
          <directionalLight
            position={[4, -1, 5]}
            intensity={0.5}
            color="#d9f3ba"
          />
          <JourneyWorld frame={f} />
        </ThreeCanvas>
      </div>
      <LocationLabel frame={f} />
      <Caption frame={f} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 90,
          display: "flex",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {stops.map((stop) => {
          const p =
            f >= stop.to
              ? 1
              : stop.id === s?.id
                ? lin(f, [stop.from, stop.to], [0, 1])
                : 0;
          return (
            <div
              key={stop.id}
              style={{
                height: 5,
                width: 170,
                borderRadius: 3,
                background: "#76836a38",
                overflow: "hidden",
              }}
            >
              <div
                style={{ height: 5, width: `${p * 100}%`, background: GREEN }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 65,
          right: 65,
          bottom: 41,
          textAlign: "center",
          fontSize: 19,
          color: "#acb99d",
        }}
      >
        Stilisierte Miniaturen · vereinfachte Karte · Quellen: SIS, FCTA,
        SANParks, UN
      </div>
      <Audio src={staticFile("audio/africa-journey.wav")} volume={1} />
    </AbsoluteFill>
  );
};
