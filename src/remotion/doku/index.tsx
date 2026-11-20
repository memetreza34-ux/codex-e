import {
  AbsoluteFill,
  Composition,
  interpolate,
  registerRoot,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import "../fonts";

const schema = z.object({
  headline: z.string().trim().min(1).max(80),
  source: z.string().trim().min(1).max(130),
  fps: z.number().int().min(12).max(60).default(25),
  seconds: z.number().min(1).max(30).default(5),
});

function Quellenbeleg({ headline, source }: z.output<typeof schema>) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const fade = Math.round(fps * 0.25);
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade - 1, durationInFrames - 1],
    [0, 1, 1, 0],
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "0 112px 96px",
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: 1230,
          backgroundColor: "#171815",
          borderLeft: "10px solid #d9e8a2",
          padding: "30px 38px",
          color: "#faf8f1",
          overflowWrap: "anywhere",
        }}
      >
        <div
          style={{ fontFamily: "SceneBold", fontSize: 51, lineHeight: 1.13 }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: "SceneSans",
            fontSize: 30,
            lineHeight: 1.25,
            color: "#d9e8a2",
            marginTop: 15,
          }}
        >
          {source}
        </div>
      </div>
    </AbsoluteFill>
  );
}

registerRoot(() => (
  <Composition
    id="Quellenbeleg"
    component={Quellenbeleg}
    schema={schema}
    width={1920}
    height={1080}
    fps={25}
    durationInFrames={125}
    defaultProps={{
      headline: "Auszug aus dem Dokument",
      source: "Herausgeber · Datum · Seite",
      fps: 25,
      seconds: 5,
    }}
    calculateMetadata={({ props }) => {
      const data = schema.parse(props);
      return {
        props: data,
        fps: data.fps,
        durationInFrames: Math.round(data.fps * data.seconds),
      };
    }}
  />
));
