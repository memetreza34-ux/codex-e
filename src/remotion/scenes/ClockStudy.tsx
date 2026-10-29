import { useCallback, useEffect, useState } from "react";
import {
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  AbsoluteFill,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ACESFilmicToneMapping, DoubleSide } from "three";
import { AssetEnvironment, ModelAsset } from "../components/ModelAsset";
import { ExplainerStage, RolePill } from "../components/ExplainerStage";
import { explainer as t } from "../styles/explainer";
import "../fonts";
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...C, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
function MovingClock() {
  const f = useCurrentFrame(),
    p = ease(f, [54, 156], [0, 1]);
  const [model] = useState(() => delayRender("Clock study model")),
    [light] = useState(() => delayRender("Clock study light"));
  const ready = useCallback(() => continueRender(model), [model]),
    lit = useCallback(() => continueRender(light), [light]);
  useEffect(
    () => () => {
      continueRender(model);
      continueRender(light);
    },
    [model, light],
  );
  const arrival = spring({
      frame: f,
      fps: 30,
      config: { damping: 22, stiffness: 125 },
    }),
    angle = Math.max(0.00001, (p * Math.PI) / 2);
  return (
    <div
      style={{
        position: "absolute",
        top: 125,
        width: 1080,
        height: 1280,
        scale: 0.88 + 0.12 * arrival,
        translate: `0 ${ease(f, [0, 26], [65, 0])}px`,
      }}
    >
      <ThreeCanvas
        width={1080}
        height={1280}
        camera={{ position: [0, 0, 8.3], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
      >
        <AssetEnvironment
          src="assets/library/studio-small-09.hdr"
          onReady={lit}
        />
        <ambientLight intensity={0.6} />
        <directionalLight position={[-3, 5, 6]} intensity={1.8} />
        <group rotation={[0.015, ease(f, [0, 270], [-0.1, 0.08]), -0.015]}>
          <ModelAsset
            src="assets/library/minimal-clock.glb"
            onReady={ready}
            nodeRotations={{
              hour_hand: [0, 0, (-(2 + p * 0.25) * Math.PI) / 6],
              minute_hand: [0, 0, (-p * Math.PI) / 2],
              second_hand: [0, 0, -f * 0.035],
            }}
          />
          <mesh position={[0, 0, 0.224]}>
            <circleGeometry args={[1.24, 96, Math.PI / 2 - angle, angle]} />
            <meshBasicMaterial
              color={t.accent}
              transparent
              opacity={0.42 * p}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        </group>
      </ThreeCanvas>
    </div>
  );
}
export function ClockStudy() {
  const f = useCurrentFrame(),
    p = ease(f, [54, 156], [0, 1]),
    minutes = Math.round(15 * p),
    active = f > 150;
  return (
    <ExplainerStage>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 410,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: t.accent,
          opacity: 0.05 + 0.07 * p,
          filter: "blur(90px)",
        }}
      />
      <MovingClock />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1165 }}>
        <div
          style={{
            background: active ? t.accent : t.badge,
            color: active ? "#1f2d16" : t.foreground,
            fontFamily: t.bold,
            fontSize: 62,
            padding: "10px 40px",
            borderRadius: 60,
            boxShadow: active ? "0 0 40px #acf02245" : "0 10px 25px #0004",
          }}
        >{`14:${String(minutes).padStart(2, "0")}`}</div>
        <div
          style={{
            marginTop: 80,
            scale: 0.92 + 0.08 * ease(f, [15, 40], [0, 1]),
            opacity: ease(f, [10, 28], [0, 1]),
          }}
        >
          <RolePill active={active}>Abfahrt</RolePill>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 220,
          width: "100%",
          textAlign: "center",
          opacity: ease(f, [25, 40, 80, 96], [0, 1, 1, 0]),
          fontFamily: t.bold,
          fontSize: 58,
          color: t.foreground,
        }}
      >
        Noch etwas Zeit.
      </div>
      <div
        style={{
          position: "absolute",
          top: 210,
          width: "100%",
          textAlign: "center",
          opacity: ease(f, [148, 170], [0, 1]),
          translate: `0 ${ease(f, [148, 170], [18, 0])}px`,
        }}
      >
        <div style={{ fontFamily: t.bold, fontSize: 48, color: t.foreground }}>
          15 Minuten
        </div>
        <div
          style={{
            fontFamily: t.serif,
            fontStyle: "italic",
            fontSize: 104,
            color: t.accent,
            lineHeight: 1.15,
          }}
        >
          später.
        </div>
      </div>
    </ExplainerStage>
  );
}
