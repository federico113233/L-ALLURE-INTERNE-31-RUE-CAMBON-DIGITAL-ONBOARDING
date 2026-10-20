# L'Allure Interne — 31 Rue Cambon Digital Onboarding

*A voice-first, editorial onboarding for new interns at the Maison — mentored by Mademoiselle.*

HEC Paris · Strategic Brand Management (Prof. G. Kretz) · Business Project for CHANEL.
Prototype — not an official CHANEL product.

## The experience — *Le Parcours*

A gamified journey, like a luxury video game, in the Maison's codes.

1. **Prologue** — a black envelope sealed in gold. Break the seal: a letter of admission from Mademoiselle. Sign it, choose your Métier (*Parfums Beauté*, *Mode & le19M*, *Client Experience & Digital*), and the black doors of 31 Rue Cambon open onto white.
2. **La Galerie Blanche** — an all-white 3D space where the Maison's icons float: the **N°5** bottle, the **2.55**, the **camellia**, the **Mirrored Staircase**, a **sealed letter** and the **pearls**. Each object is a door.
3. **Mademoiselle** — a full-figure silhouette (boater, tweed, pearls, scissors, two-tone slingbacks) who walks the gallery, follows you, points at what you hover, steps *inside* the object with you, gestures as she speaks (ElevenLabs voice, word-synchronised bubble). Click her to ask anything (Claude).
4. **Chapters** — touch the gold points on the 3D object (the 2.55 opens on its burgundy lining), then play: *Abstrait ou figuratif ?*, *Atelier ou usine ?*, the le19M match, the five colours, Kapferer's prism, client-room situations, the KPIs you would present, the **Lexicon Translator** and **Le Grand Oral**.
5. **Progress** — collect ten **codes**, earn **Allure** points and ranks (*Apprentie → Initiée → Insider → Gardienne des Codes*). The pearls (Le Grand Oral) open after three chapters; the journey ends with your printable **Carte d'Insider**.

Sound design (ambient salon pad, harp notes, bells) is synthesised live in Web Audio. **Démo** (Shift+D) opens every door and makes presets instant for a live presentation; `/?galerie` skips the prologue.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude — Mademoiselle's mind |
| `ELEVENLABS_API_KEY` | Voice (TTS) and transcription (Scribe) |
| `ELEVENLABS_VOICE_ID` | Mademoiselle's voice — created with the steps below |

Without keys the app still works: the voice falls back to a silent reading with the same kinetic typography, and the Lexicon / Grand Oral use offline engines grounded in the knowledge base.

### Mademoiselle's voice (ElevenLabs Voice Design)

```bash
npm run voice:design             # 3 previews in ./voice-previews — listen and choose
npm run voice:save -- <generated_voice_id>
npm run demo:precache            # pre-generates audio for every authored line
```

## Architecture

- **Knowledge base (RAG)** — `knowledge/chanel_rag_knowledge_base.md` is compiled into `lib/knowledge/kb.generated.ts` and injected into Mademoiselle's system prompt (prompt-cached). Department tracks add a context block per request.
- **Claude** — structured outputs (Zod schemas) for the translator and the grader, so errors can be highlighted precisely in the original text.
- **ElevenLabs** — TTS *with timestamps* drives word-level kinetic typography; a Web Audio analyser drives the ink waves; Scribe transcribes spoken answers. Keys never leave the server.
- **Resilience** — pre-cached demo audio, offline engines, and a silent-reading mode keep a live demo running if the network fails.

Built with Next.js, React, Tailwind CSS and Framer Motion. Development agents and skills for Claude Code live in `.claude/` (see `CLAUDE.md`).
