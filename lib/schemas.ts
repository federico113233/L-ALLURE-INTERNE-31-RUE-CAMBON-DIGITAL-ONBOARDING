import { z } from "zod";

// Structured-output schemas for Claude. Keep them free of numeric/length
// constraints (unsupported in structured outputs) — guidance lives in .describe().

export const AskSchema = z.object({
  spoken: z
    .string()
    .describe("Mademoiselle's answer, written as speech: 40 to 110 words, no markdown, no lists."),
  keyline: z
    .string()
    .describe("One aphorism from the answer, at most 12 words, for the kinetic typography."),
  frameworks: z
    .array(z.string())
    .describe("Frameworks explicitly used (e.g. 'Kapferer — Identity Prism'). May be empty."),
});
export type AskResult = z.infer<typeof AskSchema>;

export const LexiconSchema = z.object({
  allureScore: z
    .number()
    .describe("0-100: how close the original text is to the Maison's voice. Hype/discount-heavy text scores under 30."),
  verdict: z.string().describe("A one-line verdict from Mademoiselle, at most 14 words."),
  errors: z
    .array(
      z.object({
        quote: z
          .string()
          .describe("An EXACT, verbatim substring of the original text (same case and punctuation), 1-8 words."),
        category: z
          .string()
          .describe(
            "One of: Hype & jargon, Price & promotion, Mass-market logic, Dior imaginary, Name & heritage, Vocabulary of the ateliers, Transactional logic, Ostentation, Tone.",
          ),
        framework: z
          .string()
          .describe("The framework or guardrail from the knowledge base that this violates, e.g. 'Keller — Brand Equity'."),
        explanation: z.string().describe("Why this is a cultural error at Chanel, 1-2 sentences."),
        correction: z.string().describe("The Chanel-style replacement for the quote."),
      }),
    )
    .describe("Every cultural error, in order of appearance. Empty if the text is already in the Maison's voice."),
  rewrite: z
    .string()
    .describe("The full text rewritten in the Maison's internal style, same format and purpose as the original (email stays an email)."),
  spoken: z
    .string()
    .describe("Mademoiselle explains the main corrections aloud: 50 to 100 words, speech only, no markdown."),
});
export type LexiconOutput = z.infer<typeof LexiconSchema>;

export const OralSchema = z.object({
  score: z.number().describe("Grade out of 20 (French/HEC scale). 16+ exceptional, 12-15 solid, under 10 speaks another house's language."),
  verdict: z.string().describe("One-line verdict, at most 14 words."),
  strengths: z.array(z.string()).describe("1-3 specific strengths of the answer."),
  gaps: z.array(z.string()).describe("1-3 specific gaps or cultural errors, citing the words used."),
  frameworks: z.array(z.string()).describe("Frameworks the ideal answer would mobilise."),
  improvedAnswer: z
    .string()
    .describe("How the intern should have answered the Director: 70-120 words, first person, in the Maison's voice."),
  spoken: z
    .string()
    .describe("Mademoiselle's spoken feedback, starting with the grade: 40 to 90 words, speech only."),
});
export type OralOutput = z.infer<typeof OralSchema>;
