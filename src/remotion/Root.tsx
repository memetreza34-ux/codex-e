import { Composition } from "remotion";
import config from "../../studio.config.json";
import { sceneComponents } from "./registry";
export const Root = () => (
  <>
    {config.scenes.map((scene) => (
      <Composition
        key={scene.id}
        id={scene.id}
        component={sceneComponents[scene.id]}
        durationInFrames={scene.durationInFrames}
        fps={scene.fps}
        width={scene.width}
        height={scene.height}
      />
    ))}
  </>
);
