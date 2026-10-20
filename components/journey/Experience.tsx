"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AskMademoiselle } from "@/components/AskMademoiselle";
import { Mademoiselle } from "@/components/character/Mademoiselle";
import type { WorldHandlers } from "@/components/world/World";
import { sfx } from "@/lib/client/sfx";
import { useSession } from "@/lib/client/session";
import { useVoice } from "@/lib/client/voice";
import { DEPARTMENTS } from "@/lib/departments";
import { ASK_SUGGESTIONS } from "@/lib/floors";
import { CHAPTER_BY_ID, CHAPTERS, HUB_LINES, ORAL_UNLOCK, type ChapterId, type CodeId, type Hotspot } from "@/lib/journey/content";
import { chaptersDone, useJourney } from "@/lib/journey/store";
import { Finale } from "./Finale";
import { HubLabels } from "./HubLabels";
import { CodeToast, Hud } from "./Hud";
import { Prologue } from "./Prologue";
import { RoomPanel } from "./RoomPanel";

const World = dynamic(() => import("@/components/world/World"), { ssr: false });

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

export default function Experience() {
  const session = useSession();
  const voice = useVoice();
  const vp = useViewport();
  const phase = useJourney((s) => s.phase);
  const room = useJourney((s) => s.room);
  const hovered = useJourney((s) => s.hovered);
  const screen = useJourney((s) => s.screen);
  const done = useJourney((s) => s.done);
  const spot = useJourney((s) => s.spot);
  const direct = useJourney((s) => s.direct);
  const j = useJourney.getState();
  const [prologueMounted, setPrologueMounted] = useState(true);
  const [toastQueue, setToastQueue] = useState<CodeId[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const arrived = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dept = session.dept ?? "beaute";
  const demo = session.instantDemo;
  const mobile = vp.w < 1024;
  const oralOpen = demo || chaptersDone(done) >= ORAL_UNLOCK;
  const speak = voice.speak;

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Ambient ducks under her voice.
  useEffect(() => {
    sfx.duck(voice.status === "speaking");
  }, [voice.status]);

  // Code toasts, one at a time.
  useEffect(() => {
    if (!toastQueue.length) return;
    const t = setTimeout(() => setToastQueue((q) => q.slice(1)), 3600);
    return () => clearTimeout(t);
  }, [toastQueue]);

  /* ───── Directing Mademoiselle ───── */
  const floorY = vp.h - (mobile ? 18 : 30);
  useEffect(() => {
    if (phase === "prologue") {
      direct({ target: { x: -160, y: floorY }, hidden: true, pose: "idle", look: null });
      return;
    }
    if (phase === "room" && room) {
      const obj = screen[room];
      const y = mobile ? vp.h * 0.42 : floorY;
      direct({
        target: { x: mobile ? 70 : Math.max(120, vp.w * 0.1), y },
        look: obj?.x ?? vp.w,
        pose: spot ? "point" : voice.status === "speaking" ? "present" : "idle",
      });
      return;
    }
    // hub & finale
    if (hovered && screen[hovered]) {
      const sx = screen[hovered]!.x;
      const x = Math.min(vp.w - 80, Math.max(80, sx - (mobile ? 90 : 150)));
      direct({ target: { x, y: floorY }, look: sx, pose: "point" });
    } else {
      direct({ target: { x: mobile ? 60 : Math.max(90, vp.w * 0.055), y: floorY }, look: vp.w / 2, pose: "idle" });
    }
  }, [phase, room, hovered, screen, vp.w, vp.h, mobile, floorY, direct, spot, voice.status]);

  // Presenter shortcut: /?galerie skips the prologue when a name and Métier are already known.
  useEffect(() => {
    if (!session.ready || !session.dept || !prologueMounted) return;
    if (!new URLSearchParams(window.location.search).has("galerie")) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot skip on load
    setPrologueMounted(false);
    arrive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.ready]);

  /* ───── Keyboard ───── */
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.shiftKey && e.key.toLowerCase() === "d") session.setInstantDemo(!session.instantDemo);
      if (e.key === "Escape" && useJourney.getState().phase === "room") goGallery();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.instantDemo]);

  /* ───── Flow ───── */
  function arrive() {
    j.setPhase("hub");
    later(() => direct({ hidden: false }), 500);
    if (!arrived.current) {
      arrived.current = true;
      later(() => void speak(HUB_LINES.arrival(DEPARTMENTS[dept].name)), 2600);
    }
  }

  const openRoom = useCallback(
    (id: ChapterId) => {
      if (id === "oral" && !oralOpen) {
        sfx.error();
        void speak(HUB_LINES.locked);
        return;
      }
      const c = CHAPTER_BY_ID[id];
      const sx = useJourney.getState().screen[id]?.x ?? vp.w / 2;
      sfx.click();
      voice.stop();
      setAskOpen(false);
      direct({ target: { x: sx - 40, y: floorY }, look: sx, pose: "walk" });
      later(() => {
        direct({ hidden: true, pose: "enter" });
        sfx.whoosh();
      }, 650);
      later(() => j.enterRoom(id), 850);
      later(() => {
        direct({ hidden: false, pose: "present" });
        void speak(c.intro);
      }, 2300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [oralOpen, vp.w, floorY, speak],
  );

  function goGallery() {
    voice.stop();
    sfx.whoosh();
    if (useJourney.getState().phase === "finale") j.setPhase("hub");
    else j.leaveRoom();
    later(() => void speak(HUB_LINES.return), 1200);
  }

  const handlers: WorldHandlers = useMemo(
    () => ({
      onOpen: openRoom,
      onHover: (id) => {
        if (id && id !== useJourney.getState().hovered) sfx.hover();
        useJourney.getState().setHovered(id);
      },
      onHotspot: (h: Hotspot) => {
        const s = useJourney.getState();
        if (!s.room) return;
        if (s.find(`${s.room}:${h.id}`)) sfx.discover();
        else sfx.click();
        s.setSpot(h.id);
        if (h.effect === "openBag") s.setBagOpen(true);
        void speak(h.spoken);
      },
    }),
    [openRoom, speak],
  );

  function stepComplete(i: number) {
    const s = useJourney.getState();
    if (!s.room) return;
    s.find(`${s.room}:step:${i}`, 0);
    const code = CHAPTER_BY_ID[s.room].steps[i].code;
    if (code === "perles") return; // awarded on the oral result
    if (s.award(code)) {
      sfx.success();
      setToastQueue((q) => [...q, code]);
    }
  }

  function finishChapter() {
    const s = useJourney.getState();
    if (!s.room) return;
    const c = CHAPTER_BY_ID[s.room];
    const first = !s.done[c.id];
    s.completeRoom(c.id);
    voice.stop();
    if (c.id === "oral") {
      sfx.success();
      s.setPhase("finale");
      s.setHovered(null);
      later(() => void speak(c.outro), 900);
      return;
    }
    s.leaveRoom();
    sfx.whoosh();
    later(() => void speak(first ? c.outro : HUB_LINES.return), 900);
  }

  function oralFinish(avg: number) {
    const s = useJourney.getState();
    s.setOralAvg(avg);
    if (avg >= 12 && s.award("perles")) setToastQueue((q) => [...q, "perles"]);
  }

  const chapter = room ? CHAPTER_BY_ID[room] : null;
  const doneCount = chaptersDone(done);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-blanc">
      <World handlers={handlers} dept={session.dept} unlockAll={demo} />
      <HubLabels dept={session.dept} unlockAll={demo} />

      {/* soft vignette for depth */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(229,220,203,0.35)_100%)]" />

      {phase !== "prologue" && (
        <Hud
          onGallery={goGallery}
          soundOn={soundOn}
          onToggleSound={() => {
            const v = !soundOn;
            setSoundOn(v);
            sfx.setEnabled(v);
            voice.setMuted(!v);
          }}
          demo={demo}
          onToggleDemo={() => session.setInstantDemo(!demo)}
        />
      )}

      {/* Hub caption */}
      <AnimatePresence>
        {phase === "hub" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pointer-events-none fixed inset-x-0 top-24 z-10 text-center sm:top-8"
          >
            <p className="label text-or">La Galerie · 31 Rue Cambon</p>
            <h1 className="display mt-2 text-4xl sm:text-5xl">
              {session.name ? (
                <>
                  Bienvenue, <span className="quote">{session.name}</span>
                </>
              ) : (
                "Bienvenue"
              )}
            </h1>
            <p className="label mt-3 text-graphite">
              Touchez un objet pour entrer · {doneCount} / {CHAPTERS.length - 1} chapitres
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "room" && chapter && (
          <RoomPanel
            key={chapter.id}
            chapter={chapter}
            dept={dept}
            onStepComplete={stepComplete}
            onFinishChapter={finishChapter}
            onOralFinish={oralFinish}
          />
        )}
      </AnimatePresence>

      <Mademoiselle
        onClick={() => {
          sfx.click();
          setAskOpen((v) => !v);
        }}
      />

      {/* Ask Mademoiselle */}
      <AnimatePresence>
        {askOpen && phase !== "prologue" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-40 max-h-[70vh] w-[min(560px,92vw)] -translate-x-1/2 overflow-y-auto border border-noir/10 bg-blanc/95 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="label text-or">Demander à Mademoiselle</p>
              <button onClick={() => setAskOpen(false)} className="label text-graphite hover:text-noir">
                Fermer
              </button>
            </div>
            <AskMademoiselle suggestions={ASK_SUGGESTIONS[dept]} focus={chapter ? `Chapter: ${chapter.name} (${chapter.subtitle})` : "The gallery"} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "finale" && (
          <Finale
            name={session.name}
            dept={dept}
            onGallery={goGallery}
            onRestart={() => {
              voice.stop();
              j.reset();
              arrived.current = false;
              setPrologueMounted(true);
            }}
          />
        )}
      </AnimatePresence>

      <CodeToast code={toastQueue[0] ?? null} />

      {prologueMounted && <Prologue onEnter={arrive} onDone={() => setPrologueMounted(false)} />}
    </main>
  );
}
