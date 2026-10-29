import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { explainer as t } from "../styles/explainer";
export function ExplainerStage({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 42%,#30382c 0%,${t.background} 48%,#1a211d 100%)`,
        fontFamily: t.font,
        overflow: "hidden",
      }}
    >
      <svg
        width="1080"
        height="1920"
        style={{ position: "absolute", opacity: 0.075 }}
      >
        <defs>
          <pattern
            id="own-study-symbols"
            width="270"
            height="320"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="#b6c6ab"
              strokeWidth="1.1"
              strokeDasharray="4 6"
            >
              <circle cx="80" cy="83" r="53" />
              <circle cx="80" cy="83" r="32" />
              <path d="M20 83h120M80 23v120M28 225q100-120 200-45t-70 120" />
            </g>
            <g fill="none" stroke="#b6c6ab" strokeWidth="1.1">
              <path d="M186 45l44 20-38 15 11-25-17-10m-34 113h54v37h-54zM173 160v32M160 171h39" />
            </g>
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#own-study-symbols)" />
      </svg>
      {children}
    </AbsoluteFill>
  );
}
export function RolePill({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div
      style={{
        height: 86,
        padding: "0 25px 0 10px",
        borderRadius: 50,
        background: active ? t.accent : t.foreground,
        color: "#20271d",
        display: "inline-flex",
        gap: 16,
        alignItems: "center",
        fontFamily: t.bold,
        fontSize: 44,
        boxShadow: active ? "0 0 42px #a3ef1845" : "0 12px 24px #0004",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#36402e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#eff1e9",
          fontSize: 40,
        }}
      >
        ○
      </div>
      {children}
    </div>
  );
}
