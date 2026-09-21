// Encodes the Higgsfield clips in /assets-src/films into scroll-scrubbable
// MP4s: H.264, no audio, no B-frames and a keyframe every few frames so the
// browser can seek to any frame quickly in both directions.
// Run with: npm run films
import { execFileSync } from "node:child_process";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "assets-src", "films");
const outDir = path.join(root, "public", "films");
await mkdir(outDir, { recursive: true });

const variants = [
  // [suffix, width, crf, keyframe interval]
  ["720", 1280, 26, 4],
  ["480", 854, 29, 4],
];

for (const file of (await readdir(srcDir)).filter((f) => f.endsWith(".mp4"))) {
  const name = file.replace(/\.mp4$/, "");
  for (const [suffix, width, crf, gop] of variants) {
    const target = path.join(outDir, `${name}-${suffix}.mp4`);
    execFileSync(ffmpeg, [
      "-v", "error", "-y",
      "-i", path.join(srcDir, file),
      "-an",
      "-vf", `scale='min(${width},iw)':-2:flags=lanczos`,
      "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-crf", String(crf), "-g", String(gop), "-keyint_min", String(gop), "-sc_threshold", "0", "-bf", "0",
      "-movflags", "+faststart",
      target,
    ]);
    console.log(`/films/${name}-${suffix}.mp4`, `${((await stat(target)).size / 1024) | 0}KB`);
  }
}
