import { z } from "zod";
import { askMademoiselle, hasClaude } from "@/lib/server/claude";
import { deptBrief } from "@/lib/server/prompts";
import { DeptField, errorResponse, readJson } from "@/lib/server/http";
import { LexiconSchema } from "@/lib/schemas";
import { offlineLexicon, type LexiconResult } from "@/lib/lexicon";
import type { DeptId } from "@/lib/departments";

export const maxDuration = 60;

const Body = z.object({
  dept: DeptField,
  name: z.string().max(80).optional(),
  text: z.string().trim().min(3, "Text is too short").max(2500, "Text is too long"),
});

export async function POST(req: Request) {
  try {
    const { dept, name, text } = await readJson(req, Body);
    if (!hasClaude()) return Response.json({ ...offlineLexicon(text), degraded: true });

    try {
      const out = await askMademoiselle({
        schema: LexiconSchema,
        effort: "medium",
        user: `${deptBrief(dept as DeptId, name)}

Task: THE CHANEL LEXICON TRANSLATOR.
The intern pasted the text below (an email, a slide, or marketing copy). Audit it against the knowledge base:
1. Find every "cultural error": hype or TikTok jargon, price/promotion/bundle language, mass-market logic (penetration, availability), Dior's imaginary (dream, fairy tale, figurative florals, references to Dior products), the name "Coco", factory/supplier vocabulary, transactional language (users, funnel, conversion, customers), ostentation. Quote each one VERBATIM from the text.
2. Tie each error to the precise framework or guardrail (Kapferer's Prism facet, Keller's Brand Equity, Holt's Cultural Iconicity, The Luxury Strategy, the Chanel vs. Dior guardrails, the department lexicon).
3. Rewrite the whole text in the Maison's internal style, keeping its purpose and format, in the same language as the original.
4. Then explain the key corrections aloud, as Mademoiselle.

<intern_text>
${text}
</intern_text>`,
      });
      const result: LexiconResult = {
        ...out,
        allureScore: Math.round(Math.min(100, Math.max(0, out.allureScore))),
        source: "claude",
      };
      return Response.json(result);
    } catch (err) {
      console.error("[lexicon] Claude failed, using offline engine:", err);
      return Response.json({ ...offlineLexicon(text), degraded: true });
    }
  } catch (err) {
    return errorResponse(err);
  }
}
