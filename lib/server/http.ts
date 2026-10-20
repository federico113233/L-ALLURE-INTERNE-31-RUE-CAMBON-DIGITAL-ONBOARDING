import "server-only";
import { z } from "zod";
import { isDeptId } from "@/lib/departments";

export const DeptField = z.string().refine(isDeptId, "Unknown department");

export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequest("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new BadRequest(parsed.error.issues.map((i) => i.message).join("; "));
  return parsed.data;
}

export class BadRequest extends Error {}

export function errorResponse(err: unknown): Response {
  if (err instanceof BadRequest) return Response.json({ error: err.message }, { status: 400 });
  console.error(err);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
