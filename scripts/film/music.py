# Offline render of the app's generative ambience (lib/client/sfx.ts):
# a warm D major 9 / B minor pad with sparse harp notes, in a soft reverb.
#   python scripts/film/music.py <seconds> video/music.wav
import sys
import wave

import numpy as np

SR = 44100
seconds = float(sys.argv[1]) if len(sys.argv) > 1 else 64
out = sys.argv[2] if len(sys.argv) > 2 else "video/music.wav"
rng = np.random.default_rng(31)
n = int(seconds * SR)
L = np.zeros(n)
R = np.zeros(n)

PADS = [
    [146.83, 220.0, 277.18, 329.63],
    [123.47, 185.0, 246.94, 293.66],
    [110.0, 164.81, 220.0, 277.18],
    [130.81, 196.0, 246.94, 329.63],
]
HARP = [587.33, 659.25, 739.99, 880.0, 987.77, 1108.73, 1318.51]


def add(buf, start, sig):
    s = int(start * SR)
    if s >= n:
        return
    e = min(n, s + len(sig))
    buf[s:e] += sig[: e - s]


chord_len = 8.0
t = 0.0
i = 0
while t < seconds:
    dur = chord_len + 4.0
    tt = np.arange(int(dur * SR)) / SR
    env = np.clip(np.minimum(tt / (dur * 0.38), (dur - tt) / (dur * 0.45)), 0, 1) ** 1.6
    for j, f in enumerate(PADS[i % len(PADS)]):
        g = 0.055 / (j + 1) ** 0.7
        for det, pan in ((-4, 0.35), (4, 0.65)):
            fr = f * 2 ** (det / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            sig = np.sin(2 * np.pi * fr * tt + ph) + (0.11 if j else 0) * np.sin(2 * np.pi * 3 * fr * tt + ph)
            sig *= env * g * (1 + 0.04 * np.sin(2 * np.pi * 0.13 * tt + j))
            add(L, t, sig * (1 - pan))
            add(R, t, sig * pan)
    # a few harp notes over each chord
    for _ in range(rng.integers(1, 4)):
        at = t + rng.uniform(1.2, chord_len - 0.8)
        f = HARP[rng.integers(0, len(HARP))]
        d = 3.6
        th = np.arange(int(d * SR)) / SR
        pluck = (np.sin(2 * np.pi * f * th) + 0.3 * np.sin(2 * np.pi * 2 * f * th) * np.exp(-th * 3)) * np.exp(-th * 1.6)
        pluck *= np.minimum(1, th / 0.004) * 0.05
        pan = rng.uniform(0.25, 0.75)
        add(L, at, pluck * (1 - pan))
        add(R, at, pluck * pan)
    t += chord_len
    i += 1


def reverb(x, seconds=3.4, decay=2.6, seed=7):
    m = int(seconds * SR)
    ir = np.random.default_rng(seed).uniform(-1, 1, m) * (1 - np.arange(m) / m) ** decay
    size = 1 << int(np.ceil(np.log2(len(x) + m)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return y / (np.max(np.abs(y)) + 1e-9)


wetL, wetR = reverb(L, seed=7), reverb(R, seed=11)
L = L / (np.max(np.abs(L)) + 1e-9) * 0.6 + wetL * 0.4
R = R / (np.max(np.abs(R)) + 1e-9) * 0.6 + wetR * 0.4
# fades
fi, fo = int(2.5 * SR), int(4.5 * SR)
ramp = np.ones(n)
ramp[:fi] = np.linspace(0, 1, fi)
ramp[-fo:] = np.linspace(1, 0, fo)
L *= ramp
R *= ramp
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
st = (np.stack([L, R], axis=1) / peak * 0.5 * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(st.tobytes())
print(f"ok {out}: {seconds:.1f}s")
