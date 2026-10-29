import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CanvasImage,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AssetEnvironment, ModelAsset } from "../components/ModelAsset";
import "../fonts";

const LIME = "#b8ee66",
  PAPER = "#f1efdf";
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const val = (f: number, a: number[], b: number[]) => interpolate(f, a, b, C);
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...C, easing: Easing.bezier(0.22, 0.7, 0.2, 1) });
const pop = (f: number, start: number) =>
  spring({
    fps: 30,
    frame: f - start,
    config: { mass: 0.8, damping: 18, stiffness: 120 },
  });
const range = (f: number, a: number, b: number) =>
  val(f, [a, a + 16, b - 16, b], [0, 1, 1, 0]);

function paperTexture(day: number, green = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = green ? "#d7edaf" : "#eeeada";
  ctx.fillRect(0, 0, 1000, 1120);
  const shade = ctx.createLinearGradient(0, 0, 1000, 1120);
  shade.addColorStop(0, "#ffffff24");
  shade.addColorStop(0.5, "#ffffff00");
  shade.addColorStop(1, "#59491a13");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 1000, 1120);
  for (let i = 0; i < 18000; i++) {
    const x = (i * 137.31) % 1000,
      y = (i * 63.19) % 1120;
    ctx.fillStyle = i % 2 ? "#fff4" : "#80775a0b";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.fillStyle = green ? "#405632" : "#35453b";
  ctx.fillRect(0, 0, 1000, 258);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f3f2e5";
  ctx.font = "700 90px Arial";
  ctx.fillText("FEBRUAR", 500, 184);
  ctx.fillStyle = green ? "#24371d" : "#29332d";
  ctx.font = "700 535px Arial";
  ctx.fillText(String(day), 500, 790);
  ctx.font = "38px Arial";
  ctx.fillStyle = "#5b6655";
  ctx.fillText("2028", 500, 1000);
  ctx.strokeStyle = "#8c917450";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 897);
  ctx.lineTo(860, 897);
  ctx.stroke();
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function Page({
  day,
  green = false,
  flip = 0,
  z = 0.18,
}: {
  day: number;
  green?: boolean;
  flip?: number;
  z?: number;
}) {
  const texture = useMemo(() => paperTexture(day, green), [day, green]);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(4.05, 4.5, 22, 28);
    g.translate(0, -2.25, 0);
    return g;
  }, []);
  useMemo(() => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = -p.getY(i) / 4.5;
      p.setZ(i, Math.sin(Math.PI * flip) * 0.42 * t * t);
    }
    geo.computeVertexNormals();
  }, [geo, flip]);
  useEffect(
    () => () => {
      texture.dispose();
      geo.dispose();
    },
    [texture, geo],
  );
  return (
    <group position={[0, 2.25, z]} rotation={[-flip * Math.PI * 1.04, 0, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial
          map={texture}
          roughness={0.84}
          side={THREE.FrontSide}
          transparent={flip > 0.48}
          opacity={val(flip, [0.48, 0.65], [1, 0])}
        />
      </mesh>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color="#e8e4d3"
          roughness={0.9}
          side={THREE.BackSide}
          transparent={flip > 0.48}
          opacity={val(flip, [0.48, 0.65], [1, 0])}
        />
      </mesh>
    </group>
  );
}
function Calendar({ frame: f }: { frame: number }) {
  const phase = f < 135 ? "intro" : "flip";
  const flip27 = ease(f, [533, 559], [0, 1]),
    flip28 = ease(f, [582, 612], [0, 1]);
  const exit = val(f, [120, 143], [0, 1]);
  const arrival = pop(f, 492);
  const settle = ease(f, [705, 753], [0, 1]);
  const size =
    phase === "intro" ? 0.96 + pop(f, 0) * 0.05 : arrival * (1 - settle * 0.42);
  const x = phase === "intro" ? -exit * 5.5 : -settle * 1.08;
  return (
    <group
      position={[
        x,
        phase === "intro"
          ? 0.1
          : val(f, [492, 518], [0.6, 0.08]) + settle * 0.2,
        0,
      ]}
      scale={Math.max(0.001, size)}
      rotation={[
        -0.07,
        phase === "intro"
          ? ease(f, [0, 120], [-0.32, 0.12])
          : ease(f, [492, 700], [-0.22, 0.16]) - settle * 0.1,
        -0.045 + Math.sin(f / 90) * 0.018,
      ]}
    >
      <mesh position={[0, -0.1, -0.13]} castShadow>
        <boxGeometry args={[4.32, 4.8, 0.2]} />
        <meshStandardMaterial
          color="#34453a"
          roughness={0.42}
          metalness={0.15}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, -0.04 - i * 0.018, 0.02 + i * 0.019]}>
          <boxGeometry args={[4.12, 4.5, 0.025]} />
          <meshStandardMaterial
            color={i % 2 ? "#dad5c1" : "#e8e4d3"}
            roughness={0.9}
          />
        </mesh>
      ))}
      <Page day={29} green={phase !== "intro" && f > 615} z={0.22} />
      {phase !== "intro" && f < 612 && <Page day={28} flip={flip28} z={0.25} />}
      {phase !== "intro" && f < 559 && <Page day={27} flip={flip27} z={0.28} />}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[-1.7 + i * 0.425, 2.17, 0.01]}>
          <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.155, 0.035, 10, 32]} />
            <meshStandardMaterial
              color="#c8b683"
              metalness={0.85}
              roughness={0.22}
            />
          </mesh>
          <mesh position={[0, -0.02, 0.24]}>
            <sphereGeometry args={[0.061, 12, 10]} />
            <meshStandardMaterial color="#354035" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -2.52, -0.12]} castShadow>
        <boxGeometry args={[4.8, 0.18, 1.1]} />
        <meshStandardMaterial color="#202d24" metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}
function ClockObject({
  frame: f,
  onReady,
}: {
  frame: number;
  onReady: () => void;
}) {
  const enter = pop(f, 315),
    exit = ease(f, [476, 501], [0, 1]);
  const hours = val(f, [327, 447], [0, 24]);
  return (
    <group
      scale={Math.max(0.001, 1.43 * enter * (1 - exit))}
      position={[0, 0.12, exit * 2]}
      rotation={[0.06, ease(f, [315, 490], [-0.22, 0.2]), -0.04]}
    >
      <ModelAsset
        src="assets/library/studio-clock.glb"
        onReady={onReady}
        nodeRotations={{
          hour_hand: [0, 0, (-hours * Math.PI) / 6],
          minute_hand: [0, 0, -hours * Math.PI * 2],
          second_hand: [0, 0, -f * 0.09],
        }}
      />
    </group>
  );
}
function Stage({ frame: f }: { frame: number }) {
  const [modelHandle] = useState(() => delayRender("Schalttag Uhr vor Canvas"));
  const [lightHandle] = useState(() =>
    delayRender("Schalttag Licht vor Canvas"),
  );
  const modelReady = useCallback(
    () => continueRender(modelHandle),
    [modelHandle],
  );
  const lightReady = useCallback(
    () => continueRender(lightHandle),
    [lightHandle],
  );
  useEffect(
    () => () => {
      continueRender(modelHandle);
      continueRender(lightHandle);
    },
    [modelHandle, lightHandle],
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 260,
        width: 1080,
        height: 1190,
      }}
    >
      <ThreeCanvas
        width={1080}
        height={1190}
        shadows
        camera={{ position: [0, 0.05, 9.6], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <AssetEnvironment
          src="assets/library/studio-small-09.hdr"
          onReady={lightReady}
        />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[-4, 6, 8]}
          intensity={2.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.001}
        />
        <directionalLight
          position={[4, 2, 3]}
          intensity={0.7}
          color="#bfdf96"
        />
        <ClockObject frame={f} onReady={modelReady} />
        {(f < 150 || f >= 492) && <Calendar frame={f} />}
      </ThreeCanvas>
    </div>
  );
}
function Earth({ size = 160 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "0 0 30px #78acbe25",
      }}
    >
      <CanvasImage
        src={staticFile("assets/library/earth-apollo.jpg")}
        style={{
          width: "114%",
          height: "114%",
          marginLeft: "-7%",
          marginTop: "-7%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
function Orbit({ frame: f }: { frame: number }) {
  const opacity = range(f, 137, 320),
    t = val(f, [153, 282], [0, Math.PI * 2]),
    cx = 540,
    cy = 840,
    rx = 350,
    ry = 220;
  const ex = cx + rx * Math.cos(t),
    ey = cy + ry * Math.sin(t);
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="1080" height="1500" style={{ position: "absolute", top: 0 }}>
        <defs>
          <radialGradient id="sun">
            <stop offset="0" stopColor="#fff2ab" />
            <stop offset=".65" stopColor="#e7b951" />
            <stop offset="1" stopColor="#a87624" />
          </radialGradient>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#677858"
          strokeWidth="3"
          strokeDasharray="7 10"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={LIME}
          strokeWidth="5"
          pathLength="1"
          strokeDasharray={`${val(f, [153, 282], [0, 1])} 1`}
          style={{ filter: "drop-shadow(0 0 8px #b8ee6640)" }}
        />
        <circle cx={cx} cy={cy} r="116" fill="#f0c75b0c" />
        <circle cx={cx} cy={cy} r="90" fill="url(#sun)" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6 + f * 0.002;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * 108}
              y1={cy + Math.sin(a) * 108}
              x2={cx + Math.cos(a) * 123}
              y2={cy + Math.sin(a) * 123}
              stroke="#c99e4e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: ex - 82,
          top: ey - 82,
          scale: val(f, [145, 164], [0.3, 1]),
        }}
      >
        <Earth />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1125,
          width: "100%",
          textAlign: "center",
          fontSize: 27,
          color: "#97a28e",
        }}
      >
        Umlauf im Zeitraffer · schematisch
      </div>
    </AbsoluteFill>
  );
}
function TimeCollection({ frame: f }: { frame: number }) {
  const alpha = range(f, 315, 497),
    r = 385,
    circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <svg width="1080" height="1500" style={{ position: "absolute" }}>
        <circle
          cx="540"
          cy="850"
          r={r}
          fill="none"
          stroke="#64745438"
          strokeWidth="13"
        />
        <circle
          cx="540"
          cy="850"
          r={r}
          fill="none"
          stroke={LIME}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${circ * val(f, [335, 453], [0, 1])} ${circ}`}
          transform="rotate(-90 540 850)"
        />
      </svg>
      {[2025, 2026, 2027, 2028].map((year, i) => {
        const start = 328 + i * 29,
          p = pop(f, start),
          merge = ease(f, [start + 25, start + 44], [0, 1]);
        const left = i % 2 === 0 ? 92 : 756,
          top = i < 2 ? 456 : 1105;
        return (
          <div
            key={year}
            style={{
              position: "absolute",
              left: interpolate(merge, [0, 1], [left, 440]),
              top: interpolate(merge, [0, 1], [top, 760]),
              width: 232,
              textAlign: "center",
              opacity: p * (1 - merge),
              scale: Math.max(0.01, p) * (1 - 0.4 * merge),
            }}
          >
            <div
              style={{ color: PAPER, fontSize: 48, fontFamily: "SceneBold" }}
            >
              {year}
            </div>
            <div style={{ color: LIME, fontSize: 36, marginTop: 7 }}>≈ 6 h</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
function Caption({
  top = 1390,
  children,
  opacity = 1,
}: {
  top?: number;
  children: React.ReactNode;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 75,
        width: 930,
        textAlign: "center",
        color: PAPER,
        opacity,
      }}
    >
      {children}
    </div>
  );
}
function Type({ frame: f }: { frame: number }) {
  return (
    <>
      <Caption top={207} opacity={range(f, 0, 141)}>
        <div
          style={{ fontSize: 67, fontFamily: "SceneBold", lineHeight: 1.13 }}
        >
          Warum gibt es
          <br />
          diesen Tag?
        </div>
      </Caption>
      <Caption top={1390} opacity={range(f, 15, 140)}>
        <div style={{ fontSize: 33, color: "#a8b29d", letterSpacing: 3 }}>
          29. FEBRUAR
        </div>
      </Caption>
      <Caption top={275} opacity={range(f, 145, 316)}>
        <div style={{ fontSize: 32, color: "#a8b29d", letterSpacing: 4 }}>
          EIN SONNENJAHR
        </div>
        <div style={{ fontFamily: "SceneBold", fontSize: 112, marginTop: 20 }}>
          365 <span style={{ fontSize: 52 }}>Tage</span>
        </div>
        <div
          style={{
            fontSize: 54,
            color: LIME,
            marginTop: 7,
            opacity: val(f, [235, 253], [0, 1]),
            translate: `0 ${ease(f, [235, 253], [30, 0])}px`,
          }}
        >
          + knapp 6 Stunden
        </div>
      </Caption>
      <Caption top={1370} opacity={range(f, 155, 316)}>
        <div style={{ fontSize: 37 }}>Das passt nicht in ganze Tage.</div>
      </Caption>
      <Caption top={225} opacity={range(f, 318, 496)}>
        <div style={{ fontSize: 55, fontFamily: "SceneBold" }}>
          Vier Jahre sammeln Zeit.
        </div>
      </Caption>
      <Caption top={1370} opacity={range(f, 354, 497)}>
        <div style={{ fontSize: 105, fontFamily: "SceneBold", color: LIME }}>
          ≈ {Math.round(val(f, [335, 453], [0, 24]))}{" "}
          <span style={{ fontSize: 46 }}>Stunden</span>
        </div>
        <div style={{ fontSize: 29, color: "#9eac93", marginTop: 12 }}>
          Gerundete Zeitanteile
        </div>
      </Caption>
      <Caption
        top={218}
        opacity={
          range(f, 500, 711) * val(f, [525, 532, 612, 620], [1, 0, 0, 1])
        }
      >
        <div style={{ fontSize: 61, fontFamily: "SceneBold" }}>
          Daraus wird ein Extratag.
        </div>
      </Caption>
      <div
        style={{
          position: "absolute",
          left: 695,
          top: 1135,
          width: 230,
          height: 230,
          borderRadius: "50%",
          background: LIME,
          color: "#26351f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          rotate: "-12deg",
          scale: Math.max(0.001, pop(f, 624)),
          opacity: range(f, 618, 711),
          boxShadow: "0 20px 60px #0005",
        }}
      >
        <div style={{ fontFamily: "SceneBold", fontSize: 86, lineHeight: 1 }}>
          +1
        </div>
        <div style={{ fontSize: 35, fontFamily: "SceneBold", marginTop: 10 }}>
          TAG
        </div>
      </div>
      <Caption top={1403} opacity={range(f, 503, 711)}>
        <div style={{ fontSize: 39 }}>Der Februar bekommt die 29.</div>
      </Caption>
      <Caption top={223} opacity={val(f, [718, 740], [0, 1])}>
        <div style={{ fontSize: 73, fontFamily: "SceneBold" }}>
          Wieder im Takt.
        </div>
        <div style={{ fontSize: 37, color: "#b6c2a6", marginTop: 21 }}>
          Kalender und Jahreszeiten
        </div>
      </Caption>
      <Caption top={1260} opacity={val(f, [748, 771], [0, 1])}>
        <div style={{ fontSize: 47, fontFamily: "SceneBold" }}>
          Meist alle vier Jahre.
        </div>
      </Caption>
      <Caption top={1395} opacity={val(f, [780, 798], [0, 1])}>
        <div style={{ fontSize: 33, color: "#adbaa0", lineHeight: 1.35 }}>
          Volle Jahrhunderte nur,
          <br />
          wenn durch 400 teilbar.
        </div>
        <div
          style={{
            display: "flex",
            gap: 35,
            justifyContent: "center",
            marginTop: 35,
          }}
        >
          {[
            ["2028", true],
            ["2100", false],
            ["2400", true],
          ].map(([year, yes]) => (
            <div
              key={String(year)}
              style={{
                fontSize: 37,
                color: yes ? LIME : "#98a58e",
                fontFamily: "SceneBold",
              }}
            >
              {year} {yes ? "✓" : "×"}
            </div>
          ))}
        </div>
      </Caption>
    </>
  );
}
function Finale({ frame: f }: { frame: number }) {
  const p = ease(f, [716, 754], [0, 1]);
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <div
        style={{
          position: "absolute",
          left: 615,
          top: 735,
          scale: 0.8 + 0.2 * p,
          rotate: `${val(f, [716, 899], [-12, 7])}deg`,
        }}
      >
        <Earth size={280} />
      </div>
      <svg width="1080" height="1400" style={{ position: "absolute" }}>
        <path
          d="M540 850 C590 790 640 780 700 800"
          fill="none"
          stroke={LIME}
          strokeWidth="5"
          pathLength="1"
          strokeDasharray={`${val(f, [744, 780], [0, 1])} 1`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 673,
          top: 1070,
          color: "#afbf9e",
          fontSize: 28,
        }}
      >
        JAHRESZEITEN
      </div>
    </AbsoluteFill>
  );
}
export function LeapDay() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 48% 42%,#35422e 0%,#202b22 43%,#101a14 85%)",
        overflow: "hidden",
        fontFamily: "SceneSans",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' filter='url(%23n)' opacity='.32' d='M0 0h180v180H0z'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 1180,
          width: 820,
          height: 100,
          background: "#07100c7a",
          filter: "blur(40px)",
          borderRadius: "50%",
        }}
      />
      <Stage frame={f} />
      <Orbit frame={f} />
      <TimeCollection frame={f} />
      <Finale frame={f} />
      <Type frame={f} />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 120,
          width: "100%",
          textAlign: "center",
          color: "#768b70",
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        EIN TAG AUS VIER JAHREN
      </div>
      <Audio src={staticFile("audio/leap-day.wav")} />
    </AbsoluteFill>
  );
}
