import { z } from "zod";
import { askMademoiselle, hasClaude } from "@/lib/server/claude";
import { deptBrief } from "@/lib/server/prompts";
import { DeptField, errorResponse, readJson } from "@/lib/server/http";
import { OralSchema } from "@/lib/schemas";
import { offlineOral, type OralEvaluation } from "@/lib/oral";
import { DEPARTMENTS, type DeptId } from "@/lib/departments";

export const maxDuration = 60;

const Body = z.object({
  dept: DeptField,
  name: z.string().max(80).optional(),
  questionId: z.string().max(40),
  answer: z.string().trim().min(3, "Answer is too short").max(3000, "Answer is too long"),
});

export async function POST(req: Request) {
  try {
    const { dept, name, questionId, answer } = await readJson(req, Body);
    const d = DEPARTMENTS[dept as DeptId];
    const q = d.oral.find((x) => x.id === questionId);
    if (!q) return Response.json({ error: "Unknown question" }, { status: 400 });

    if (!hasClaude()) return Response.json({ ...offlineOral(answer, q.chanelAnswer), degraded: true });

    try {
      const out = await askMademoiselle({
        schema: OralSchema,
        effort: "medium",
        user: `${deptBrief(dept as DeptId, name)}

Task: LE GRAND ORAL — a rehearsal before the intern's meeting with the ${d.director}.
You asked this question:
"${q.question}"
Stakes: ${q.stakes}

Evaluate the intern's answer as Mademoiselle, demanding but fair. Reward: protection of brand equity, use of the Maison's codes and savoir-faire, relational thinking, correct use of the frameworks (Kapferer, Keller, Holt, The Luxury Strategy), concision. Penalise: hype, discounts, mass-market logic, Dior's imaginary, transactional vocabulary, vagueness. A one-line answer cannot score above 10. If the answer is off-topic or not a serious attempt, say so and grade accordingly.

<intern_answer>
${answer}
</intern_answer>`,
      });
      const result: OralEvaluation = {
        ...out,
        score: Math.round(Math.min(20, Math.max(0, out.score)) * 2) / 2,
        source: "claude",
      };
      return Response.json(result);
    } catch (err) {
      console.error("[oral] Claude failed, using offline evaluator:", err);
      return Response.json({ ...offlineOral(answer, q.chanelAnswer), degraded: true });
    }
  } catch (err) {
    return errorResponse(err);
  }
}
