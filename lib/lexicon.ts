// The Chanel Lexicon: result types, demo presets, and an offline rule engine
// used when Claude is unreachable (so a live presentation never shows a blank).
import type { DeptId } from "./departments";

export interface LexiconError {
  /** Exact substring of the original text. */
  quote: string;
  category: string;
  framework: string;
  explanation: string;
  correction: string;
}

export interface LexiconResult {
  allureScore: number;
  verdict: string;
  errors: LexiconError[];
  rewrite: string;
  spoken: string;
  source?: "claude" | "offline" | "preset";
}

export interface LexiconPreset {
  id: string;
  dept: DeptId;
  label: string;
  kind: string;
  text: string;
  result: LexiconResult;
}

export const LEXICON_PRESETS: LexiconPreset[] = [
  {
    id: "beaute-launch",
    dept: "beaute",
    label: "The “Sauvage” launch brief",
    kind: "Marketing brief",
    text: "We need a viral TikTok launch with discounts to maximise brand penetration like Sauvage did, and make customers dream with Coco.",
    result: {
      allureScore: 18,
      verdict: "Six errors in one sentence. Trop de bruit, pas assez d'Allure.",
      errors: [
        {
          quote: "viral TikTok launch",
          category: "Hype & jargon",
          framework: "Kapferer & Bastien — The Luxury Strategy",
          explanation:
            "Luxury is not chased through buzz; it is built through desirability over time. Hype recruits Soldiers, not Insiders (Emotional iconicity).",
          correction: "an anticipated unveiling",
        },
        {
          quote: "discounts",
          category: "Price & promotion",
          framework: "Keller — Brand Equity",
          explanation:
            "A discount teaches the client that the creation is worth less than its price. In Parfums Beauté, promotions and bundles are forbidden vocabulary.",
          correction: "a privileged invitation",
        },
        {
          quote: "maximise brand penetration",
          category: "Mass-market logic",
          framework: "The Luxury Strategy — scarcity",
          explanation:
            "Penetration is FMCG language (physical availability). The Maison seeks resonance and deliberate scarcity.",
          correction: "deepen resonance with our clients",
        },
        {
          quote: "like Sauvage did",
          category: "Dior imaginary",
          framework: "Guardrails — Chanel vs. Dior",
          explanation:
            "Sauvage is figurative and desert-cowboy; our olfactory language is abstract and architectural. We never benchmark on Dior's codes.",
          correction: "in the abstraction of N°5",
        },
        {
          quote: "make customers dream",
          category: "Dior imaginary",
          framework: "Kapferer Prism — Personality",
          explanation:
            "“Dream” is Dior's archetype. Chanel offers L'Allure: reality elevated to style. And we speak of clients, not customers.",
          correction: "offer our clients L'Allure",
        },
        {
          quote: "Coco",
          category: "Name & heritage",
          framework: "Kapferer Prism — Culture",
          explanation:
            "In formal writing she is Gabrielle Chanel, or Mademoiselle. Never Coco.",
          correction: "Gabrielle Chanel",
        },
      ],
      rewrite:
        "We will unveil the creation the way the Maison always has: patiently, and to those who are waiting for it. No price argument — only the savoir-faire of the composition and the heritage of N°5, abstract as it was in 1921. Our clients will not be asked to dream; they will be offered L'Allure, in the spirit of Gabrielle Chanel.",
      spoken:
        "Mon cher. Viral, discounts, penetration — this is the vocabulary of a supermarket. And Sauvage? We do not borrow another house's desert. Desire is not a campaign; it is a patience. You do not make a client dream. You give her L'Allure. And please — Gabrielle Chanel. Or Mademoiselle. Never Coco.",
      source: "preset",
    },
  },
  {
    id: "mode-email",
    dept: "mode",
    label: "The “factory” email",
    kind: "Internal email",
    text: "Hi team, our supplier's factory can scale production of the new bag fast. Let's create hype with a limited drop, a dreamy fairy-tale campaign and opulent visuals so customers go crazy.",
    result: {
      allureScore: 22,
      verdict: "An email from a factory, about a fairy tale. Neither is ours.",
      errors: [
        {
          quote: "supplier's factory",
          category: "Vocabulary of the ateliers",
          framework: "Track 2 — Mode lexicon",
          explanation:
            "The Maison never says factory or supplier. We speak of Ateliers, Manufactures, Maisons d'Art and Premières d'Atelier.",
          correction: "our atelier",
        },
        {
          quote: "scale production of the new bag fast",
          category: "Mass-market logic",
          framework: "The Luxury Strategy — scarcity",
          explanation:
            "Speed and scale belong to fast fashion. A Chanel creation is made with the time the hand requires.",
          correction: "bring the new creation to life with the time it requires",
        },
        {
          quote: "create hype with a limited drop",
          category: "Hype & jargon",
          framework: "Emotional iconicity — Insiders, not Soldiers",
          explanation:
            "“Drop” and “hype” manufacture ephemeral desire. Controlled launches (like CHANEL 25) protect exclusivity without noise.",
          correction: "introduce it through a controlled launch",
        },
        {
          quote: "dreamy fairy-tale campaign",
          category: "Dior imaginary",
          framework: "Guardrails — Chanel vs. Dior",
          explanation:
            "The fairy tale and the enchanted garden are Dior's. Chanel speaks of modernity, rigour and freedom of movement.",
          correction: "a campaign of modernity and movement",
        },
        {
          quote: "opulent visuals",
          category: "Ostentation",
          framework: "Kapferer Prism — Personality (understated)",
          explanation:
            "Opulence is theatrical. The Maison is effortless and understated: pure lines, beige and black.",
          correction: "pure, essential visuals",
        },
        {
          quote: "customers go crazy",
          category: "Transactional logic",
          framework: "Kapferer Prism — Reflection",
          explanation:
            "Our client is autonomous and self-assured; we do not seek to make her lose her head, but to agree with who she already is.",
          correction: "our clients recognise themselves",
        },
      ],
      rewrite:
        "Dear all, our atelier will bring the new creation to life with the time it requires. We will introduce it through a controlled launch, with a campaign of modernity and movement, and pure, essential visuals — so that our clients recognise themselves in it.",
      spoken:
        "A factory? Non. We have ateliers. Hands that remember. And a fairy tale, with opulent visuals — that is the house on Avenue Montaigne, not mine. I cut the corset away; do not sew it back on. Fewer words. Purer lines. The client does not go crazy, mon cher. She recognises herself.",
      source: "preset",
    },
  },
  {
    id: "client-slide",
    dept: "client",
    label: "The “funnel” slide",
    kind: "Strategy slide",
    text: "Q3 priorities: frictionless one-click checkout for handbags, a 48h flash sale for top users, and push notifications to boost traffic and conversion through the funnel.",
    result: {
      allureScore: 15,
      verdict: "A funnel is a tool for liquids. Our clients are not poured.",
      errors: [
        {
          quote: "frictionless one-click checkout for handbags",
          category: "Transactional logic",
          framework: "Track 3 — intentional selectivity",
          explanation:
            "There are no online sales for Mode. One-click is Kahneman's System 1 — FMCG impulse logic (physical availability), the opposite of Chanel.",
          correction: "a personal way to book an appointment in boutique",
        },
        {
          quote: "48h flash sale",
          category: "Price & promotion",
          framework: "Keller — Brand Equity",
          explanation:
            "Urgency and markdowns erode equity and teach clients to wait for a price. The Maison never creates artificial pressure.",
          correction: "a private moment of discovery",
        },
        {
          quote: "top users",
          category: "Transactional logic",
          framework: "Kapferer Prism — Relationship",
          explanation:
            "They are clients, known by name — not users ranked by spend.",
          correction: "our most loyal clients",
        },
        {
          quote: "push notifications to boost traffic",
          category: "Hype & jargon",
          framework: "Experiential iconicity — relational, not automatic",
          explanation:
            "Relentless notifications are noise. A word from the Maison is rare, personal, and therefore read.",
          correction: "a personal word from their advisor",
        },
        {
          quote: "conversion through the funnel",
          category: "Transactional logic",
          framework: "Relational iconicity",
          explanation:
            "We do not convert anyone; we receive. Measure appointments, care and loyalty over years.",
          correction: "relationships that last",
        },
      ],
      rewrite:
        "Q3 priorities: a personal way to book an appointment in boutique; a private moment of discovery for our most loyal clients; and a personal word from their advisor — to nourish relationships that last.",
      spoken:
        "Frictionless, flash sale, funnel. You have built a beautiful machine for selling detergent. At the Maison, friction is not the enemy. Haste is. We do not push a client. We receive her, we remember her, we repair what she loves. Remove the urgency, mon cher. Keep the time.",
      source: "preset",
    },
  },
  {
    id: "beaute-copy",
    dept: "beaute",
    label: "The “rose garden” copy",
    kind: "Social copy",
    text: "Smell like a rose garden! Our new addictive scent is a total traffic stopper #Smellmaxxing — now with a free mini bundle. Luxury for everyone.",
    result: {
      allureScore: 10,
      verdict: "A rose garden, a hashtag and a bundle. Three houses — none of them ours.",
      errors: [
        {
          quote: "Smell like a rose garden",
          category: "Dior imaginary",
          framework: "Guardrails — olfactory approach",
          explanation:
            "Figurative, floral description is Dior's (Miss Dior's rose). Chanel composes abstractly: N°5 imitates no single flower.",
          correction: "An abstract composition",
        },
        {
          quote: "addictive",
          category: "Hype & jargon",
          framework: "Kapferer Prism — Personality",
          explanation:
            "Addiction is compulsion. Chanel's personality is free and intellectual; the client chooses.",
          correction: "unforgettable",
        },
        {
          quote: "traffic stopper #Smellmaxxing",
          category: "Hype & jargon",
          framework: "Guardrails — social jargon",
          explanation:
            "Exactly the TikTok vocabulary the guardrails forbid. Desirability over time, never the trend of the week.",
          correction: "a signature that lingers",
        },
        {
          quote: "free mini bundle",
          category: "Price & promotion",
          framework: "Track 1 — forbidden vocabulary",
          explanation:
            "Bundles and gifts-with-purchase are banned in Parfums Beauté. They cheapen the ritual.",
          correction: "an invitation to discover it in boutique",
        },
        {
          quote: "Luxury for everyone",
          category: "Mass-market logic",
          framework: "The Luxury Strategy — masstige",
          explanation:
            "Masstige dissolves exclusivity. Luxury is selective by nature.",
          correction: "For those who choose it",
        },
      ],
      rewrite:
        "An abstract composition, unforgettable — a signature that lingers. An invitation to discover it in boutique. For those who choose it.",
      spoken:
        "Smell like a rose garden? A rose garden smells like a rose garden. A woman should smell like a woman. That was the whole idea of N°5. No hashtags, no free miniatures, and never luxury for everyone. Luxury is for those who choose it.",
      source: "preset",
    },
  },
];

interface Rule {
  re: RegExp;
  category: string;
  framework: string;
  explanation: string;
  correction: string;
}

// Offline rule engine — a deterministic fallback grounded in the KB guardrails.
const RULES: Rule[] = [
  {
    re: /\b(go(?:ing)? viral|viral(?:ity)?|tik ?tok|trend(?:y|ing)?|social obsession|#?smellmaxxing|traffic stopper|buzz|hype|drop)\b/gi,
    category: "Hype & jargon",
    framework: "Kapferer & Bastien — The Luxury Strategy",
    explanation:
      "The Maison seeks desirability over time, resonance and scarcity — never the viral buzz or the trend of the week.",
    correction: "desirability over time",
  },
  {
    re: /\b(discounts?|sconti|promo(?:tion)?s?|sales?|flash sale|bundles?|% off|\d+\s?% off|free (?:mini|gift)s?|gift[- ]with[- ]purchase|black friday|markdowns?|masstige|cheap(?:er)?|affordable)\b/gi,
    category: "Price & promotion",
    framework: "Keller — Brand Equity",
    explanation:
      "Price arguments erode brand equity. Discounts, promotions, bundles and masstige are forbidden vocabulary.",
    correction: "a privileged invitation",
  },
  {
    re: /\b(maximi[sz]e (?:brand |market )?penetration|penetration|market share|mass[- ]market|luxury for everyone|accessible luxury|scale)\b/gi,
    category: "Mass-market logic",
    framework: "The Luxury Strategy — selectivity",
    explanation:
      "FMCG logic of availability and penetration. Chanel practises intentional selectivity.",
    correction: "selective resonance",
  },
  {
    re: /\b(dream(?:y|s|ing)?|fair(?:y|ies)[- ]?tales?|enchant(?:ed|ing)|magic(?:al)?|sauvage|miss dior|j'adore|diorissimo|dior|rose garden|lucky star)\b/gi,
    category: "Dior imaginary",
    framework: "Guardrails — Chanel vs. Dior",
    explanation:
      "Dream, fairy tale, enchanted garden, figurative flowers: the imaginary of the house on Avenue Montaigne. Chanel offers L'Allure — reality elevated to style.",
    correction: "L'Allure",
  },
  {
    re: /\bcoco\b/gi,
    category: "Name & heritage",
    framework: "Kapferer Prism — Culture",
    explanation: "In formal writing: Gabrielle Chanel, or Mademoiselle. Never Coco.",
    correction: "Gabrielle Chanel",
  },
  {
    re: /\b(factor(?:y|ies)|suppliers?|vendors?|manufacturing plants?|production lines?)\b/gi,
    category: "Vocabulary of the ateliers",
    framework: "Track 2 — Mode lexicon",
    explanation:
      "Never factory or supplier: Atelier, Manufacture, Maisons d'Art, Premières d'Atelier.",
    correction: "atelier",
  },
  {
    re: /\b(frictionless|one[- ]click|impulse(?: buy(?:ing)?| purchase)?|add to cart|funnel|conversion|traffic|users?|consumers?|customers?|upsell|lifetime value|push notifications?)\b/gi,
    category: "Transactional logic",
    framework: "Relational iconicity — Kapferer Prism, Relationship",
    explanation:
      "The Maison receives clients; it does not convert users. Digital serves the appointment and the relationship.",
    correction: "clients, received with time",
  },
  {
    re: /\b(opulen(?:t|ce)|lavish|bling|ostentatious|flashy|sexy|seductive|seduce|addictive|big logos?)\b/gi,
    category: "Ostentation",
    framework: "Kapferer Prism — Personality (understated)",
    explanation:
      "Chanel is effortless and understated. Seduction is never pleasing others but affirming one's own freedom.",
    correction: "understated",
  },
];

export function offlineLexicon(text: string): LexiconResult {
  const errors: LexiconError[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    for (const m of text.matchAll(rule.re)) {
      const key = m[0].toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      errors.push({
        quote: m[0],
        category: rule.category,
        framework: rule.framework,
        explanation: rule.explanation,
        correction: rule.correction,
      });
    }
  }
  const allureScore = Math.max(8, 96 - errors.length * 13);
  let rewrite = text;
  for (const e of errors) rewrite = rewrite.split(e.quote).join(e.correction);
  return {
    allureScore,
    verdict:
      errors.length === 0
        ? "Rien à retirer. The Maison would sign this."
        : `${errors.length} cultural ${errors.length === 1 ? "error" : "errors"}. Remove, then remove again.`,
    errors,
    rewrite,
    spoken:
      errors.length === 0
        ? "Bien. Nothing to remove. That is the rarest compliment I give."
        : `Mon cher. I count ${errors.length} words that belong to another house, or to a supermarket. Look at them in red. Before you send anything, look in the mirror, and remove one thing. Here, remove ${errors.length}.`,
    source: "offline",
  };
}

/** Find a preset whose text matches exactly (used for instant demo mode). */
export function findPreset(text: string): LexiconPreset | undefined {
  const t = text.trim();
  return LEXICON_PRESETS.find((p) => p.text.trim() === t);
}
