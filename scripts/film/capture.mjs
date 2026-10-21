// Frame-accurate capture of the live site through the Chrome DevTools
// screencast (lossless-ish JPEG frames + timestamps), turned into constant
// frame-rate clips with ffmpeg. No cursor is ever drawn.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

export async function startCapture(page, rel) {
  const dir = resolve(rel);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let n = 0;
  cdp.on("Page.screencastFrame", async (f) => {
    const file = join(dir, `f${String(n++).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(f.data, "base64"));
    frames.push({ file, t: f.metadata.timestamp });
    try {
      await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId });
    } catch {
      /* session closing */
    }
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  return {
    async stop(outFile, fps = 30) {
      await cdp.send("Page.stopScreencast");
      await new Promise((r) => setTimeout(r, 300));
      await cdp.detach();
      if (!frames.length) throw new Error("no frames captured");
      // concat demuxer list with real per-frame durations → CFR output
      const lines = [];
      for (let i = 0; i < frames.length; i++) {
        const next = i + 1 < frames.length ? frames[i + 1].t : frames[i].t + 1 / fps;
        lines.push(`file '${frames[i].file.replace(/\\/g, "/")}'`, `duration ${Math.max(0.001, next - frames[i].t).toFixed(4)}`);
      }
      lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, "/")}'`);
      const list = join(dir, "list.txt");
      writeFileSync(list, lines.join("\n"));
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", list,
        "-vf", `fps=${fps},scale=1920:1080:flags=lanczos,format=yuv420p`,
        "-c:v", "libx264", "-preset", "slow", "-crf", "16",
        outFile,
      ]);
      const span = frames[frames.length - 1].t - frames[0].t;
      return { frames: frames.length, seconds: span, fps: frames.length / Math.max(0.001, span) };
    },
  };
}
