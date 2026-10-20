import type { DeptId } from "./departments";

export type FloorId = "codes" | "lexicon" | "oral";

export const FLOORS: { id: FloorId; numeral: string; title: string; french: string; intro: string }[] = [
  {
    id: "codes",
    numeral: "I",
    title: "The Codes & the Prism",
    french: "Les Codes",
    intro:
      "The first floor. Here, you learn to see. A code is not a logo, mon cher. It is a promise repeated everywhere, until the world recognises us with its eyes closed. Kapferer called it a prism. I called it common sense.",
  },
  {
    id: "lexicon",
    numeral: "II",
    title: "The Chanel Lexicon Translator",
    french: "Le Lexique",
    intro:
      "The second floor. Words. Show me what you were about to send, and I will tell you which house it belongs to. Most of the time, I am sorry to say, it is not mine.",
  },
  {
    id: "oral",
    numeral: "III",
    title: "Le Grand Oral",
    french: "Le Grand Oral",
    intro:
      "The third floor. Le Grand Oral. Three questions before you meet your Director. Answer as the Maison would answer: briefly, precisely, and without raising your voice.",
  },
];

export const ASK_SUGGESTIONS: Record<DeptId, string[]> = {
  beaute: [
    "Why does N°5 smell of no single flower?",
    "Why do we never discount a fragrance?",
    "What makes Les Exclusifs different from Premium?",
  ],
  mode: [
    "Why is the lining of the 2.55 burgundy?",
    "Why do we say atelier and never factory?",
    "How can Matthieu Blazy change a code without betraying it?",
  ],
  client: [
    "Why can't clients buy a handbag online?",
    "What does relational iconicity mean in a boutique?",
    "How should I write to a client?",
  ],
};

export function debriefLine(avg: number): string {
  if (avg >= 15)
    return "Bien. You speak the language of the Maison without an accent. Go to your Director. Say less than you know. That is how they will know you belong.";
  if (avg >= 12)
    return "You are close, mon cher. The instinct is there; the vocabulary still wavers. Remove the words that are not ours, and you will be ready.";
  return "Not yet. You still think like a marketer from another house. Go back to the second floor, read your words in red, and come back to me. I am patient. A little.";
}
