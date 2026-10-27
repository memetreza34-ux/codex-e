import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import "../fonts";
const opts = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.22, 1, 0.36, 1),
} as const;
const values = [
  [5, 5, 5, 5, 5],
  [1, 2, 5, 8, 9],
];
export const DataFilm = () => {
  const f = useCurrentFrame(),
    reveal = interpolate(f, [73, 140], [0, 1], opts),
    finish = interpolate(f, [211, 239], [0, 1], opts);
  return (
    <AbsoluteFill
      style={{
        background: "#eeeae1",
        color: "#252b33",
        fontFamily: "SceneSans",
        padding: 100,
      }}
    >
      <div style={{ fontSize: 22, letterSpacing: 5, color: "#687480" }}>
        DATEN VERSTEHEN
      </div>
      <div
        style={{
          fontFamily: "SceneBold",
          fontSize: 86,
          letterSpacing: -3,
          marginTop: 30,
        }}
      >
        Zweimal Ø 5. Zweimal dasselbe?
      </div>
      {[0, 1].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            left: 110 + row * 875,
            top: 330,
            width: 720,
            height: 475,
          }}
        >
          <div style={{ fontSize: 26, color: "#687480", marginBottom: 42 }}>
            GRUPPE {row === 0 ? "A" : "B"}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 360,
              borderBottom: "2px solid #b6bec5",
              display: "flex",
              alignItems: "end",
              gap: 23,
              padding: "0 36px",
            }}
          >
            {values[row].map((value, i) => (
              <div
                key={i}
                style={{
                  width: 104,
                  height: 40 * interpolate(reveal, [0, 1], [5, value]),
                  background: row === 0 ? "#8195b4" : "#b47d64",
                  position: "relative",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    fontSize: 27,
                    fontFamily: "SceneBold",
                  }}
                >
                  {Math.round(interpolate(reveal, [0, 1], [5, value]))}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 200,
              borderTop: "2px dashed #25334380",
            }}
          >
            <span
              style={{
                position: "absolute",
                right: 0,
                top: -32,
                fontSize: 23,
                background: "#eeeae1",
              }}
            >
              Ø 5
            </span>
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 110,
          fontSize: 40,
          opacity: finish,
          translate: `0 ${20 * (1 - finish)}px`,
        }}
      >
        Der Mittelwert zeigt die Mitte.{" "}
        <span style={{ fontFamily: "SceneBold" }}>
          Die Verteilung zeigt mehr.
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 44,
          left: 110,
          fontSize: 18,
          color: "#687480",
        }}
      >
        Illustrative Beispieldaten · keine Messung
      </div>
    </AbsoluteFill>
  );
};
