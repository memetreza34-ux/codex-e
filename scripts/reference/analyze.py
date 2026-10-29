#!/usr/bin/env python3
"""Local reference measurements; exported frames are analysis-only, never production assets."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import sys
import wave
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def validate_output(value: str | Path, root: Path = ROOT) -> Path:
    root = root.resolve()
    work = root / "work"
    if work.is_symlink():
        raise ValueError("work darf für diese Analyse kein symbolischer Link sein.")
    target = Path(value)
    target = (root / target if not target.is_absolute() else target).resolve()
    if target == work or not target.is_relative_to(work):
        raise ValueError("Ausgabe muss ein neuer Unterordner innerhalb des Repo-Ordners work sein.")
    if target.exists():
        raise FileExistsError(f"Vorhandene Ausgabe bleibt unverändert: {target}")
    return target


def create_output(value: str | Path, root: Path = ROOT) -> Path:
    target = validate_output(value, root)
    target.mkdir(parents=True, exist_ok=False)
    return target


def positive(value: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("Wert muss positiv und endlich sein.")
    return number


def source_url(value: str | None) -> str | None:
    if value is None:
        return None
    url = urlsplit(value)
    if url.scheme not in {"http", "https"} or not url.hostname or url.username or url.password or any(ord(c) < 32 for c in value):
        raise ValueError("Quellenlink braucht eine öffentliche HTTP(S)-Adresse ohne Zugangsdaten.")
    return value


def inspect_input(path: Path) -> dict:
    raw = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    data = json.loads(raw.stdout)
    video = next((s for s in data.get("streams", []) if s.get("codec_type") == "video" and not s.get("disposition", {}).get("attached_pic")), None)
    if not video:
        raise ValueError("Datei enthält keine Videospur.")
    fps = 0.0
    for key in ("avg_frame_rate", "r_frame_rate"):
        try:
            fps = float(Fraction(video.get(key, "0/1")))
            if fps > 0:
                break
        except (ValueError, ZeroDivisionError):
            continue
    if not math.isfinite(fps) or fps <= 0:
        raise ValueError("Keine verlässliche Bildrate gefunden.")
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return {
        "name": path.name, "path": str(path), "bytes": path.stat().st_size,
        "sha256": digest.hexdigest(), "fps": fps,
        "width": video.get("width"), "height": video.get("height"),
        "hasAudio": any(s.get("codec_type") == "audio" for s in data.get("streams", [])),
        "timingBasis": "Decoded frame indices / nominal average FPS. VFR timing may be approximate.",
        "ffprobe": data,
    }


def segment_record(start: int, end: int, fps: float, index: int) -> dict:
    if start < 0 or end <= start or fps <= 0:
        raise ValueError("Ungültige Frame-Grenzen oder Bildrate.")
    return {
        "id": f"segment-{index:03d}", "startFrame": start, "endFrameExclusive": end,
        "startSeconds": start / fps, "endSeconds": end / fps,
        "durationSeconds": (end - start) / fps, "sampleFiles": [],
        "humanReviewNeeded": True, "semanticScene": None,
    }


def sample_frames(frame_count: int, fps: float, interval: float, segments: list[dict]) -> list[int]:
    if frame_count <= 0 or fps <= 0 or interval <= 0 or not math.isfinite(interval):
        raise ValueError("Ungültiger Frameumfang oder Stichprobenabstand.")
    amount = math.ceil((frame_count / fps) / interval)
    if amount > 2000:
        raise ValueError("Mehr als 2000 Stichproben: --interval erhöhen.")
    frames = {min(frame_count - 1, int(round(i * interval * fps))) for i in range(amount)}
    frames.add(frame_count - 1)
    for segment in segments:
        frames.add((segment["startFrame"] + segment["endFrameExclusive"] - 1) // 2)
    return sorted(frames)


def detect_segments(path: Path, threshold: float, fps: float) -> tuple[list[dict], int, str]:
    import scenedetect
    from scenedetect import SceneManager, open_video
    from scenedetect.detectors import ContentDetector

    video = open_video(str(path), backend="opencv")
    manager = SceneManager()
    manager.add_detector(ContentDetector(threshold=threshold))
    decoded = manager.detect_scenes(video=video, show_progress=False)
    ranges = manager.get_scene_list(start_in_scene=True)
    segments = [segment_record(start.frame_num, end.frame_num, fps, i + 1) for i, (start, end) in enumerate(ranges)]
    if not segments and decoded > 0:
        segments = [segment_record(0, decoded, fps, 1)]
    if not segments or decoded <= 0:
        raise ValueError("Keine Videoframes decodiert.")
    return segments, decoded, scenedetect.__version__


def export_samples(path: Path, directory: Path, frames: list[int], fps: float) -> tuple[list[dict], list[str]]:
    import cv2
    import numpy as np

    sample_dir = directory / "samples"
    sample_dir.mkdir()
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise ValueError("OpenCV kann die Videodatei nicht öffnen.")
    records, sheets, thumbs = [], [], []
    thumb_width, label_height, columns, page_size = 240, 28, 4, 12
    try:
        for index, frame in enumerate(frames):
            capture.set(cv2.CAP_PROP_POS_FRAMES, frame)
            ok, image = capture.read()
            if not ok:
                raise ValueError(f"Stichprobe bei Frame {frame} nicht lesbar.")
            height, width = image.shape[:2]
            scale = min(1.0, 720 / width)
            saved = cv2.resize(image, (round(width * scale), round(height * scale)), interpolation=cv2.INTER_AREA)
            relative = f"samples/frame-{frame:08d}.jpg"
            if not cv2.imwrite(str(directory / relative), saved, [cv2.IMWRITE_JPEG_QUALITY, 88]):
                raise OSError("Stichprobe konnte nicht gespeichert werden.")
            record = {"frame": frame, "seconds": frame / fps, "file": relative, "humanReviewNeeded": True}
            records.append(record)
            thumb_height = round(height * thumb_width / width)
            tile = np.full((thumb_height + label_height, thumb_width, 3), 24, dtype=np.uint8)
            tile[:thumb_height] = cv2.resize(image, (thumb_width, thumb_height), interpolation=cv2.INTER_AREA)
            cv2.putText(tile, f"{frame / fps:07.2f}s | f{frame}", (8, thumb_height + 19), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (220, 230, 220), 1, cv2.LINE_AA)
            thumbs.append(tile)
            if len(thumbs) == page_size or index == len(frames) - 1:
                rows = math.ceil(len(thumbs) / columns)
                sheet = np.full((rows * tile.shape[0], columns * thumb_width, 3), 16, dtype=np.uint8)
                for offset, thumb in enumerate(thumbs):
                    y, x = (offset // columns) * tile.shape[0], (offset % columns) * thumb_width
                    sheet[y:y + tile.shape[0], x:x + thumb_width] = thumb
                relative_sheet = f"contact-sheet-{len(sheets) + 1:03d}.jpg"
                if not cv2.imwrite(str(directory / relative_sheet), sheet, [cv2.IMWRITE_JPEG_QUALITY, 90]):
                    raise OSError("Kontaktbogen konnte nicht gespeichert werden.")
                sheets.append(relative_sheet)
                thumbs = []
    finally:
        capture.release()
    return records, sheets


def write_json(path: Path, data: dict) -> None:
    with path.open("x", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2, allow_nan=False)
        handle.write("\n")


def audio_measurements(path: Path, directory: Path, available: bool, enabled: bool) -> dict:
    if not enabled or not available:
        return {"available": available, "extracted": False, "reason": "not requested" if not enabled else "no audio stream", "speechRecognized": False, "humanListeningNeeded": True}
    import numpy as np

    output = directory / "audio-mono-16k.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-n", "-i", str(path), "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(output)], check=True, capture_output=True)
    windows = []
    with wave.open(str(output), "rb") as handle:
        rate = handle.getframerate()
        position = 0
        while block := handle.readframes(round(rate * 0.1)):
            values = np.frombuffer(block, dtype="<i2").astype(np.float64) / 32768.0
            rms = float(np.sqrt(np.mean(values * values)))
            peak = float(np.max(np.abs(values)))
            windows.append({"startSeconds": position / rate, "endSeconds": (position + len(values)) / rate, "rms": rms, "peak": peak, "rmsDbfs": 20 * math.log10(rms) if rms > 0 else None})
            position += len(values)
    metrics = {"kind": "amplitude measurements only", "windowSeconds": 0.1, "sampleRate": rate, "speechRecognized": False, "words": None, "humanListeningNeeded": True, "windows": windows}
    write_json(directory / "audio-measurements.json", metrics)
    return {"available": True, "extracted": True, "file": output.name, "measurements": "audio-measurements.json", "windowCount": len(windows), "speechRecognized": False, "humanListeningNeeded": True}


def analyze(input_path: Path, out: str | Path, reference_id: str, *, url: str | None = None, interval: float = 1.0, threshold: float = 27.0, audio: bool = False, root: Path = ROOT) -> dict:
    if not SLUG.fullmatch(reference_id):
        raise ValueError("reference-id muss ein klein geschriebener Slug sein.")
    if not math.isfinite(interval) or interval <= 0 or not math.isfinite(threshold) or threshold <= 0:
        raise ValueError("Intervall und Schwelle müssen positiv und endlich sein.")
    url = source_url(url)
    target = validate_output(out, root)
    path = input_path.resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Lokale Eingabedatei fehlt: {path}")
    metadata = inspect_input(path)
    target = create_output(target, root)
    try:
        segments, decoded, detector_version = detect_segments(path, threshold, metadata["fps"])
        samples, sheets = export_samples(path, target, sample_frames(decoded, metadata["fps"], interval, segments), metadata["fps"])
        for segment in segments:
            segment["sampleFiles"] = [sample["file"] for sample in samples if segment["startFrame"] <= sample["frame"] < segment["endFrameExclusive"]]
        audio_result = audio_measurements(path, target, metadata["hasAudio"], audio)
        cuts = [{"frame": segment["startFrame"], "seconds": segment["startSeconds"], "humanReviewNeeded": True} for segment in segments[1:]]
        write_json(target / "shots.json", {"schemaVersion": 1, "analysisOnly": True, "humanReviewNeeded": True, "frameConvention": "zero-based; endFrameExclusive is not part of the segment", "method": "ContentDetector visual-change candidates; not semantic scenes", "detector": {"package": "scenedetect", "version": detector_version, "threshold": threshold}, "cutCandidates": cuts, "shots": segments})
        result = {"schemaVersion": 1, "referenceId": reference_id, "createdAt": datetime.now(timezone.utc).isoformat(), "sourceUrl": url, "analysisOnly": True, "reusePermissionGranted": False, "humanReviewNeeded": True, "visualReview": "pending", "audioReview": "pending" if metadata["hasAudio"] else "not applicable", "semanticSceneAnalysis": "not performed", "speechRecognition": "not performed", "input": metadata, "decodedFrames": decoded, "durationFromDecodedFramesSeconds": decoded / metadata["fps"], "samplingIntervalSeconds": interval, "samples": samples, "contactSheets": sheets, "shotCandidatesFile": "shots.json", "audio": audio_result, "limitations": ["Automatic visual changes can miss object changes on the same background or suggest false cuts.", "Measurements and image extraction do not constitute a visual or audible review.", "Frame/FPS time conversion may be approximate for variable-frame-rate input.", "Source video, frames and audio stay local under work; they are not production assets."]}
        write_json(target / "manifest.json", result)
        return result
    except Exception as error:
        write_json(target / "analysis-failed.json", {"status": "failed", "humanReviewNeeded": True, "errorType": type(error).__name__, "message": str(error), "note": "Own partial output preserved for inspection; no existing output was overwritten."})
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Lokale Videodatei; kein Netzwerkabruf")
    parser.add_argument("--out", required=True, help="Neuer Ausgabeordner innerhalb work/")
    parser.add_argument("--reference-id", required=True)
    parser.add_argument("--source-url")
    parser.add_argument("--interval", type=positive, default=1.0)
    parser.add_argument("--threshold", type=positive, default=27.0)
    parser.add_argument("--audio", action="store_true", help="Audio lokal extrahieren und 100-ms-Amplituden messen; keine Spracherkennung")
    args = parser.parse_args()
    try:
        result = analyze(args.input, args.out, args.reference_id, url=args.source_url, interval=args.interval, threshold=args.threshold, audio=args.audio)
        print(json.dumps({"referenceId": result["referenceId"], "decodedFrames": result["decodedFrames"], "samples": len(result["samples"]), "contactSheets": len(result["contactSheets"]), "humanReviewNeeded": True, "output": str((ROOT / args.out).resolve())}, ensure_ascii=False))
        return 0
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"Analyse abgebrochen: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
