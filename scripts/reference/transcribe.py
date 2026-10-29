import argparse
import importlib.metadata
import json
from pathlib import Path
import whisper

ROOT = Path(__file__).resolve().parents[2]

def main():
    parser = argparse.ArgumentParser(description="Lokale Wortzeiten mit vorhandenem Whisper; Modellgewichte werden beim ersten Aufruf heruntergeladen.")
    parser.add_argument("input", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--model", choices=("tiny", "base", "small"), default="tiny")
    parser.add_argument("--language", default="de")
    args = parser.parse_args()
    target = args.out.resolve()
    if not target.is_relative_to((ROOT / "work").resolve()):
        parser.error("Ausgaben müssen in work/ liegen.")
    target.mkdir(parents=True, exist_ok=False)
    model = whisper.load_model(args.model, device="cpu", download_root=str(ROOT / ".tools/models/whisper"))
    result = model.transcribe(str(args.input.resolve()), language=args.language, word_timestamps=True, fp16=False, verbose=False)
    words = [word for segment in result["segments"] for word in segment.get("words", [])]
    output = {"engine": "openai-whisper", "version": importlib.metadata.version("openai-whisper"), "model": args.model, "language": result["language"], "source": str(args.input.resolve()), "review": "automatische Schätzung; Text und Wortzeiten manuell prüfen", "words": words, "segments": result["segments"]}
    (target / "words.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"words": len(words), "output": str(target.relative_to(ROOT) / "words.json"), "review": "automatic-unreviewed"}))

if __name__ == "__main__":
    main()
