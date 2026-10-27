import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import "../fonts";

const ink = "#111719",
  mint = "#96e1c1",
  paper = "#f2efe6",
  orange = "#ed926d";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const at = (f: number, a: number[], b: number[]) => interpolate(f, a, b, clamp);
const ease = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { ...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1) });

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path
      d="M1 1h14v14H1zm16 0h14v14H17zM1 17h14v14H1zm16 0h14v14H17z"
      fill="currentColor"
    />
  </svg>
);

const Art = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 340 330" style={{ width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="sculpture" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffd5ab" />
        <stop offset=".38" stopColor="#ed926d" />
        <stop offset=".73" stopColor="#d36d4a" />
        <stop offset="1" stopColor="#91432f" />
      </linearGradient>
      <linearGradient id="sculpture2" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#9cbea5" />
        <stop offset=".5" stopColor="#547c68" />
        <stop offset="1" stopColor="#254b40" />
      </linearGradient>
      <radialGradient id="artshadow">
        <stop stopColor="#3e352a" stopOpacity=".22" />
        <stop offset="1" stopColor="#3e352a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="181" cy="282" rx="145" ry="29" fill="url(#artshadow)" />
    <g transform={`translate(0,${Math.sin(frame / 45) * 2.2})`}>
      <path
        d="M70 237V132c0-71 112-95 151-38 15 21 15 45 15 76v67h-46v-94c0-37-73-39-73 1v93Z"
        fill="url(#sculpture)"
      />
      <path
        d="m70 237 31 20h47l-31-20Zm166 0 30-19v-75c0-46-25-70-49-79 13 15 19 37 19 69Z"
        fill="#a65338"
      />
      <path
        d="M134 258V191c0-59 96-80 128-33 11 16 12 35 12 58v42h-39v-67c0-29-61-32-61 2v65Z"
        fill="url(#sculpture2)"
      />
      <path
        d="m134 258 25 16h39l-24-16Zm140 0 24-15v-56c0-34-20-53-41-61 12 13 17 33 17 61Z"
        fill="#22483a"
      />
      <path
        d="M71 135c0-61 85-90 129-60"
        fill="none"
        stroke="#ffe3c4"
        strokeWidth="2"
        opacity=".65"
      />
    </g>
  </svg>
);

const Site = ({
  frame,
  outline = false,
}: {
  frame: number;
  outline?: boolean;
}) => {
  const assembly = ease(frame, [255, 315], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: outline ? "transparent" : paper,
        color: ink,
        overflow: "hidden",
        opacity: assembly,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 30,
          right: 43,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 22,
          fontFamily: "SceneBold",
        }}
      >
        <Logo />
        FORM
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "SceneSans",
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          STUDIO&nbsp;&nbsp;&nbsp;&nbsp; PROJEKTE&nbsp;&nbsp;&nbsp;&nbsp;
          KONTAKT
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 125,
          opacity: ease(frame, [271, 310], [0, 1]),
          translate: `0 ${ease(frame, [271, 319], [22, 0])}px`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 2.8,
            marginBottom: 18,
            color: "#59675e",
          }}
        >
          NEUE PERSPEKTIVEN
        </div>
        <div
          style={{
            fontFamily: "SceneSerif",
            fontSize: 68,
            lineHeight: 0.99,
            letterSpacing: -3,
          }}
        >
          Denk
          <br />
          <span style={{ fontStyle: "italic" }}>weiter.</span>
        </div>
        <div
          style={{
            width: 238,
            fontSize: 14,
            lineHeight: 1.5,
            marginTop: 18,
            color: "#58605b",
          }}
        >
          Aus einer Idee wird etwas,
          <br />
          das du sehen und erleben kannst.
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            fontSize: 13,
            gap: 15,
          }}
        >
          <span
            style={{
              borderRadius: 50,
              width: 31,
              height: 31,
              background: ink,
              color: paper,
              display: "grid",
              placeItems: "center",
              fontSize: 18,
            }}
          >
            ↗
          </span>
          Entdecken
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 356,
          top: 94,
          width: 350,
          height: 338,
          opacity: ease(frame, [280, 325], [0, 1]),
          scale: ease(frame, [280, 330], [0.85, 1]),
        }}
      >
        <Art frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          bottom: 27,
          borderTop: "1px solid #c9cdc1",
          paddingTop: 13,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          letterSpacing: 2,
          color: "#667066",
        }}
      >
        <span>GESTALTUNG, DIE VERBINDET.</span>
        <span>01 — 03</span>
      </div>
      {outline && (
        <svg
          width="760"
          height="478"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M24 80H735M330 103v320M24 433H735M42 114h265v295M350 114h350v295"
            stroke={mint}
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 7"
          />
        </svg>
      )}
    </div>
  );
};

const Browser = ({ frame }: { frame: number }) => {
  const split = ease(frame, [57, 112], [0, 1]),
    focus = ease(frame, [306, 365], [0, 1]);
  const x = 520 - 440 * split + 588 * focus,
    y = 320 + 38 * split - 61 * focus,
    scale = 1 - 0.13 * split + 0.38 * focus;
  const explode = Math.sin(at(frame, [240, 314], [0, Math.PI]));
  const rot = (1 - focus) * split;
  const clicked = frame >= 51;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 760,
        height: 520,
        perspective: 1600,
        scale,
        transformOrigin: "center center",
      }}
    >
      {[2, 1].map((layer) => (
        <div
          key={layer}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            border: `1px solid ${layer === 2 ? mint : orange}`,
            background:
              layer === 2 ? "rgba(150,225,193,.035)" : "rgba(237,146,109,.035)",
            opacity: at(frame, [229, 249, 301, 317], [0, 0.8, 0.7, 0]),
            transform: `rotateX(${8 * rot}deg) rotateY(${-13 * rot}deg) translate3d(${explode * layer * 172}px,${-explode * layer * 56}px,${-layer * 65}px)`,
            boxShadow: "0 30px 60px #0003",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 18,
              fontFamily: "monospace",
              fontSize: 20,
              color: layer === 2 ? mint : orange,
            }}
          >
            {layer === 2 ? "CSS · GESTALTUNG" : "HTML · STRUKTUR"}
          </div>
          <svg
            width="760"
            height="520"
            style={{ position: "absolute", inset: 0, opacity: 0.45 }}
          >
            <g stroke={layer === 2 ? mint : orange} fill="none" strokeWidth="2">
              <rect x="32" y="72" width="696" height="55" rx="6" />
              <rect x="32" y="150" width="315" height="314" rx="6" />
              <rect x="370" y="150" width="358" height="314" rx="6" />
              <path d="M55 183h192m-192 20h230m-230 20h140M55 367h230m-230 20h170m-170 20h205" />
            </g>
            {layer === 2 && (
              <g>
                <circle cx="500" cy="263" r="58" fill={orange} />
                <circle cx="581" cy="321" r="58" fill={mint} />
                <text
                  x="73"
                  y="300"
                  fill={paper}
                  fontSize="80"
                  fontFamily="serif"
                >
                  Aa
                </text>
              </g>
            )}
          </svg>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          overflow: "hidden",
          transform: `rotateX(${8 * rot}deg) rotateY(${-13 * rot}deg) translateZ(${explode * 28}px)`,
          border: "1px solid #859b9770",
          background: "#192124",
          boxShadow: `0 45px 100px #0005,0 2px 0 #a6b9af25 inset`,
        }}
      >
        <div
          style={{
            height: 42,
            display: "flex",
            alignItems: "center",
            background: "#263033",
            padding: "0 18px",
            gap: 7,
            borderBottom: "1px solid #9ab4a02b",
          }}
        >
          {["#e99987", "#d8bf87", "#94b6a3"].map((c) => (
            <div
              key={c}
              style={{ width: 8, height: 8, borderRadius: 8, background: c }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 175,
              top: 9,
              width: 411,
              height: 25,
              borderRadius: 6,
              background: "#11191b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#a9b7b4",
              letterSpacing: 0.7,
            }}
          >
            ⌑ &nbsp; form.studio
          </div>
          <span style={{ marginLeft: "auto", fontSize: 16, color: "#8c9c97" }}>
            ＋
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 42,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              opacity: at(frame, [188, 230], [1, 0]),
              background:
                "radial-gradient(ellipse at center, #223334 0%, #182326 75%)",
            }}
          >
            {!clicked && (
              <div
                style={{
                  position: "absolute",
                  top: 80,
                  color: "#7c928c",
                  fontSize: 13,
                  letterSpacing: 3,
                }}
              >
                DEIN BROWSER
              </div>
            )}
            <div
              style={{
                width: 188,
                height: 54,
                borderRadius: 9,
                background: clicked ? "#293e39" : mint,
                color: clicked ? mint : ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontFamily: "SceneBold",
                scale: at(frame, [48, 51, 57], [1, 0.94, 1]),
                boxShadow: "0 8px 30px #0002",
              }}
            >
              {clicked ? "Wird geladen …" : "Seite öffnen"}
              <span style={{ marginLeft: 14, fontSize: 23 }}>
                {clicked ? "◌" : "↗"}
              </span>
            </div>
            {clicked && (
              <div
                style={{
                  position: "absolute",
                  top: 298,
                  fontSize: 12,
                  letterSpacing: 2,
                  color: "#8ba29a",
                }}
              >
                ANFRAGE GESENDET
              </div>
            )}
          </div>
          <Site frame={frame} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 370 + ease(frame, [18, 40], [85, 0]),
          top: 289 + ease(frame, [18, 40], [70, 0]),
          opacity: at(frame, [0, 15, 73, 88], [0, 1, 1, 0]),
          transform: "rotate(-12deg)",
          filter: "drop-shadow(0 3px 4px #0005)",
        }}
      >
        <svg width="32" height="42" viewBox="0 0 32 42">
          <path
            d="M2 2v31l8-7 7 13 7-4-7-12 11-2Z"
            fill={paper}
            stroke={ink}
            strokeWidth="2"
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 287,
          width: 64,
          height: 64,
          marginLeft: -32,
          marginTop: -32,
          border: `2px solid ${mint}`,
          borderRadius: "100%",
          opacity: at(frame, [49, 53, 73], [0, 0.8, 0]),
          scale: at(frame, [49, 73], [0.2, 1.8]),
        }}
      />
    </div>
  );
};

const Server = ({ frame }: { frame: number }) => {
  const show =
    ease(frame, [80, 115], [0, 1]) * (1 - ease(frame, [300, 337], [0, 1]));
  return (
    <div
      style={{
        position: "absolute",
        left: 1350,
        top: 345,
        width: 330,
        height: 450,
        opacity: show,
        translate: `${ease(frame, [80, 120], [50, 0])}px 0`,
      }}
    >
      <svg viewBox="0 0 330 350" width="330" height="350">
        <defs>
          <linearGradient id="rack" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#344644" />
            <stop offset="1" stopColor="#19282a" />
          </linearGradient>
          <radialGradient id="rackglow">
            <stop stopColor={mint} stopOpacity=".16" />
            <stop offset="1" stopColor={mint} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="166" cy="307" rx="155" ry="39" fill="url(#rackglow)" />
        {[2, 1, 0].map((row) => {
          const y = 71 + row * 75,
            pulse = at(
              frame,
              [148 + row * 10, 158 + row * 10, 178 + row * 10],
              [0, 1, 0],
            );
          return (
            <g key={row} transform={`translate(0,${y})`}>
              <path
                d="m42 23 169-28 76 35-168 29Z"
                fill="#40534e"
                stroke="#819a8d"
                strokeOpacity=".5"
              />
              <path
                d="m211-5 76 35v54l-76-34Z"
                fill="#14282a"
                stroke="#44645d"
              />
              <path
                d="m42 23 169-28v55L42 78Z"
                fill="url(#rack)"
                stroke={mint}
                strokeOpacity={0.35 + pulse * 0.6}
              />
              <path
                d="m57 43 83-13m-83 22 83-13"
                stroke="#8da59c"
                strokeOpacity=".65"
                strokeWidth="3"
              />
              <circle
                cx="187"
                cy="25"
                r="5"
                fill={mint}
                opacity={0.45 + 0.55 * pulse}
              />
              <path
                d="m227 25 40 18m-40-5 40 18"
                stroke="#486960"
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 353,
          left: 30,
          fontSize: 25,
          letterSpacing: 4,
          color: "#b9cdc3",
        }}
      >
        DER SERVER
      </div>
      <div
        style={{
          position: "absolute",
          top: 394,
          left: 30,
          fontSize: 19,
          color: "#7e9a8e",
        }}
      >
        hält die Dateien bereit
      </div>
    </div>
  );
};

const Traffic = ({ frame }: { frame: number }) => {
  const request = ease(frame, [114, 159], [0, 1]),
    fade = at(frame, [290, 325], [1, 0]);
  const path = "M 785 569 C 945 569, 1100 486, 1384 486";
  const returnPath = "M 1384 562 C 1120 562, 999 676, 785 676";
  const bez = (t: number, back = false) => {
    const points = back
      ? [
          [1384, 562],
          [1120, 562],
          [999, 676],
          [785, 676],
        ]
      : [
          [785, 569],
          [945, 569],
          [1100, 486],
          [1384, 486],
        ];
    return [0, 1].map(
      (k) =>
        (1 - t) ** 3 * points[0][k] +
        3 * (1 - t) ** 2 * t * points[1][k] +
        3 * (1 - t) * t * t * points[2][k] +
        t ** 3 * points[3][k],
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d={path}
          fill="none"
          stroke="#567568"
          strokeWidth="1.5"
          strokeDasharray="4 9"
          opacity={ease(frame, [96, 117], [0, 0.6])}
        />
        <path
          d={path}
          fill="none"
          stroke={mint}
          strokeWidth="2"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - request}
          opacity={at(frame, [108, 116, 169, 190], [0, 0.9, 0.9, 0.22])}
        />
        <path
          d={returnPath}
          fill="none"
          stroke={orange}
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - ease(frame, [180, 230], [0, 1])}
          opacity={0.4}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 976,
          top: 433,
          color: mint,
          fontSize: 21,
          letterSpacing: 3,
          opacity: at(frame, [103, 118, 170, 188], [0, 1, 1, 0]),
        }}
      >
        ANFRAGE
      </div>
      <div
        style={{
          position: "absolute",
          left: 988,
          top: 720,
          color: orange,
          fontSize: 21,
          letterSpacing: 3,
          opacity: at(frame, [182, 196, 277, 292], [0, 1, 1, 0]),
        }}
      >
        DATEIEN ZURÜCK
      </div>
      {frame > 110 && frame < 175 && (
        <div
          style={{
            position: "absolute",
            left: bez(request)[0] - 54,
            top: bez(request)[1] - 25,
            width: 108,
            height: 50,
            display: "grid",
            placeItems: "center",
            borderRadius: 8,
            border: `1px solid ${mint}`,
            background: "#1c342d",
            boxShadow: `0 0 25px ${mint}28`,
            color: mint,
            fontFamily: "monospace",
            fontSize: 20,
            opacity: at(frame, [111, 118, 158, 174], [0, 1, 1, 0]),
          }}
        >
          GET /
        </div>
      )}
      {["HTML", "CSS", "JS"].map((label, i) => {
        const p = ease(frame, [181 + i * 14, 236 + i * 14], [0, 1]),
          xy = bez(p, true);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: xy[0] - 51,
              top: xy[1] - 29,
              width: 102,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 0.3,
              color: i === 1 ? mint : i === 2 ? "#e6ca86" : paper,
              background: "#20312e",
              border: `1px solid ${i === 1 ? mint : i === 2 ? "#e6ca86" : paper}88`,
              borderRadius: 7,
              boxShadow: "0 8px 24px #0003",
              opacity: at(
                frame,
                [178 + i * 14, 188 + i * 14, 231 + i * 14, 243 + i * 14],
                [0, 1, 1, 0],
              ),
              rotate: `${Math.sin(p * Math.PI) * (i - 1) * 9}deg`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

const Heading = ({ frame }: { frame: number }) => {
  const phase = frame < 88 ? 0 : frame < 183 ? 1 : frame < 281 ? 2 : 3;
  const starts = [0, 88, 183, 281],
    local = frame - starts[phase];
  const titles = [
    "Ein Klick. Und dann?",
    "Dein Browser fragt nach.",
    "Der Server liefert Dateien.",
    "Daraus wird deine Webseite.",
  ];
  const ends = [88, 95, 98, 139];
  return (
    <div
      style={{
        position: "absolute",
        left: 108,
        top: 96,
        opacity: at(local, [0, 11, ends[phase] - 9, ends[phase]], [0, 1, 1, 0]),
        translate: `0 ${ease(local, [0, 23], [21, 0])}px`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 4,
          color: "#8fa69a",
          marginBottom: 24,
        }}
      >
        DAS WEB, SICHTBAR GEMACHT
      </div>
      <div
        style={{
          fontSize: 78,
          letterSpacing: -2,
          fontFamily: "SceneBold",
          lineHeight: 1.1,
          color: paper,
        }}
      >
        {titles[phase]}
      </div>
    </div>
  );
};

export const WebsiteFilm = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: ink,
        color: paper,
        fontFamily: "SceneSans",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 53% 44%, #25352e 0%, #151e1c 42%, #111719 80%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(#b8d3bd09 1px,transparent 1px),linear-gradient(90deg,#b8d3bd09 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center,#000 15%,transparent 75%)",
          backgroundPosition: `${ease(f, [0, 420], [0, -20])}px 0`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
      >
        <path d="M108 268h1704M108 917h1704" stroke="#849a8a" />
        {[
          [108, 268],
          [1812, 268],
          [108, 917],
          [1812, 917],
        ].map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={`M${x - 6} ${y}h12m-6-6v12`}
            stroke={paper}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${ease(f, [306, 365], [0, -88])}px 0`,
        }}
      >
        <Traffic frame={f} />
        <Server frame={f} />
        <Browser frame={f} />
      </div>
      <Heading frame={f} />
      <div
        style={{
          position: "absolute",
          left: 112,
          right: 112,
          bottom: 73,
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: "#91aa9c",
          fontSize: 14,
          letterSpacing: 1,
        }}
      >
        <div
          style={{
            width: 25,
            height: 25,
            border: `1px solid ${mint}66`,
            borderRadius: 25,
            display: "grid",
            placeItems: "center",
            fontFamily: "monospace",
            fontSize: 11,
            color: mint,
          }}
        >
          {f < 100 ? "1" : f < 280 ? "2" : "3"}
        </div>
        <span>
          {f < 100
            ? "KLICKEN"
            : f < 280
              ? "ANFRAGEN & EMPFANGEN"
              : "IM BROWSER DARSTELLEN"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, letterSpacing: 2 }}>
          BROWSER&nbsp; ↔ &nbsp;SERVER
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 112,
          right: 112,
          bottom: 48,
          height: 2,
          background: "#3c504426",
        }}
      >
        <div
          style={{
            height: 2,
            background: mint,
            width: `${(f / 419) * 100}%`,
            opacity: 0.7,
          }}
        />
      </div>
      <Audio src={staticFile("audio/website-sound.wav")} volume={1} />
    </AbsoluteFill>
  );
};
