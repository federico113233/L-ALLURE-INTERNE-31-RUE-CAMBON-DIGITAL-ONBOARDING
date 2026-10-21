// Title cards in the "Inside CHANEL" manner: black, the CC, wide-tracked
// Jost capitals and Cormorant italics — animated in CSS and filmed.
//   node scripts/film/cards.mjs  →  video/shots/card-*.mp4
import { chromium } from "playwright";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const cc = `data:image/png;base64,${readFileSync("public/brand/chanel-cc-white.png").toString("base64")}`;

const CARDS = {
  "card-open": {
    seconds: 6.2,
    html: `
      <img class="cc a1" src="${cc}">
      <div class="title a2">L'Allure Interne</div>
      <div class="gold a3">31 Rue Cambon · Digital Onboarding</div>`,
  },
  "card-bag": { seconds: 3.0, html: chapter("Chapitre III", "La 2.55", "Mode & le19M") },
  "card-lexicon": { seconds: 3.0, html: chapter("Chapitre V", "Le Lexique", "The Chanel Lexicon Translator") },
  "card-oral": { seconds: 3.0, html: chapter("Chapitre VI", "Le Grand Oral", "Three questions before the Director") },
  "card-end": {
    seconds: 6.4,
    html: `
      <img class="cc a1" src="${cc}">
      <div class="title a2">L'Allure Interne</div>
      <div class="quote a3">« Say less than you know. »</div>
      <div class="gold a4">HEC Paris · Strategic Brand Management</div>
      <div class="small a5">Business Project for CHANEL · Prototype</div>`,
  },
};

function chapter(n, name, sub) {
  return `
    <div class="gold a1">${n}</div>
    <div class="chapter a2">${name}</div>
    <div class="small a3">${sub}</div>`;
}

const css = `
  html,body{margin:0;height:100%;background:#000;color:#fff;overflow:hidden}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
  .cc{height:118px;margin-bottom:46px}
  .title{font-family:Jost;font-weight:600;font-size:34px;letter-spacing:.62em;text-transform:uppercase;padding-left:.62em}
  .gold{font-family:Jost;font-weight:500;font-size:17px;letter-spacing:.42em;text-transform:uppercase;color:#C5A059;margin-top:26px;padding-left:.42em}
  .small{font-family:Jost;font-weight:400;font-size:14px;letter-spacing:.38em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:22px;padding-left:.38em}
  .chapter{font-family:'Cormorant Garamond';font-style:italic;font-weight:400;font-size:120px;line-height:1;margin-top:18px}
  .quote{font-family:'Cormorant Garamond';font-style:italic;font-size:40px;color:rgba(255,255,255,.85);margin-top:34px}
  [class*=" a"],[class^="a"]{opacity:0}
  @keyframes rise{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
  @keyframes track{from{opacity:0;letter-spacing:.2em}to{opacity:1}}
  .a1{animation:rise 1.4s cubic-bezier(.22,1,.36,1) .25s forwards}
  .a2{animation:rise 1.4s cubic-bezier(.22,1,.36,1) .75s forwards}
  .a3{animation:rise 1.4s cubic-bezier(.22,1,.36,1) 1.3s forwards}
  .a4{animation:rise 1.4s cubic-bezier(.22,1,.36,1) 1.9s forwards}
  .a5{animation:rise 1.4s cubic-bezier(.22,1,.36,1) 2.4s forwards}
  .title.a2{animation:rise 1.6s cubic-bezier(.22,1,.36,1) .9s forwards}
`;

const browser = await chromium.launch({ headless: true, args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();

for (const [name, card] of Object.entries(CARDS)) {
  const doc = `<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Jost:wght@400;500;600&display=block" rel="stylesheet">
    <style>${css}</style></head><body class="paused">${card.html}</body></html>`;
  await page.setContent(doc.replace(/class="([^"]*)a(\d)/g, 'class="$1a$2'), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Deterministic render: pause every animation and step its clock frame by frame.
  const dir = resolve(`video/tmp/${name}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const fps = 30;
  const total = Math.round(card.seconds * fps);
  for (let k = 0; k < total; k++) {
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), (k * 1000) / fps);
    await page.screenshot({ path: join(dir, `f${String(k).padStart(5, "0")}.png`) });
  }
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%05d.png"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", `video/shots/${name}.mp4`]);
  const r = { seconds: total / fps };
  console.log(`✓ ${name}: ${r.seconds.toFixed(1)}s`);
}
await browser.close();
