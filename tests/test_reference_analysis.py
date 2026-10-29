import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / "scripts/reference/analyze.py"
spec = importlib.util.spec_from_file_location("reference_analyze", SOURCE)
analyzer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analyzer)


class ReferenceAnalysisTests(unittest.TestCase):
    def test_output_stays_in_work_and_resolves_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "work").mkdir()
            for target in ["work", "../elsewhere", "work/../../outside", root / "outside"]:
                with self.assertRaises(ValueError):
                    analyzer.validate_output(target, root)
            (root / "work/escape").symlink_to(root, target_is_directory=True)
            with self.assertRaises(ValueError):
                analyzer.validate_output("work/escape/outside", root)
            self.assertEqual(analyzer.validate_output("work/study/new", root), (root / "work/study/new").resolve())

    def test_existing_output_and_notes_are_preserved_before_processing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "work/existing"
            output.mkdir(parents=True)
            sentinel = output / "human-notes.md"
            sentinel.write_text("keep this review", encoding="utf-8")
            with patch.object(analyzer, "inspect_input") as inspect:
                with self.assertRaises(FileExistsError):
                    analyzer.analyze(root / "missing.mp4", output, "example", root=root)
                inspect.assert_not_called()
            self.assertEqual(sentinel.read_text(encoding="utf-8"), "keep this review")
            self.assertEqual(list(output.iterdir()), [sentinel])

    def test_short_segments_get_samples_and_end_frames_are_exclusive(self):
        fps = 30000 / 1001
        segments = [analyzer.segment_record(0, 10, fps, 1), analyzer.segment_record(10, 90, fps, 2)]
        frames = analyzer.sample_frames(90, fps, 1.0, segments)
        self.assertEqual(segments[0]["endFrameExclusive"], 10)
        self.assertAlmostEqual(segments[0]["endSeconds"], 1001 / 3000)
        self.assertTrue(any(0 <= frame < 10 for frame in frames))
        self.assertTrue(any(10 <= frame < 90 for frame in frames))
        self.assertEqual(frames[-1], 89)
        self.assertEqual(frames, sorted(set(frames)))
        self.assertTrue(all(0 <= frame < 90 for frame in frames))

    def test_metadata_url_never_accepts_credentials_or_file_urls(self):
        for value in ["file:///etc/passwd", "https://name:secret@example.org/x", "https://example.org/\nheader"]:
            with self.assertRaises(ValueError):
                analyzer.source_url(value)
        self.assertEqual(analyzer.source_url("https://example.org/video/123"), "https://example.org/video/123")

    def test_measurements_do_not_claim_audio_or_semantic_review(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            result = analyzer.audio_measurements(root / "no-file", root, available=True, enabled=False)
            self.assertFalse(result["speechRecognized"])
            self.assertTrue(result["humanListeningNeeded"])
            self.assertFalse(result["extracted"])
            self.assertEqual(list(root.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
