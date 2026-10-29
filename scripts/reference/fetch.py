import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from yt_dlp import YoutubeDL

ROOT = Path(__file__).resolve().parents[2]

def validate_url(value):
    url = urlparse(value)
    host = url.hostname or ""
    allowed = ("tiktok.com", "youtube.com", "youtu.be", "vimeo.com")
    if url.scheme != "https" or url.username or url.password or not any(host == domain or host.endswith("." + domain) for domain in allowed):
        raise ValueError("Öffentliche HTTPS-Videoquelle von TikTok, YouTube oder Vimeo erforderlich.")
    return value

def main():
    parser = argparse.ArgumentParser(description="Öffentliche Referenz ausschließlich lokal für Analyse speichern. Keine Cookies oder Zugangssperren umgehen.")
    parser.add_argument("url", type=validate_url)
    parser.add_argument("--id", required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.id):
        parser.error("ID muss ein kurzer Kleinbuchstaben-Slug sein.")
    output = ROOT / "work" / "reference-inputs" / args.id
    output.mkdir(parents=True, exist_ok=False)
    options = {"outtmpl": str(output / "reference.%(ext)s"), "format": "best[height<=1080][ext=mp4]/best[height<=1080]/best", "noplaylist": True, "nooverwrites": True, "max_filesize": 100 * 1024 * 1024, "quiet": True, "restrictfilenames": True}
    with YoutubeDL(options) as client:
        info = client.extract_info(args.url, download=False)
        if info.get("age_limit") or info.get("availability") in {"private", "premium_only", "subscriber_only", "needs_auth"}:
            raise RuntimeError("Anmelde-/Zugangsschranke: Nutzer muss eine zulässig verfügbare lokale Datei bereitstellen.")
        if (info.get("duration") or 0) > 600:
            raise RuntimeError("Für diese Referenzwerkstatt nur Clips bis zehn Minuten verwenden.")
        downloaded = client.extract_info(args.url, download=True)
    media = [path for path in output.glob("reference.*") if path.suffix not in {".part", ".ytdl"} and path.is_file() and path.stat().st_size > 0]
    if not media:
        raise RuntimeError("Kein fertiges Referenzvideo gespeichert; Größen- oder Zugangsgrenze prüfen.")
    metadata = {key: downloaded.get(key) for key in ("id", "title", "duration", "width", "height", "uploader", "webpage_url")}
    metadata.update({"purpose": "analysis-only", "sourceUrl": args.url, "redistribution": False})
    (output / "source.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"directory": str(output.relative_to(ROOT)), "purpose": "analysis-only", "files": [p.name for p in output.iterdir()]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
