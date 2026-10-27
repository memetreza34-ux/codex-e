import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
loadFont({
  family: "SceneSans",
  url: staticFile("fonts/dm-sans-latin-400-normal.woff2"),
  weight: "400",
});
loadFont({
  family: "SceneBold",
  url: staticFile("fonts/dm-sans-latin-700-normal.woff2"),
  weight: "700",
});
loadFont({
  family: "SceneSerif",
  url: staticFile("fonts/fraunces-latin-400-normal.woff2"),
  weight: "400",
});
