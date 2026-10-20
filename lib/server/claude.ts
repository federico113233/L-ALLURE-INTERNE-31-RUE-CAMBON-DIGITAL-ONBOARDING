import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { MADEMOISELLE_SYSTEM } from "./prompts";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  return client;
}

const SYSTEM = [
  {
    type: "text" as const,
    text: MADEMOISELLE_SYSTEM,
    cache_control: { type: "ephemeral" as const, ttl: "1h" as const },
  },
];

export class RefusalError extends Error {}

/**
 * One structured call to Mademoiselle. Returns the parsed object.
 * Server-side refusal fallback is enabled ("default"), so a rare policy decline
 * is retried on the server-defined fallback model inside the same call.
 */
export async function askMademoiselle<S extends z.ZodType>(opts: {
  schema: S;
  user: string;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const response = await getClient().beta.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    output_config: {
      effort: opts.effort ?? "low",
      format: betaZodOutputFormat(opts.schema),
    },
    messages: [{ role: "user", content: opts.user }],
  });

  if (response.stop_reason === "refusal") {
    throw new RefusalError("Mademoiselle declined to answer.");
  }
  if (!response.parsed_output) {
    throw new Error(`Unparseable response (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output as z.infer<S>;
}
