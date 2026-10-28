import { useState, useCallback, useEffect } from "react";
import {
  continueRender,
  delayRender,
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ACESFilmicToneMapping } from "three";
import { AssetEnvironment, ModelAsset } from "../components/ModelAsset";
import { MediaHero } from "../components/MediaHero";
import "../fonts";

function Label({
  kind,
  title,
  note,
}: {
  kind: string;
  title: string;
  note: string;
}) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 340,
        opacity: interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div
        style={{
          fontSize: 26,
          letterSpacing: 6,
          color: "#b9ee74",
          marginBottom: 24,
        }}
      >
        {kind}
      </div>
      <div style={{ fontSize: 76, fontFamily: "SceneBold", color: "#f5f3e9" }}>
        {title}
      </div>
      <div style={{ fontSize: 27, color: "#aeb9ae", marginTop: 22 }}>
        {note}
      </div>
    </AbsoluteFill>
  );
}
function Clock() {
  const f = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const [modelHandle] = useState(() => delayRender("Clock model mount"));
  const [lightHandle] = useState(() => delayRender("Clock environment mount"));
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
  const seconds = 10 + (f / fps) * 12;
  return (
    <AbsoluteFill style={{ top: 200, height: 1180 }}>
      <ThreeCanvas
        width={width}
        height={1180}
        camera={{ position: [0, 0, 5.6], fov: 44 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <AssetEnvironment
          src="assets/library/studio-small-09.hdr"
          onReady={lightReady}
        />
        <ambientLight intensity={0.45} />
        <directionalLight position={[-3, 4, 5]} intensity={2} />
        <directionalLight
          position={[3, -1, 2]}
          intensity={0.6}
          color="#b7df8c"
        />
        <ModelAsset
          src="assets/library/studio-clock.glb"
          onReady={modelReady}
          rotation={[0.06, interpolate(f, [0, 89], [-0.4, 0.35]), -0.04]}
          nodeRotations={{
            hour_hand: [
              0,
              0,
              (-Math.PI * 2 * (10 + 10 / 60 + seconds / 3600)) / 12,
            ],
            minute_hand: [0, 0, (-Math.PI * 2 * (10 + seconds / 60)) / 60],
            second_hand: [0, 0, (-Math.PI * 2 * seconds) / 60],
          }}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
}
export function HybridAssets() {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%,#283624 0%,#151c17 40%,#090e0b 85%)",
        fontFamily: "SceneSans",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 1120,
          width: 660,
          height: 110,
          borderRadius: "50%",
          background: "#a3d05e16",
          filter: "blur(55px)",
        }}
      />
      <Sequence from={0} durationInFrames={3 * fps} name="Echtes NASA-Foto">
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 355 }}>
          <MediaHero
            src="assets/library/earth-apollo.jpg"
            style={{ width: 820, height: 820, borderRadius: "50%" }}
          />
        </AbsoluteFill>
        <Label
          kind="FOTO"
          title="Unsere Erde."
          note="NASA · Apollo 17 · Public Domain"
        />
      </Sequence>
      <Sequence
        from={3 * fps}
        durationInFrames={3 * fps}
        name="Freigestellte Illustration"
      >
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 320 }}>
          <MediaHero
            src="assets/library/clock-cutout.png"
            style={{
              width: 900,
              height: 900,
              filter: "drop-shadow(0 40px 35px #0008)",
              rotate: "-8deg",
            }}
          />
        </AbsoluteFill>
        <Label
          kind="ILLUSTRATION"
          title="Ein klares Objekt."
          note="Vijay Verma · 3dicons · CC0"
        />
      </Sequence>
      <Sequence
        from={6 * fps}
        durationInFrames={3 * fps}
        name="Animierbares Blender-Modell"
      >
        <Clock />
        <Label
          kind="3D-MODELL"
          title="Zeit in Bewegung."
          note="Eigenes Blender-Modell · Zeitraffer"
        />
      </Sequence>
      <div
        style={{
          position: "absolute",
          bottom: 155,
          width: "100%",
          textAlign: "center",
          fontSize: 22,
          color: "#80907e",
          letterSpacing: 2,
        }}
      >
        MEDIENSTUDIE · 01
      </div>
    </AbsoluteFill>
  );
}
