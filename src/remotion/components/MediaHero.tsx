import type { CSSProperties } from "react";
import {
  CanvasImage,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export function MediaHero({
  src,
  style,
}: {
  src: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  return (
    <CanvasImage
      src={staticFile(src)}
      style={{
        width: 850,
        height: 850,
        objectFit: "contain",
        scale: interpolate(frame, [0, 75], [0.88, 1.035], {
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    />
  );
}
