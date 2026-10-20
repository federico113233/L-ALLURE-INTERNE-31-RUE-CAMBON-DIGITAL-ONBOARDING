"use client";

import * as THREE from "three";

function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  chars.forEach((c, i) => {
    ctx.fillText(c, cx + widths[i] / 2, y);
    cx += widths[i] + spacing;
  });
}

let labelTex: THREE.CanvasTexture | null = null;
export function n5Label(): THREE.CanvasTexture {
  if (labelTex) return labelTex;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 600;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 600);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 468, 556);
  const jost = cssFont("--font-jost", "Futura, Jost, sans-serif");
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 132px ${jost}`;
  ctx.fillText("N°5", 256, 220);
  ctx.font = `600 52px ${jost}`;
  spaced(ctx, "CHANEL", 256, 330, 18);
  ctx.font = `500 30px ${jost}`;
  spaced(ctx, "PARIS", 256, 392, 14);
  ctx.font = `500 24px ${jost}`;
  spaced(ctx, "PARFUM", 256, 520, 12);
  labelTex = new THREE.CanvasTexture(c);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.anisotropy = 8;
  return labelTex;
}

let quilt: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
export function quiltTextures() {
  if (quilt) return quilt;
  const size = 512;
  const step = 64;
  const draw = (bg: string, line: string, hi: string) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    for (let o = -size; o <= size * 2; o += step) {
      for (const [col, w, off] of [
        [hi, 5, 2],
        [line, 3, 0],
      ] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(o + off, 0);
        ctx.lineTo(o + off - size, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(o + off - size, 0);
        ctx.lineTo(o + off, size);
        ctx.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.4, 1.6);
    t.anisotropy = 8;
    return t;
  };
  const map = draw("#0c0c0c", "#000000", "#1c1c1c");
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = draw("#d0d0d0", "#202020", "#9a9a9a");
  quilt = { map, bump };
  return quilt;
}
