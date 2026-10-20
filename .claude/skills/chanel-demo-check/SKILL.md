---
name: chanel-demo-check
description: Pre-presentation checklist for L'Allure Interne — verifies keys, voice, pre-cached demo audio, build, the live deployment and every one-click preset. Use before a live demo or after a deploy ("are we ready for the presentation?").
---

# Chanel demo check

Run these in order and report a short go / no-go table at the end.

1. **Configuration** — `GET /api/health` on the target (local `http://localhost:3000` or the Vercel URL). Expect `claude: true`, `elevenlabs: true`, `voice: true`. If any is false, say which env var is missing (`ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`) — never print key values.
2. **Pre-cached audio** — count files in `public/tts-cache/`. Run `node scripts/precache-tts.mjs` (it only generates missing lines). Every authored line must have a clip; if lines changed since the last run, they will be generated now.
3. **Static checks** — `npm run typecheck`, `npm run lint`, `npm run build`.
4. **Live calls** (costs a few cents) — POST one request each to `/api/ask`, `/api/lexicon` (use the first preset text from `lib/lexicon.ts`) and `/api/oral` (first Beauté question, its Chanel answer). Confirm `source: "claude"` and no `degraded` flag; note latency of each. If a call takes more than ~15 s, recommend switching on **Démo instantanée** for the presentation.
5. **Browser pass** — delegate to the `luxury-ui-qa` agent for the visual run-through (desktop + mobile), or do the quick version: open `/`, enter, check one preset per floor.
6. **Presenter notes** — remind: sound on, click once on the page before the first voice line (browser autoplay), keep **Démo instantanée** on if the network is uncertain; the app falls back to silent reading and the offline engines automatically.
