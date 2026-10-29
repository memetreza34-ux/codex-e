import { renderVideo } from "./render.mjs";

const [compositionId, audio] = process.argv.slice(2);
try {
  console.log(
    await renderVideo(
      { compositionId, quality: "final" },
      {
        audio: audio || null,
        onData: (text) => process.stdout.write(text),
      },
    ),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
