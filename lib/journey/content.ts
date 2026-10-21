// Le Parcours — the gamified journey through the Galerie Blanche.
// Every fact is drawn from knowledge/chanel_rag_knowledge_base.md.
import type { DeptId } from "../departments";

export type ChapterId = "camelia" | "parfum" | "mode" | "salon" | "lexique" | "oral";
export type ObjectKind = "camellia" | "bottle" | "bag" | "stair" | "letter" | "pearls";

export type CodeId =
  | "couleurs"
  | "prisme"
  | "n5"
  | "abstraction"
  | "chaine"
  | "le19m"
  | "miroir"
  | "relation"
  | "plume"
  | "perles";

export const CODES: Record<CodeId, { name: string; line: string }> = {
  couleurs: { name: "Les Cinq Couleurs", line: "Black, white, beige, gold, red — and nothing else." },
  prisme: { name: "Le Prisme", line: "Six faces, one Maison." },
  n5: { name: "Le N°5", line: "A perfume built like architecture." },
  abstraction: { name: "L'Abstraction", line: "A woman's perfume that smells of a woman." },
  chaine: { name: "La Chaîne", line: "Free hands, free movement." },
  le19m: { name: "Le Savoir-faire", line: "Ateliers, never factories." },
  miroir: { name: "Le Miroir", line: "We receive. We do not convert." },
  relation: { name: "La Relation", line: "Measure the bond, not the noise." },
  plume: { name: "La Plume", line: "Every word belongs to a house." },
  perles: { name: "Les Perles", line: "Ready for the Director." },
};

export interface Hotspot {
  id: string;
  /** Position in the object's local space. */
  position: [number, number, number];
  title: string;
  text: string;
  spoken: string;
  /** Optional side effect in the 3D scene. */
  effect?: "openBag";
}

export interface SortCard {
  text: string;
  side: "maison" | "ailleurs";
  why: string;
}

export interface ChoiceOption {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface ChoiceScenario {
  id: string;
  situation: string;
  options: ChoiceOption[];
}

export type Step =
  | { kind: "explore"; title: string; prompt: string; hotspots: Hotspot[]; code: CodeId }
  | {
      kind: "sort";
      title: string;
      prompt: string;
      left: string;
      right: string;
      cards: SortCard[];
      code: CodeId;
    }
  | { kind: "choice"; title: string; prompt: string; context?: string[]; scenarios: ChoiceScenario[]; code: CodeId }
  | { kind: "match"; title: string; prompt: string; pairs: { a: string; b: string }[]; code: CodeId }
  | { kind: "colours"; title: string; prompt: string; code: CodeId }
  | { kind: "prism"; title: string; prompt: string; code: CodeId }
  | { kind: "kpi"; title: string; prompt: string; items: { text: string; keep: boolean; why: string }[]; code: CodeId }
  | { kind: "lexicon"; title: string; prompt: string; code: CodeId }
  | { kind: "oral"; title: string; prompt: string; code: CodeId };

export interface Chapter {
  id: ChapterId;
  numeral: string;
  object: ObjectKind;
  name: string;
  subtitle: string;
  dept?: DeptId;
  /** Hub position of the floating object. */
  position: [number, number, number];
  intro: string;
  outro: string;
  steps: Step[];
}

export const COLOURS = [
  { id: "noir", name: "Noir", hex: "#000000", text: "Accentuates the essential — the monastic rigour of Aubazine." },
  { id: "blanc", name: "Blanc", hex: "#FFFFFF", text: "Captures the light and illuminates the face — the coifs of the nuns, absolute purity. At least sixty percent of every layout." },
  { id: "beige", name: "Beige", hex: "#E5DCCB", text: "Warm and natural — the sand of Deauville, Biarritz and the Lido in Venice." },
  { id: "or", name: "Or", hex: "#C5A059", text: "A dialogue between the real and the faux — the gifts of the Duke of Westminster, the Byzantine mosaics of San Marco, and costume jewellery." },
  { id: "rouge", name: "Rouge", hex: "#9E1B24", text: "The colour of life and blood — the lipstick as a declaration of audacity, the lining that lets you find everything at once." },
] as const;

export const CHAPTERS: Chapter[] = [
  {
    id: "camelia",
    numeral: "I",
    object: "camellia",
    name: "Le Camélia",
    subtitle: "Les Codes · Le Prisme",
    position: [-5.1, 0.2, -0.8],
    intro:
      "The camellia. It has no scent, and that is why I chose it: it never competes with N°5. Here you learn the grammar of the Maison. Five colours. Six faces. Nothing more.",
    outro:
      "Bien. Now you can read the Maison. Strong houses repeat the same codes in every category. You will see them everywhere, from now on.",
    steps: [
      {
        kind: "colours",
        title: "Les Cinq Couleurs",
        prompt: "Touch each colour. Each one has a biography.",
        code: "couleurs",
      },
      {
        kind: "prism",
        title: "Le Prisme de Kapferer",
        prompt: "Place each statement from your department on the right face of the prism.",
        code: "prisme",
      },
    ],
  },
  {
    id: "parfum",
    numeral: "II",
    object: "bottle",
    name: "Le N°5",
    subtitle: "Parfums Beauté",
    dept: "beaute",
    position: [-3.05, 0.05, 0.2],
    intro:
      "Come closer. This is not a bottle, mon cher. It is a building. In 1921, I asked Ernest Beaux for a perfume that smelled of a woman, not of a flower. Touch the gold points. Each one is a secret of the Maison.",
    outro:
      "Now you know. We never sell a scent. We transmit a heritage. And we never, ever, put it on sale.",
    steps: [
      {
        kind: "explore",
        title: "Les secrets du flacon",
        prompt: "Touch the three gold points on the bottle.",
        code: "n5",
        hotspots: [
          {
            id: "stopper",
            position: [0, 0.98, 0.2],
            title: "The stopper · Place Vendôme",
            text: "Its shape is Place Vendôme — the same geometry as the Première watches. At the Maison, even a stopper is architecture.",
            spoken:
              "The stopper. Its shape is Place Vendôme, the same lines as the Première watch. At the Maison, even a stopper is architecture.",
          },
          {
            id: "label",
            position: [0.2, 0.05, 0.3],
            title: "The label · Abstraction",
            text: "Black on white, nothing more. Inside: some eighty ingredients and aldehydes that imitate no single flower in nature.",
            spoken:
              "The label. Black letters on white. And inside, eighty ingredients, aldehydes, and not one flower you could name. Others paint a rose. I composed an abstraction.",
          },
          {
            id: "juice",
            position: [-0.32, -0.38, 0.28],
            title: "The juice · Pégomas",
            text: "The fields of Pégomas near Grasse, worked with the Mul family. A lineage of perfumers: Ernest Beaux, Jacques Polge, and today Olivier Polge.",
            spoken:
              "The juice. It begins in the fields of Pégomas, near Grasse, with the Mul family. Ernest Beaux. Then Jacques Polge. Today, Olivier Polge. A perfume is a lineage.",
          },
        ],
      },
      {
        kind: "sort",
        title: "Abstrait ou figuratif ?",
        prompt: "Which descriptions speak like the Maison — and which like another house?",
        left: "La Maison",
        right: "Ailleurs",
        code: "abstraction",
        cards: [
          { text: "A composition of eighty ingredients that imitates no flower.", side: "maison", why: "Abstract and architectural — N°5." },
          { text: "A wild desert under the moon, the freedom of a cowboy.", side: "ailleurs", why: "Figurative storytelling — another house's language." },
          { text: "A woman's perfume that smells of a woman.", side: "maison", why: "Gabrielle Chanel's brief to Ernest Beaux." },
          { text: "The rose of a young girl in love.", side: "ailleurs", why: "A single figurative flower — another house's rose." },
          { text: "Les Exclusifs: Haute Parfumerie signed by Olivier Polge.", side: "maison", why: "High-End, savoir-faire, scarcity." },
          { text: "The number one social obsession — a total traffic stopper.", side: "ailleurs", why: "Hype jargon the guardrails forbid." },
        ],
      },
      {
        kind: "choice",
        title: "Le marché polarisé",
        prompt: "Fragrance grows +5% a year to 2029 — but not evenly. What do you recommend?",
        context: ["Premium  −1%", "Indies  +11%", "Haute Parfumerie  +14%"],
        code: "n5",
        scenarios: [
          {
            id: "market",
            situation: "How do we defend N°5 and Les Exclusifs without betraying the Maison?",
            options: [
              {
                text: "A 20% discount and a travel-size bundle to recruit Gen Z.",
                correct: false,
                feedback: "A discount teaches the client the creation is worth less than its price — Keller's brand equity erodes. Bundles are forbidden vocabulary in Parfums Beauté.",
              },
              {
                text: "A viral TikTok challenge to maximise brand penetration.",
                correct: false,
                feedback: "Penetration is FMCG logic. The Luxury Strategy seeks desirability over time and scarcity — never the viral buzz.",
              },
              {
                text: "Keep N°5 as the cognitive anchor, let Les Exclusifs carry High-End growth through savoir-faire and scarcity, and offer olfactory consultations in boutique.",
                correct: true,
                feedback: "Exactly. Protect equity, grow where the Maison already speaks quietly, and answer the Indies with relationship rather than noise.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mode",
    numeral: "III",
    object: "bag",
    name: "La 2.55",
    subtitle: "Mode & le19M",
    dept: "mode",
    position: [-1.05, -0.2, 0.7],
    intro:
      "My bag. Before it, a woman carried her bag in her hand, like a burden. I gave it a chain, and gave her back her hands. Touch it. Open it.",
    outro:
      "You have opened the bag and seen the burgundy. Now you know: a code always has a biography, and a hand behind it.",
    steps: [
      {
        kind: "explore",
        title: "Les codes de la 2.55",
        prompt: "Touch the four gold points — one of them opens the bag.",
        code: "chaine",
        hotspots: [
          {
            id: "chain",
            position: [0.62, 1.15, 0.05],
            title: "The chain · interlaced leather",
            text: "A chain threaded with leather, worn on the shoulder. Freedom of movement before anything else.",
            spoken: "The chain, threaded with leather. A woman should have her hands free. Elegance begins with movement.",
          },
          {
            id: "clasp",
            position: [0, -0.06, 0.52],
            title: "The clasp · Mademoiselle",
            text: "The rectangular Mademoiselle lock — or the double C. A signature you can close.",
            spoken: "The clasp. The Mademoiselle lock. A signature you can close with one hand.",
          },
          {
            id: "quilt",
            position: [-0.55, -0.25, 0.25],
            title: "Matelassé",
            text: "Quilted, recognisable without any logo. The silhouette alone carries the brand equity — cognitive iconicity.",
            spoken: "The quilting. Hide the logo, and you still know it is mine. That is cognitive iconicity, mon cher.",
          },
          {
            id: "lining",
            position: [0.45, 0.38, 0.45],
            title: "The lining · Aubazine burgundy",
            text: "Inside, burgundy — the colour of the uniforms at the orphanage of Aubazine. Red inside, to find everything at once.",
            spoken: "Open it. Burgundy. The colour of the uniforms at Aubazine, where I grew up. Function first: red inside, so you find everything at once.",
            effect: "openBag",
          },
        ],
      },
      {
        kind: "sort",
        title: "Atelier ou usine ?",
        prompt: "Which words belong in the Maison's mouth?",
        left: "On dit",
        right: "On ne dit jamais",
        code: "le19m",
        cards: [
          { text: "Atelier", side: "maison", why: "The place where the hand works." },
          { text: "Factory", side: "ailleurs", why: "Never — we have ateliers and manufactures." },
          { text: "Maisons d'Art", side: "maison", why: "The métiers d'art gathered in le19M." },
          { text: "Supplier", side: "ailleurs", why: "Lesage is not a supplier; it is a Maison d'Art." },
          { text: "Premières d'Atelier", side: "maison", why: "The heads of the workrooms." },
          { text: "Drop", side: "ailleurs", why: "Hype vocabulary — we speak of controlled launches." },
        ],
      },
      {
        kind: "match",
        title: "Le19M",
        prompt: "Match each Maison d'Art to its savoir-faire.",
        code: "le19m",
        pairs: [
          { a: "Lesage", b: "Embroidery" },
          { a: "Lemarié", b: "Feathers" },
          { a: "Massaro", b: "Shoes" },
          { a: "Maison Michel", b: "Hats" },
        ],
      },
    ],
  },
  {
    id: "salon",
    numeral: "IV",
    object: "stair",
    name: "L'Escalier",
    subtitle: "Client Experience & Digital",
    dept: "client",
    position: [1.05, 0.1, 0.7],
    intro:
      "Thirty-one Rue Cambon. The staircase of mirrors. Every facet sees the client, and every facet sees you. Here, you will learn to receive. Not to sell. To receive.",
    outro:
      "Remember the mirrors. The Maison is always seen. Time, mon cher, is the only true luxury we offer.",
    steps: [
      {
        kind: "choice",
        title: "Le Salon",
        prompt: "Three situations. Choose how the Maison answers.",
        code: "miroir",
        scenarios: [
          {
            id: "chain",
            situation: "A client's 2.55 has a broken chain after fifteen years. The boutique suggests a discount on a new one.",
            options: [
              { text: "Offer 20% off a new bag — a great upsell.", correct: false, feedback: "A discount tells her the object is disposable, and that she is a transaction." },
              { text: "Repair it in the ateliers, and take the time to receive her.", correct: true, feedback: "Relational iconicity: a bond that lasts longer than a season. A 2.55 is cared for, not replaced." },
              { text: "Send her the link to online customer service.", correct: false, feedback: "The relationship facet of the prism is time given — never a link." },
            ],
          },
          {
            id: "checkout",
            situation: "The digital team wants one-click checkout for handbags to remove friction.",
            options: [
              { text: "Yes, and add a countdown timer to create urgency.", correct: false, feedback: "System 1 impulse logic — the FMCG playbook. The Maison never creates artificial pressure." },
              { text: "Yes — every click removed is revenue.", correct: false, feedback: "Fashion is not sold online. That selectivity is intentional and protects brand equity." },
              { text: "No. The digital journey ends with a person: book an appointment in boutique.", correct: true, feedback: "Digital serves the relationship. Remove friction from the welcome, never from the act of choosing." },
            ],
          },
          {
            id: "letter",
            situation: "You must invite a loyal client to discover the new collection. Which message?",
            options: [
              { text: "“Last chance! Exclusive flash sale for our top users.”", correct: false, feedback: "Urgency, sale, users: three words from another world." },
              { text: "“Your advisor would be delighted to receive you at Rue Cambon to present the new collection.”", correct: true, feedback: "Personal, rare, unhurried. A word from the Maison is read because it is rare." },
              { text: "“Don't miss out — trending now on social!”", correct: false, feedback: "Hype vocabulary. The Maison never chases the trend of the week." },
            ],
          },
        ],
      },
      {
        kind: "kpi",
        title: "Ce que l'on mesure",
        prompt: "Choose the indicators you would present to the Director. Leave the others out.",
        code: "relation",
        items: [
          { text: "Appointments booked and honoured", keep: true, why: "The digital journey ends with a person." },
          { text: "Repair and care requests", keep: true, why: "The relationship made visible over decades." },
          { text: "Client retention over years", keep: true, why: "A bond that lasts." },
          { text: "Clients known by name in boutique", keep: true, why: "Recognition is the service." },
          { text: "Website traffic", keep: false, why: "It measures noise, not desirability." },
          { text: "Virality of posts", keep: false, why: "Hype recruits Soldiers, not Insiders." },
          { text: "Discount-driven conversion", keep: false, why: "It erodes brand equity." },
          { text: "Email open rate", keep: false, why: "A transactional metric, not a relational one." },
        ],
      },
    ],
  },
  {
    id: "lexique",
    numeral: "V",
    object: "letter",
    name: "La Lettre",
    subtitle: "Le Lexique",
    position: [3.05, -0.15, 0.2],
    intro:
      "A letter. Everything at the Maison is written before it is made. Show me what you were about to send. I will tell you which house it belongs to.",
    outro: "Fewer words. Purer lines. That is the whole of our grammar.",
    steps: [
      {
        kind: "lexicon",
        title: "The Chanel Lexicon Translator",
        prompt: "Paste a draft — or open one of the letters below.",
        code: "plume",
      },
    ],
  },
  {
    id: "oral",
    numeral: "VI",
    object: "pearls",
    name: "Les Perles",
    subtitle: "Le Grand Oral",
    position: [5.1, 0.35, -0.8],
    intro:
      "The pearls. The last door. Three questions before you meet your Director. Answer as the Maison would answer: briefly, precisely, and without raising your voice.",
    outro: "You are ready. Go to your Director. Say less than you know.",
    steps: [
      {
        kind: "oral",
        title: "Le Grand Oral",
        prompt: "Answer aloud or in writing.",
        code: "perles",
      },
    ],
  },
];

export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

/** Chapters that must be completed before Le Grand Oral opens. */
export const ORAL_UNLOCK = 3;

export const HUB_LINES = {
  arrival: (deptName: string) =>
    `Bienvenue chez moi. This gallery is the Maison, emptied of everything but its codes. Each object is a door. Begin with the camellia, then your own Métier: ${deptName}. When you have collected enough codes, the pearls will open.`,
  return: "Choose your next door, mon cher. The pearls are watching.",
  locked: "Not yet. The pearls open only to those who have collected three chapters of codes.",
};

export const PROLOGUE = {
  letter:
    "Mademoiselle requests the pleasure of your presence at thirty-one Rue Cambon. You have been chosen. Now you must learn the codes.",
  doors: "Entrez. And remember: at the Maison, nothing is decoration. Everything is a code.",
};

export const LEVELS = [
  { min: 0, name: "Apprentie" },
  { min: 200, name: "Initiée" },
  { min: 450, name: "Insider" },
  { min: 700, name: "Gardienne des Codes" },
];

export function levelFor(points: number) {
  return [...LEVELS].reverse().find((l) => points >= l.min)!;
}
