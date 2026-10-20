"use client";

// Sound design, synthesised live with Web Audio — no audio files.
// A slow, warm ambient pad with occasional harp-like notes, plus discreet UI
// sounds (hover tick, bell on click, arpeggio on success, air on transitions).
// The ambience ducks automatically while Mademoiselle speaks.

type Ctx = {
  ctx: AudioContext;
  master: GainNode;
  ambient: GainNode;
  fx: GainNode;
  reverb: ConvolverNode;
};

let A: Ctx | null = null;
let ambientOn = false;
let ambientTimers: ReturnType<typeof setTimeout>[] = [];
let enabled = true;

function impulse(ctx: AudioContext, seconds = 3.2, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function ensure(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (!A) {
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      const reverb = ctx.createConvolver();
      reverb.buffer = impulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      reverb.connect(wet).connect(master);
      const ambient = ctx.createGain();
      ambient.gain.value = 0;
      ambient.connect(master);
      ambient.connect(reverb);
      const fx = ctx.createGain();
      fx.gain.value = 0.5;
      fx.connect(master);
      fx.connect(reverb);
      A = { ctx, master, ambient, fx, reverb };
    } catch {
      return null;
    }
  }
  if (A.ctx.state === "suspended") void A.ctx.resume();
  return A;
}

function tone(freq: number, opts: { type?: OscillatorType; dur?: number; gain?: number; delay?: number; dest?: AudioNode } = {}) {
  const a = ensure();
  if (!a || !enabled) return;
  const { type = "sine", dur = 1.2, gain = 0.2, delay = 0 } = opts;
  const t = a.ctx.currentTime + delay;
  const o = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(opts.dest ?? a.fx);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function bell(freq: number, gain = 0.12, delay = 0) {
  tone(freq, { gain, delay, dur: 1.8 });
  tone(freq * 2.76, { gain: gain * 0.25, delay, dur: 0.9 });
  tone(freq * 5.4, { gain: gain * 0.08, delay, dur: 0.5 });
}

// D major 9 / B minor colours — warm, unresolved, Parisian salon.
const PADS = [
  [146.83, 220.0, 277.18, 329.63],
  [123.47, 185.0, 246.94, 293.66],
  [110.0, 164.81, 220.0, 277.18],
  [130.81, 196.0, 246.94, 329.63],
];
const HARP = [587.33, 659.25, 739.99, 880.0, 987.77, 1108.73, 1318.51];

function pad(chord: number[], seconds: number) {
  const a = ensure();
  if (!a) return;
  const t = a.ctx.currentTime;
  const filter = a.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.4;
  filter.connect(a.ambient);
  chord.forEach((f, i) => {
    for (const detune of [-5, 5]) {
      const o = a.ctx.createOscillator();
      const g = a.ctx.createGain();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = detune;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05 / (i + 1), t + seconds * 0.4);
      g.gain.linearRampToValueAtTime(0, t + seconds);
      o.connect(g).connect(filter);
      o.start(t);
      o.stop(t + seconds + 0.1);
    }
  });
}

function scheduleAmbient(i = 0) {
  if (!ambientOn) return;
  const seconds = 11;
  pad(PADS[i % PADS.length], seconds + 3);
  // a few sparse harp notes over each chord
  const notes = 1 + Math.floor(Math.random() * 3);
  for (let n = 0; n < notes; n++) {
    const at = 1.5 + Math.random() * (seconds - 3);
    ambientTimers.push(
      setTimeout(() => {
        if (!ambientOn || !A) return;
        tone(HARP[Math.floor(Math.random() * HARP.length)], { gain: 0.035, dur: 3.5, dest: A.ambient });
      }, at * 1000),
    );
  }
  ambientTimers.push(setTimeout(() => scheduleAmbient(i + 1), seconds * 1000));
}

export const sfx = {
  unlock() {
    ensure();
  },
  setEnabled(v: boolean) {
    enabled = v;
    if (!v) this.ambient(false);
    else this.ambient(true);
  },
  ambient(on: boolean) {
    const a = ensure();
    if (!a) return;
    if (on && enabled && !ambientOn) {
      ambientOn = true;
      a.ambient.gain.cancelScheduledValues(a.ctx.currentTime);
      a.ambient.gain.linearRampToValueAtTime(0.9, a.ctx.currentTime + 4);
      scheduleAmbient();
    } else if (!on && ambientOn) {
      ambientOn = false;
      ambientTimers.forEach(clearTimeout);
      ambientTimers = [];
      a.ambient.gain.cancelScheduledValues(a.ctx.currentTime);
      a.ambient.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 1.5);
    }
  },
  duck(on: boolean) {
    if (!A || !ambientOn) return;
    const t = A.ctx.currentTime;
    A.ambient.gain.cancelScheduledValues(t);
    A.ambient.gain.setValueAtTime(A.ambient.gain.value, t);
    A.ambient.gain.linearRampToValueAtTime(on ? 0.3 : 0.9, t + 0.8);
  },
  hover() {
    tone(2093, { gain: 0.018, dur: 0.12 });
  },
  click() {
    bell(880, 0.08);
  },
  discover() {
    bell(1174.66, 0.09);
    bell(1567.98, 0.06, 0.12);
  },
  success() {
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => bell(f, 0.08, i * 0.11));
  },
  error() {
    tone(196, { type: "triangle", gain: 0.06, dur: 0.6 });
    tone(185, { type: "triangle", gain: 0.05, dur: 0.6, delay: 0.08 });
  },
  whoosh() {
    const a = ensure();
    if (!a || !enabled) return;
    const t = a.ctx.currentTime;
    const len = a.ctx.sampleRate * 1.6;
    const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.ctx.createBufferSource();
    src.buffer = buf;
    const f = a.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.9);
    f.frequency.exponentialRampToValueAtTime(600, t + 1.5);
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.5);
    g.gain.linearRampToValueAtTime(0, t + 1.5);
    src.connect(f).connect(g).connect(a.fx);
    src.start(t);
  },
};
