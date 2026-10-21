// Department-specific content for the three onboarding tracks.
// Every fact here is drawn from knowledge/chanel_rag_knowledge_base.md (§3 tracks,
// §1 frameworks, §2 guardrails, §4 storytelling). UI copy is in English with
// French touches, as Mademoiselle would have it.

export type DeptId = "beaute" | "mode" | "client";

export type FacetId =
  | "physique"
  | "personality"
  | "culture"
  | "relationship"
  | "reflection"
  | "selfImage";

export interface MaisonCode {
  name: string;
  detail: string;
  origin: string;
}

export interface OralQuestion {
  id: string;
  title: string;
  /** Spoken by Mademoiselle, and shown on screen. */
  question: string;
  /** Extra context given to Claude when grading. */
  stakes: string;
  reflex: string;
  chanelAnswer: string;
}

export interface Department {
  id: DeptId;
  name: string;
  scope: string;
  director: string;
  floorLabel: string;
  /** One-line context injected into Claude prompts. */
  promptContext: string;
  welcome: string;
  codes: MaisonCode[];
  prism: Record<FacetId, string>;
  lexicon: { avoid: string[]; prefer: string[] };
  oral: OralQuestion[];
}

export const FACETS: {
  id: FacetId;
  label: string;
  french: string;
  axis: "sender" | "receiver";
  side: "externalisation" | "internalisation";
  definition: string;
  mademoiselle: string;
}[] = [
  {
    id: "physique",
    label: "Physique",
    french: "Le Physique",
    axis: "sender",
    side: "externalisation",
    definition:
      "The visible signature: pure lines, tweed, matelassé, beige and black, the geometric N°5 bottle, pearls, the camellia, a strict palette of black, white, beige, gold and red.",
    mademoiselle:
      "A code is not decoration. It is a promise you can touch. Black, then white. Then nothing more.",
  },
  {
    id: "personality",
    label: "Personality",
    french: "La Personnalité",
    axis: "sender",
    side: "internalisation",
    definition:
      "Independent, bold, intellectual, effortless chic. Free. Never ostentatious — always understated.",
    mademoiselle:
      "Independence first. Then boldness. And never, ever, ostentation. The Maison does not shout; it is recognised.",
  },
  {
    id: "relationship",
    label: "Relationship",
    french: "La Relation",
    axis: "sender",
    side: "externalisation",
    definition:
      "Relational iconicity: time given, expert advice, continuous care — the appointment, the repair, a bond that lasts.",
    mademoiselle:
      "One does not sell to a woman. One receives her. Time, mon cher, is the only true luxury we offer.",
  },
  {
    id: "culture",
    label: "Culture",
    french: "La Culture",
    axis: "sender",
    side: "internalisation",
    definition:
      "The legacy of Gabrielle Chanel: Parisian avant-garde at 31 Rue Cambon, the liberation of the female body, the métiers d'art, financial and creative independence.",
    mademoiselle:
      "I freed women from the corset. Everything else at the Maison is a consequence of that first gesture.",
  },
  {
    id: "reflection",
    label: "Reflection",
    french: "Le Reflet",
    axis: "receiver",
    side: "externalisation",
    definition:
      "The client mirrored: an autonomous, cultivated, self-assured individual who needs no scaffolding to affirm her status.",
    mademoiselle:
      "My client does not need a logo to know who she is. She already knows. We simply agree with her.",
  },
  {
    id: "selfImage",
    label: "Self-image",
    french: "L'Image de soi",
    axis: "receiver",
    side: "internalisation",
    definition:
      "How one feels inside the world of Chanel: “I am free, authentic, I master my style and my destiny.” That is L'Allure.",
    mademoiselle:
      "L'Allure is not what you wear. It is the way you walk out of the room. Before you leave, remove one thing.",
  },
];

export const ICONICITY_LEVELS = [
  {
    id: "cognitive",
    label: "Cognitive",
    verb: "Recognised & remembered",
    detail:
      "Distinctive assets: the 2.55 silhouette is recognised even without the CC — the root of brand equity in Keller's sense.",
  },
  {
    id: "experiential",
    label: "Experiential",
    verb: "Lived",
    detail:
      "Rituals, senses, relationship. Chanel excels in the relational dimension: personal service, recognition, time — never the purely transactional.",
  },
  {
    id: "emotional",
    label: "Emotional",
    verb: "Loved",
    detail:
      "Identity resonance and lasting purpose: building Enthusiasts and Insiders — never Soldiers driven by ephemeral hype.",
  },
  {
    id: "cultural",
    label: "Cultural",
    verb: "Meaningful — Holt",
    detail:
      "Resolving a cultural tension through an identity myth: freeing women from corsets and decorative clothing imposed by men — movement, function, modern elegance.",
  },
] as const;

export const DEPARTMENTS: Record<DeptId, Department> = {
  beaute: {
    id: "beaute",
    name: "Parfums Beauté",
    scope: "Fragrance · Makeup · Skincare",
    director: "Director of Parfums Beauté",
    floorLabel: "Fragrance & Beauty",
    promptContext:
      "Track 1 — Parfums Beauté (Fragrance, Makeup, Skincare). Market 2026-2029: fragrance is the fastest-growing category (+5% CAGR to 2029), polarised between Indies (+11%) and High-End / Haute Parfumerie (+14%, where Chanel holds Les Exclusifs de Chanel, e.g. Comète, Coromandel), while traditional Premium suffers (-1%). Key figures: Ernest Beaux, Jacques Polge, Olivier Polge (current Parfumeur-Créateur). Skincare: longevity science, proprietary ingredients from open-sky laboratories (red camellia for N°1 de Chanel, Vanilla planifolia from Madagascar for Sublimage). Forbidden: discounts, promotions, bundles, masstige. Preferred: savoir-faire, olfactory heritage, beauty ritual, exclusivity, Les Exclusifs.",
    welcome:
      "Bienvenue, mon cher. Parfums Beauté. You have chosen the most invisible of my creations, and the most powerful. In 1921, Ernest Beaux and I made a perfume that smelled of no flower. It smelled of a woman. Here, we never sell a scent. We transmit a heritage. Follow me upstairs.",
    codes: [
      {
        name: "N°5 — the bottle",
        detail:
          "A geometric flacon whose stopper echoes the octagon of Place Vendôme. Architecture, not ornament.",
        origin: "1921 · Place Vendôme",
      },
      {
        name: "N°5 — the juice",
        detail:
          "Some 80 ingredients and aldehydes, imitating no single flower. “A woman's perfume that smells of a woman.”",
        origin: "Ernest Beaux",
      },
      {
        name: "Les Exclusifs de Chanel",
        detail:
          "Haute Parfumerie — Comète, Coromandel. Where High-End grows +14% and where the Maison speaks most quietly.",
        origin: "Olivier Polge, Parfumeur-Créateur",
      },
      {
        name: "Pégomas fields",
        detail:
          "The fields of Pégomas, near Grasse, worked with the Mul family. The supply chain is part of the story.",
        origin: "Grasse",
      },
      {
        name: "Open-sky laboratories",
        detail:
          "Red camellia for N°1 de Chanel, Vanilla planifolia from Madagascar for Sublimage. Science of longevity, proprietary ingredients.",
        origin: "Skincare",
      },
      {
        name: "Le Rouge",
        detail:
          "Red, “the colour of life and blood” — the lipstick as a declaration of audacity.",
        origin: "Makeup",
      },
    ],
    prism: {
      physique:
        "The N°5 flacon, the octagonal stopper, the black and white of the packaging, the red of the lipstick. Every counter, every visual, repeats these signatures — never a seasonal gimmick.",
      personality:
        "A fragrance with a point of view: abstract, intellectual, self-assured. We never describe a scent as “sexy” or “addictive”.",
      relationship:
        "Olfactory consultations, the beauty ritual taught in boutique, time spent with the client — not gifts-with-purchase or price promotions.",
      culture:
        "From Ernest Beaux to Jacques and Olivier Polge: a lineage of perfumers. Grasse, Pégomas, the Mul family. Heritage is our only argument.",
      reflection:
        "The N°5 woman is not waiting for anyone — like Margot Robbie in “See You at 5”, she misses the rendezvous, laughs, and dives into the ocean.",
      selfImage:
        "“I have decided I won't be just another number.” The client wears N°5 for herself, never to please.",
    },
    lexicon: {
      avoid: ["discount", "promotion", "bundle", "masstige", "viral", "#smellmaxxing", "addictive", "traffic stopper"],
      prefer: ["savoir-faire", "olfactory heritage", "beauty ritual", "exclusivity", "Les Exclusifs", "composition"],
    },
    oral: [
      {
        id: "beaute-1",
        title: "The polarised market",
        question:
          "The Premium segment is losing one percent, while the Indies and Haute Parfumerie grow at double digits. How do we defend N°5 and Les Exclusifs without betraying the Maison?",
        stakes:
          "Premium -1%, Indies +11%, High-End +14% (2026-2029). The temptation is to fight Premium decline with price and volume.",
        reflex:
          "We should launch a viral TikTok campaign for N°5 with a 20% discount and a travel-size bundle to recruit Gen Z and maximise brand penetration, the way a rival fragrance did. A dreamy, seductive storyline will make customers fall in love again.",
        chanelAnswer:
          "We do not chase the Premium middle with price. N°5 remains our cognitive anchor — the bottle, 1921, Ernest Beaux — so we protect its brand equity in Keller's sense: no discount, no bundle. Growth comes from the High-End: Les Exclusifs, signed by Olivier Polge, told through savoir-faire and the fields of Pégomas, with deliberate scarcity as The Luxury Strategy teaches. And we answer the Indies with relationship, not noise: olfactory consultations in boutique, a ritual, time given to each client.",
      },
      {
        id: "beaute-2",
        title: "Black Friday",
        question:
          "A retail partner asks for a gift-with-purchase bundle on N°1 de Chanel for Black Friday. Their traffic is falling. What do you answer?",
        stakes:
          "Short-term sell-out pressure from a wholesale partner versus long-term equity of a skincare line built on the red camellia and longevity science.",
        reflex:
          "Yes — Black Friday is the biggest traffic moment of the year. A bundle with a free mini and 15% off will convert new customers and boost our market share against the competition.",
        chanelAnswer:
          "We decline the bundle, elegantly. A discount teaches the client that N°1 de Chanel is worth less than its price — it erodes brand equity. Instead, we offer the partner a moment of expertise: a skin consultation and the ritual of the red camellia, grown in our open-sky laboratory. We bring them desirability and service, not a markdown. The Maison does not chase promotional moments; it simply remains.",
      },
      {
        id: "beaute-3",
        title: "N°5 for a new generation",
        question:
          "Marketing wants a Gen-Z challenge to make N°5 relevant again. How do you bring N°5 to a new generation, the Chanel way?",
        stakes:
          "Relevance with younger clients without turning an icon into a trend. Reference: “See You at 5” by Luca Guadagnino with Margot Robbie.",
        reflex:
          "We create a #N5Challenge on TikTok with influencers, a dreamy fairy-tale filter and a seduction storyline — the goal is to go viral and become a social obsession this season.",
        chanelAnswer:
          "We do not make N°5 a trend; we make it a myth again. Holt's cultural iconicity: “See You at 5” shows a woman who directs her own story — she misses the date, laughs, dives into the ocean. Freedom and self-irony, not seduction. We invite the new generation as Insiders, not Soldiers of a hype: the story of 1921, the abstraction of the composition, a fragrance for the woman who decided she would not be just another number.",
      },
    ],
  },
  mode: {
    id: "mode",
    name: "Mode & le19M",
    scope: "Haute Couture · Prêt-à-Porter · Métiers d'Art",
    director: "Director of Mode",
    floorLabel: "Fashion & Métiers d'Art",
    promptContext:
      "Track 2 — Mode (Haute Couture, Ready-to-Wear, Métiers d'Art). Chanel protects savoir-faire by gathering historic ateliers (embroiderers Lesage and Montex, feather-maker Lemarié, shoemaker Massaro, milliner Maison Michel) inside le19M in Paris. Untouchable codes: the tweed jacket (gold chain sewn into the inner hem for perfect fall), the 11.12 / 2.55 bag (leather-interlaced chain, Mademoiselle or CC clasp, burgundy lining like the Aubazine orphanage uniforms), the two-tone slingback (beige lengthens the leg, black toe shortens and protects the foot). Never say 'factory' or 'supplier': say Atelier, Manufacture, Maisons d'Art, Premières d'Atelier. Era: Matthieu Blazy as artistic director (after Karl Lagerfeld and Virginie Viard), Métiers d'art show in the New York subway (December 2025), controlled launch of the CHANEL 25 bag. No online sales for Mode.",
    welcome:
      "Bienvenue, mon cher. La Mode. Here, nothing is new and everything is modern. A jacket that lets a woman move. A chain sewn into a hem so that it falls, perfectly, every time. We do not have factories. We have ateliers, and hands that remember. Come. Let us climb the staircase.",
    codes: [
      {
        name: "The tweed jacket",
        detail:
          "A fine gold chain sewn into the inner hem guarantees the perfect fall. Comfort and movement first.",
        origin: "Couture",
      },
      {
        name: "11.12 / 2.55",
        detail:
          "Leather-interlaced chain, Mademoiselle or CC clasp, burgundy lining — the colour of the Aubazine uniforms. Red inside to find everything at once.",
        origin: "Aubazine",
      },
      {
        name: "The two-tone slingback",
        detail:
          "Beige to lengthen the leg, a black toe to shorten and protect the foot. Function becomes signature.",
        origin: "Massaro",
      },
      {
        name: "le19M",
        detail:
          "Lesage and Montex (embroidery), Lemarié (feathers), Massaro (shoes), Maison Michel (hats) — gathered and protected in Paris.",
        origin: "Maisons d'Art",
      },
      {
        name: "Matelassé & camellia",
        detail:
          "Codes repeated in every category — “strong houses repeat the same codes in every category”.",
        origin: "Kapferer",
      },
      {
        name: "CHANEL 25",
        detail:
          "Matthieu Blazy's era: a code is a living language. A controlled launch, exclusivity intact.",
        origin: "2025–2026",
      },
    ],
    prism: {
      physique:
        "Tweed, matelassé, the chain, the slingback, beige and black. The silhouette must be recognisable without any logo.",
      personality:
        "Effortless, never costume. A collection may be bold; it is never loud.",
      relationship:
        "Made-to-measure, fittings, repairs over decades. A 2.55 is maintained, not replaced.",
      culture:
        "The Premières d'Atelier and the hands of le19M. Aubazine, Deauville, Rue Cambon — every code has a biography.",
      reflection:
        "A woman who chooses comfort as an act of independence: jersey, trousers, straight lines — never the corset.",
      selfImage:
        "“I move freely, therefore I am elegant.” Clothing as conquest of freedom.",
    },
    lexicon: {
      avoid: ["factory", "supplier", "vendor", "fast", "drop", "hype", "opulent", "dreamy"],
      prefer: ["Atelier", "Manufacture", "Maisons d'Art", "Premières d'Atelier", "savoir-faire", "silhouette"],
    },
    oral: [
      {
        id: "mode-1",
        title: "No e-commerce",
        question:
          "A journalist asks why the CHANEL 25 bag cannot be bought online and why its launch is so controlled. How does the Maison answer?",
        stakes:
          "Selective intentionality versus maximal availability. Fashion and fine jewellery are not sold online; digital nourishes the relationship.",
        reflex:
          "We should apologise and announce an e-commerce drop soon — demand is huge, so we would maximise availability and capture sales before competitors do. Scarcity is just a supply problem.",
        chanelAnswer:
          "We answer without apology. The CHANEL 25 is not withheld; it is offered with intention. A Chanel bag is chosen in a boutique, with time and advice — that is relational iconicity. Selective distribution and controlled launches protect desirability over time, as The Luxury Strategy teaches. Digital is where the relationship begins: you book an appointment, you are received. Scarcity is part of the value.",
      },
      {
        id: "mode-2",
        title: "The embroidery margin",
        question:
          "Procurement proposes moving embroidery from Lesage to a cheaper supplier abroad to protect margins. What do you tell the Director?",
        stakes:
          "Cost optimisation versus the protection of savoir-faire gathered in le19M.",
        reflex:
          "It makes sense: the customer will not see the difference, the supplier can scale production, and the factory savings can be reinvested in marketing and influencer campaigns.",
        chanelAnswer:
          "I would advise against it. The Maison gathered Lesage, Montex and Lemarié inside le19M precisely so that their savoir-faire would never become a line on a cost sheet. These are ateliers, not suppliers. The hand of a Première d'Atelier is our culture in Kapferer's prism — and, once the work is finished, our physique. If we save on the embroidery, we spend our identity — and brand equity, built bottom-up, would follow.",
      },
      {
        id: "mode-3",
        title: "A code that evolves",
        question:
          "Matthieu Blazy reinterprets the tweed jacket. A long-standing client worries the Maison is losing itself. How do you reassure her?",
        stakes:
          "Continuity of codes across artistic directors (Lagerfeld, Viard, Blazy). Reference: Métiers d'art show in the New York subway, December 2025.",
        reflex:
          "We tell her the new collection is a total revolution, a fresh dreamy fairy tale, completely different from before — newness is what drives traffic and keeps the brand trendy.",
        chanelAnswer:
          "I would tell her that a code is not a museum piece; it is a living language. The tweed, the chain in the hem, the freedom of movement — they remain. Matthieu Blazy speaks them in a new accent, as Karl Lagerfeld did before him. The Métiers d'art show in the New York subway put the hands of le19M inside contemporary culture without losing exclusivity. Strong houses repeat the same codes; great ones keep them alive.",
      },
    ],
  },
  client: {
    id: "client",
    name: "Client Experience & Digital",
    scope: "Retail · CRM · Brand Strategy",
    director: "Director of Client Experience",
    floorLabel: "Client Experience & Digital",
    promptContext:
      "Track 3 — Corporate, Digital & Client Experience. Where FMCG models (Heineken, Henkel, Chinese 'Mindshare Engineering') maximise physical availability and frictionless impulse purchase (Kahneman's System 1), Chanel protects brand equity through intentional selectivity: no online sales for Fashion and Fine Jewellery; digital exists to book appointments in boutique and nourish the relationship. Relational iconicity: time, expert advice, repair and maintenance, a bond that lasts. Internal posture (savoir-être): precision, listening, humility before the heritage of the Maison, collective work over individual ego.",
    welcome:
      "Bienvenue, mon cher. Client Experience. You will hear a great deal about friction, about funnels, about conversion. Forget the funnel. At the Maison, we do not convert anyone. We receive. My salon at 31 Rue Cambon has a staircase of mirrors. Every facet sees the client. Now it is your turn to look.",
    codes: [
      {
        name: "31 Rue Cambon",
        detail:
          "The boutique, the salons, the Apartment and the Mirrored Staircase. The model for every reception.",
        origin: "Paris",
      },
      {
        name: "Book an Appointment",
        detail:
          "Digital serves the boutique: the online journey ends with a person and a time, not a cart.",
        origin: "Relational iconicity",
      },
      {
        name: "Repair & maintenance",
        detail:
          "A bond that lasts: a 2.55 is cared for over decades. Service is the relationship facet made visible.",
        origin: "After-sales",
      },
      {
        name: "Intentional selectivity",
        detail:
          "No online sales for Mode and Fine Jewellery. The opposite of FMCG physical availability.",
        origin: "Brand equity",
      },
      {
        name: "Savoir-être",
        detail:
          "Precision, listening, humility before the heritage; the collective work over the individual ego.",
        origin: "Internal posture",
      },
      {
        name: "The five colours",
        detail:
          "Black, white, beige, gold, red — the same rigorous palette in every digital touchpoint.",
        origin: "Inside Chanel, Ch. 11",
      },
    ],
    prism: {
      physique:
        "Digital touchpoints obey the same codes as the boutique: sharp edges, generous white space, black, beige, gold — never badges, emojis or countdown timers.",
      personality:
        "Discreet, precise, attentive. A notification from the Maison is rare, and therefore read.",
      relationship:
        "The appointment, the advisor who remembers, the repair after fifteen years. Time is the service.",
      culture:
        "The salon of 31 Rue Cambon is the model for every interaction: a reception, not a transaction.",
      reflection:
        "A client who expects to be recognised, not targeted; known, not segmented.",
      selfImage:
        "“The Maison knows me, and leaves me free.” Never pressure, never urgency.",
    },
    lexicon: {
      avoid: ["frictionless", "funnel", "conversion", "impulse", "flash sale", "traffic", "users", "add to cart"],
      prefer: ["clients", "appointment", "relationship", "care", "recognition", "time"],
    },
    oral: [
      {
        id: "client-1",
        title: "One-click",
        question:
          "The digital team wants one-click checkout for handbags, to remove friction and lift conversion. What is your position?",
        stakes:
          "FMCG System-1 logic (impulse, physical availability) versus Chanel's intentional selectivity: no online sales for Mode.",
        reflex:
          "I fully support it: frictionless checkout maximises conversion and impulse purchase. Every click we remove is revenue — we should also add urgency timers and push notifications to drive traffic.",
        chanelAnswer:
          "I would not support it. The Maison does not sell handbags online; that selectivity is intentional, and it protects brand equity. One-click is System 1 thinking — the logic of Heineken or Henkel, of physical availability. Our digital journey should end with a person: book an appointment, be received at Rue Cambon or in boutique, be advised. We remove friction from the relationship, never from the act of choosing.",
      },
      {
        id: "client-2",
        title: "The broken chain",
        question:
          "A long-standing client's 2.55 has a broken chain after fifteen years. The boutique suggests offering her a discount on a new one. How should the Maison respond?",
        stakes:
          "Replacement and discount versus repair, care and the relationship facet of the prism.",
        reflex:
          "Offer her 20% off a new bag — it is a great upsell opportunity, she gets the latest model and we increase her lifetime value.",
        chanelAnswer:
          "We repair it. A 2.55 is not replaced; it is cared for. The ateliers restore the chain, we return it with a word, and we take the time to receive her. That is relational iconicity: a bond that lasts longer than a season. A discount would tell her the object is disposable — and that she is a transaction. Care tells her she belongs to the Maison.",
      },
      {
        id: "client-3",
        title: "Measuring CRM",
        question:
          "We must measure CRM success. Which indicators would you present to the Director — and which would you refuse?",
        stakes:
          "Transactional metrics (conversion, traffic, open rates) versus relational and equity metrics.",
        reflex:
          "Traffic, conversion rate, email open rate, number of followers and the virality of our posts — the more reach and the more sales per campaign, the better.",
        chanelAnswer:
          "I would present relationship indicators: appointments booked and honoured, repairs and care requests, client retention over years, the quality of recognition in boutique — how many clients are known by name. And I would watch brand equity in Keller's sense, and desirability over time. I would refuse to lead with traffic, virality or discount-driven conversion: they measure noise, not desirability.",
      },
    ],
  },
};

export const DEPT_ORDER: DeptId[] = ["beaute", "mode", "client"];

export function isDeptId(v: unknown): v is DeptId {
  return v === "beaute" || v === "mode" || v === "client";
}
