// Films the live platform, shot by shot, in a headless GPU browser (no cursor).
//   node scripts/film/record.mjs  →  video/shots/*.mp4
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { startCapture } from "./capture.mjs";

const URL = process.env.FILM_URL || "https://l-allure-interne-31-rue-cambon-digi.vercel.app";
const OUT = "video/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--autoplay-policy=no-user-gesture-required"],
});
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);

async function shot(name, fn) {
  const cap = await startCapture(page, `video/tmp/${name}`);
  await fn();
  const r = await cap.stop(`${OUT}/${name}.mp4`);
  console.log(`✓ ${name}: ${r.seconds.toFixed(1)}s @ ${r.fps.toFixed(0)} fps`);
}

/** Click a floating object in the gallery: its caption sits just below it. */
async function openObject(caption, lift = 150) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const box = await page.locator("div.absolute", { hasText: caption }).filter({ has: page.locator("span.display") }).first().boundingBox();
    if (!box) throw new Error(`no caption ${caption}`);
    await page.mouse.click(box.x + box.width / 2, box.y - lift);
    await wait(1200);
    if (await page.locator("aside").count()) return;
  }
  throw new Error(`could not open ${caption}`);
}

async function toGallery() {
  await page.mouse.move(960, 1060); // park the (invisible) pointer away from the objects
  await page.keyboard.press("Escape");
  await wait(5500); // let the camera settle back on the whole gallery
}

// Fresh visitor, presenter mode on, in-app audio muted (the film has its own soundtrack).
await page.goto(URL);
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("allure-interne:session", JSON.stringify({ name: "", dept: null, instantDemo: true }));
  localStorage.setItem("allure-interne:muted", "1");
});
await page.goto(URL);
await wait(4000);

// ── A · Prologue: seal → letter → doors → gallery ─────────────────────────
await shot("a-prologue", async () => {
  await wait(1800);
  await page.click('button[aria-label="Break the seal"]');
  await wait(3200);
  await page.click("#name");
  await page.keyboard.type("Camille", { delay: 110 });
  await wait(600);
  await page.getByRole("button", { name: /Mode & le19M/ }).click();
  await wait(1100);
  await page.getByRole("button", { name: /Entrer à la Maison/ }).click();
  await wait(9500);
});

// ── B · La 2.55 opens on its burgundy lining ──────────────────────────────
await shot("b-bag", async () => {
  await wait(400);
  await openObject("La 2.55");
  await wait(2400);
  await page.click('button[aria-label="The lining · Aubazine burgundy"]');
  await wait(4600);
});

// ── C · Le Lexique: the “Dior” brief marked in red, then the Maison's version ─
await toGallery();
await shot("c-lexicon", async () => {
  await wait(300);
  await openObject("La Lettre");
  await wait(1800);
  await page.getByRole("button", { name: /Sauvage” launch brief/ }).click();
  await wait(3200);
  await page.evaluate(() => {
    const el = document.querySelector("aside .overflow-y-auto");
    el?.scrollBy({ top: 620, behavior: "smooth" });
  });
  await wait(3200);
});

// ── D · Le Grand Oral: the Chanel answer → 19/20 ──────────────────────────
await toGallery();
await shot("d-oral", async () => {
  await wait(300);
  await openObject("Les Perles");
  await wait(1600);
  await page.getByRole("button", { name: /Commencer l'oral/ }).click();
  await wait(1700);
  await page.getByRole("button", { name: /The Chanel answer/ }).click();
  await wait(700);
  await page.getByRole("button", { name: /Soumettre/ }).click();
  await wait(3200);
});

// Off camera: answer the two remaining questions, reach the verdict.
for (let i = 0; i < 2; i++) {
  await page.getByRole("button", { name: /Question suivante/ }).click();
  await wait(1800);
  await page.getByRole("button", { name: /The Chanel answer/ }).click();
  await wait(300);
  await page.getByRole("button", { name: /Soumettre/ }).click();
  await wait(2200);
}
await page.getByRole("button", { name: /verdict final/ }).click();
await wait(2500);

// ── E · La Carte d'Insider ────────────────────────────────────────────────
await shot("e-finale", async () => {
  await page.getByRole("button", { name: /Accomplir le chapitre/ }).click();
  await wait(6500);
});

await browser.close();
