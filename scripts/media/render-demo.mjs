import { renderVideo } from "../render.mjs";

try {
  console.log(
    await renderVideo(
      { compositionId: "HybridAssets", quality: "final" },
      {
        audio: null,
        onData: (text) => process.stdout.write(text),
      },
    ),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
