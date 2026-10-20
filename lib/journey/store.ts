"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CHAPTERS, type ChapterId, type CodeId } from "./content";

export type Phase = "prologue" | "hub" | "room" | "finale";
export type Pose = "idle" | "walk" | "point" | "present" | "enter";

interface ScreenPoint {
  x: number;
  y: number;
}

interface JourneyState {
  phase: Phase;
  room: ChapterId | null;
  step: number;
  hovered: ChapterId | null;
  bagOpen: boolean;
  /** The hotspot currently open in the room panel. */
  spot: string | null;

  // progress (persisted)
  found: Record<string, true>;
  codes: CodeId[];
  points: number;
  done: Partial<Record<ChapterId, true>>;
  oralAvg: number | null;

  // character
  target: ScreenPoint | null;
  /** Screen x she should face once arrived. */
  look: number | null;
  pose: Pose;
  hidden: boolean;

  /** Projected screen positions of the 3D objects (updated by the scene). */
  screen: Partial<Record<ChapterId, ScreenPoint>>;

  setPhase: (p: Phase) => void;
  enterRoom: (id: ChapterId) => void;
  leaveRoom: () => void;
  setStep: (n: number) => void;
  setHovered: (id: ChapterId | null) => void;
  setBagOpen: (v: boolean) => void;
  setSpot: (id: string | null) => void;
  find: (key: string, points?: number) => boolean;
  award: (code: CodeId) => boolean;
  addPoints: (n: number) => void;
  completeRoom: (id: ChapterId) => void;
  setOralAvg: (v: number) => void;
  setScreen: (id: ChapterId, p: ScreenPoint) => void;
  direct: (o: { target?: ScreenPoint | null; look?: number | null; pose?: Pose; hidden?: boolean }) => void;
  reset: () => void;
}

const fresh = {
  found: {},
  codes: [] as CodeId[],
  points: 0,
  done: {},
  oralAvg: null,
};

export const useJourney = create<JourneyState>()(
  persist(
    (set, get) => ({
      phase: "prologue",
      room: null,
      step: 0,
      hovered: null,
      bagOpen: false,
      spot: null,
      ...fresh,
      target: null,
      look: null,
      pose: "idle",
      hidden: true,
      screen: {},

      setPhase: (phase) => set({ phase }),
      enterRoom: (id) => set({ phase: "room", room: id, step: 0, hovered: null, bagOpen: false, spot: null }),
      leaveRoom: () => set({ phase: "hub", room: null, step: 0, bagOpen: false, spot: null }),
      setStep: (step) => set({ step, spot: null }),
      setHovered: (hovered) => set({ hovered }),
      setBagOpen: (bagOpen) => set({ bagOpen }),
      setSpot: (spot) => set({ spot }),
      find: (key, pts = 20) => {
        if (get().found[key]) return false;
        set((s) => ({ found: { ...s.found, [key]: true }, points: s.points + pts }));
        return true;
      },
      award: (code) => {
        if (get().codes.includes(code)) return false;
        set((s) => ({ codes: [...s.codes, code], points: s.points + 50 }));
        return true;
      },
      addPoints: (n) => set((s) => ({ points: s.points + n })),
      completeRoom: (id) =>
        set((s) => (s.done[id] ? s : { done: { ...s.done, [id]: true }, points: s.points + 80 })),
      setOralAvg: (oralAvg) => set({ oralAvg }),
      setScreen: (id, p) =>
        set((s) => {
          const prev = s.screen[id];
          if (prev && Math.abs(prev.x - p.x) < 2 && Math.abs(prev.y - p.y) < 2) return s;
          return { screen: { ...s.screen, [id]: p } };
        }),
      direct: (o) =>
        set((s) => ({
          target: o.target === undefined ? s.target : o.target,
          look: o.look === undefined ? s.look : o.look,
          pose: o.pose ?? s.pose,
          hidden: o.hidden ?? s.hidden,
        })),
      reset: () => set({ ...fresh, phase: "prologue", room: null, step: 0, bagOpen: false }),
    }),
    {
      name: "allure-interne:journey",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ found: s.found, codes: s.codes, points: s.points, done: s.done, oralAvg: s.oralAvg }),
    },
  ),
);

export function chaptersDone(done: Partial<Record<ChapterId, true>>) {
  return CHAPTERS.filter((c) => c.id !== "oral" && done[c.id]).length;
}
