@AGENTS.md

# L'Allure Interne — 31 Rue Cambon Digital Onboarding

HEC Paris Business Project prototype for CHANEL: a voice-first onboarding web app for interns, mentored by **Mademoiselle** (Gabrielle Chanel). Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · Claude API (`@anthropic-ai/sdk`) · ElevenLabs (TTS with timestamps + Scribe STT).

## Map
- `knowledge/chanel_rag_knowledge_base.md` — the source of truth (Italian). `npm run kb` compiles it into `lib/knowledge/kb.generated.ts` (runs automatically before `dev`/`build`; the generated file is committed so type-checking works on a fresh clone).
- `lib/server/prompts.ts` — Mademoiselle's system prompt (persona + full KB, cached). Department context goes into the user turn, never the system prompt, to keep the cache prefix stable.
- `lib/server/claude.ts` — one structured call (`beta.messages.parse` + Zod schema from `lib/schemas.ts`, server-side refusal fallback). Model `claude-opus-5-5` (override with `CLAUDE_MODEL`).
- `app/api/{ask,lexicon,oral}` — Claude routes; each falls back to an offline engine (`lib/lexicon.ts` rules, `lib/oral.ts` heuristic) if Claude is unavailable, flagged `degraded: true`.
- `app/api/{tts,stt,health}` — ElevenLabs proxy (keys stay server-side) and config check.
- `lib/client/voice.tsx` — voice engine: TTS → word timings → kinetic typography; analyser level → ink waves; silent-reading fallback. Checks `public/tts-cache/` first.
- `components/stage/` — the Living Silhouette (octagon, mirror facets, ink waves, kinetic caption).
- `components/floors/` — Étage I (codes & Kapferer prism), II (Lexicon Translator), III (Grand Oral).
- Content: `lib/departments.ts`, `lib/floors.ts`, `lib/lexicon.ts` (presets with authored results).

## Rules
- Every fact shown or spoken must come from the KB. Never "Coco" in Chanel-voice text.
- Design system: palette tokens in `app/globals.css` only; `border-radius: 0` everywhere; Cormorant for display/quotes, Jost uppercase `.label` for UI, Inter 300 body; no emojis, no heavy shadows.
- Changing any authored spoken line → run `npm run demo:precache` (needs ElevenLabs keys).

## Agents & skills (in `.claude/`)
- `chanel-brand-guardian` — read-only review of copy/prompts against the KB guardrails.
- `luxury-ui-qa` — browser QA of the three floors, desktop + mobile, design system.
- `mademoiselle-voice-director` — persona, authored lines, presets, ElevenLabs voice.
- `/chanel-demo-check` — pre-presentation go/no-go checklist.

## Commands
`npm run dev` · `npm run typecheck` · `npm run lint` · `npm run build` · `npm run voice:design` · `npm run voice:save -- <id>` · `npm run demo:precache`
