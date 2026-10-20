# L'Allure Interne — 31 Rue Cambon Digital Onboarding

*A voice-first, editorial onboarding for new interns at the Maison — mentored by Mademoiselle.*

HEC Paris · Strategic Brand Management (Prof. G. Kretz) · Business Project for CHANEL.
Prototype — not an official CHANEL product.

## The experience

| | |
|---|---|
| **L'Ingresso** | The intern enters their name and Métier: *Parfums Beauté*, *Mode & le19M*, or *Client Experience & Digital*. Everything that follows adapts to the department. |
| **Mademoiselle** | Gabrielle Chanel as AI mentor (Claude). She speaks in the first person — N°5 with Ernest Beaux in 1921, 31 Rue Cambon, Aubazine, Deauville — and connects her memories to Kapferer, Keller and Holt. Her voice is a tailored ElevenLabs voice. |
| **The Living Silhouette** | A black-and-white cut-paper silhouette (boater, pearls, camellia, tailor's scissors) inside the octagon of Place Vendôme / the N°5 stopper, framed by the facets of the Mirrored Staircase. When she speaks, ink waves ripple to her voice and her words appear in gold and white kinetic typography, synchronised word by word. |
| **Étage I · Les Codes** | Identity vs. Equity, an interactive Kapferer prism applied to the department, the Maison's codes, the four levels of iconicity, and the Chanel ≠ Dior guardrails. Ask Mademoiselle anything. |
| **Étage II · Le Lexique** | The Chanel Lexicon Translator: paste an email, a slide or copy; cultural errors are marked in red with the framework they violate, then rewritten in the Maison's voice and explained aloud. |
| **Étage III · Le Grand Oral** | Three critical questions before meeting the department Director. Answer by voice (ElevenLabs Scribe) or text; graded out of 20 with strengths, gaps and Mademoiselle's model answer. |

One-click **demo presets** contrast the "Dior reflex" with the Chanel answer on floors II and III. **Démo instantanée** serves preset results from the authored script with zero latency, for the live presentation.

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
