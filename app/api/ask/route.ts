import { z } from "zod";
import { askMademoiselle, hasClaude } from "@/lib/server/claude";
import { deptBrief } from "@/lib/server/prompts";
import { DeptField, errorResponse, readJson } from "@/lib/server/http";
import { AskSchema, type AskResult } from "@/lib/schemas";
import type { DeptId } from "@/lib/departments";

export const maxDuration = 60;

const Body = z.object({
  dept: DeptField,
  name: z.string().max(80).optional(),
  question: z.string().trim().min(2, "Question is too short").max(1200, "Question is too long"),
  /** What the intern is looking at (e.g. a prism facet) — optional grounding. */
  focus: z.string().max(400).optional(),
});

const OFFLINE: AskResult = {
  spoken:
    "Mon cher, my voice is resting today, but my rule is not. Before you write, before you speak, look in the mirror and remove one thing. Then ask yourself: would this still be Chanel without the logo? If yes, you may continue.",
  keyline: "Before you leave, remove one thing.",
  frameworks: [],
};

export async function POST(req: Request) {
  try {
    const { dept, name, question, focus } = await readJson(req, Body);
    if (!hasClaude()) return Response.json({ ...OFFLINE, degraded: true });
    try {
      const out = await askMademoiselle({
        schema: AskSchema,
        effort: "low",
        user: `${deptBrief(dept as DeptId, name)}
${focus ? `\nThe intern is currently studying: ${focus}\n` : ""}
Task: answer the intern's question as Mademoiselle, in character, grounded in the knowledge base and tailored to their department. Weave in a memory of your own life when it illuminates the point, and name the framework you use.

<intern_question>
${question}
</intern_question>`,
      });
      return Response.json(out);
    } catch (err) {
      console.error("[ask] Claude failed:", err);
      return Response.json({ ...OFFLINE, degraded: true });
    }
  } catch (err) {
    return errorResponse(err);
  }
}
