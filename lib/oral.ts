// Le Grand Oral — evaluation types and an offline evaluator (fallback).

export interface OralEvaluation {
  /** Out of 20, as at HEC and in the French system. */
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  frameworks: string[];
  improvedAnswer: string;
  spoken: string;
  source?: "claude" | "offline";
}

const CHANEL_SIGNALS =
  /\b(brand equity|keller|kapferer|prism|holt|cultural iconicity|relational|relationship|savoir[- ]faire|atelier|le19m|lesage|montex|lemari[ée]|massaro|maison michel|scarcity|selectiv\w*|desirability|resonance|appointment|boutique|repair|care|heritage|olivier polge|ernest beaux|1921|pégomas|pegomas|les exclusifs|comète|comete|coromandel|allure|mademoiselle|gabrielle chanel|insiders?|myth|freedom|understated|luxury strategy|n°5|no 5|camellia|31 rue cambon|blazy|codes?)\b/gi;

const RIVAL_SIGNALS =
  /\b(viral|tik ?tok|discounts?|promo\w*|bundles?|flash sale|penetration|market share|dream\w*|fairy|sauvage|dior|coco|factory|suppliers?|frictionless|one[- ]click|conversion|funnel|traffic|users?|upsell|hype|drop|influencers?|seduc\w*|opulent|masstige|black friday|urgency)\b/gi;

function uniqueMatches(text: string, re: RegExp): string[] {
  return [...new Set([...text.matchAll(re)].map((m) => m[0].toLowerCase()))];
}

export function offlineOral(answer: string, chanelAnswer: string): OralEvaluation {
  const good = uniqueMatches(answer, CHANEL_SIGNALS);
  const bad = uniqueMatches(answer, RIVAL_SIGNALS);
  // Never echo a rival's name back in the feedback.
  const shown = bad.filter((w) => !/dior|sauvage/.test(w));
  const raw = 9 + good.length * 1.2 - bad.length * 2;
  const score = Math.round(Math.min(19, Math.max(3, raw)));
  const passed = score >= 12;
  return {
    score,
    verdict: passed
      ? "Vous avez compris la Maison. The Director will listen."
      : "Not yet. You are speaking the language of another house.",
    strengths: good.length
      ? [`You used the Maison's vocabulary: ${good.slice(0, 5).join(", ")}.`]
      : ["You answered the question directly — that is a beginning."],
    gaps: bad.length
      ? [`These words betray you: ${(shown.length ? shown : ["a rival's name"]).slice(0, 5).join(", ")}. They belong to mass-market logic, or to another house.`]
      : ["Anchor your argument in a framework: Kapferer's prism, Keller's brand equity, or Holt's cultural iconicity."],
    frameworks: ["Kapferer — Identity Prism", "Keller — Brand Equity", "Kapferer & Bastien — The Luxury Strategy"],
    improvedAnswer: chanelAnswer,
    spoken: passed
      ? `${score} out of 20. Bien. You defended the Maison without raising your voice. That is the whole art.`
      : `${score} out of 20. Mon cher, you answered like a marketer from another house. Read the answer I would give. Then say it again, with fewer words.`,
    source: "offline",
  };
}
