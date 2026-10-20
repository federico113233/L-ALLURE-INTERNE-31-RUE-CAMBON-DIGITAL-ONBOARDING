import { connection } from "next/server";
import { hasClaude, CLAUDE_MODEL } from "@/lib/server/claude";
import { hasElevenLabs, hasVoice } from "@/lib/server/elevenlabs";

// Reports which services are configured (never the keys themselves).
export async function GET() {
  await connection();
  return Response.json({
    claude: hasClaude(),
    model: CLAUDE_MODEL,
    elevenlabs: hasElevenLabs(),
    voice: hasVoice(),
  });
}
