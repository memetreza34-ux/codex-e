import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";
Config.setRspack(true);
Config.setVideoImageFormat("png");
Config.setDisableSharedMemoryCapture(true);
Config.setConcurrency(2);
const browser =
  process.env.REMOTION_BROWSER_EXECUTABLE ||
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined);
if (browser && existsSync(browser)) Config.setBrowserExecutable(browser);
