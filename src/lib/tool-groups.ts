import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type ToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: "Inkomen & werk",
    description: "Wat houd je over van je inkomen? Vergelijk jaarbedragen en bekijk de ruimte voor een reiskostenvergoeding.",
    slugs: ["netto-inkomen-vergelijking", "reiskostenvergoeding-check"],
  },
  {
    title: "Vermogen & pensioen",
    description: "Maak belasting over vermogen en de gevolgen van pensioenkeuzes inzichtelijk met je eigen cijfers.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen", "prive-beleggen-eindvermogen", "fire-na-belasting", "hypotheek-aflossen-vs-beleggen", "studieschuld-vs-beleggen", "pensioenplafond-check"],
  },
  {
    title: "Ondernemen",
    description: "Plan je uurtarief en vergelijk wat een zakelijke energie-investering fiscaal kan betekenen.",
    slugs: ["zzp-uurtarief", "eia-investeringsvoordeel"],
  },
  {
    title: "Wonen & vervoer",
    description: "Maak je maximale hypotheek, overdrachtsbelasting en de bijtelling van een oudere zakelijke auto inzichtelijk.",
    slugs: ["artifact-hypotheek-wonen-maximale-hypotheek", "overdrachtsbelasting-check", "youngtimer-check"],
  },
  {
    title: "Studie & lenen",
    description: "Wat kost lenen tijdens je studie? Bekijk schuldopbouw, aanvullende beurs en de gevolgen van stoppen.",
    slugs: [
      "duo-schuld-bij-starten-lenen",
      "duo-stoppen-kosten-prestatiebeurs",
      "duo-leenbedrag-impact",
      "duo-aanvullende-beurs",
    ],
  },
  {
    title: "Studieschuld terugbetalen",
    description: "Bereken je DUO-maandbedrag en vergelijk het effect van extra aflossen op rente en looptijd.",
    slugs: ["duo-extra-aflossen", "duo-maandbedrag", "schulden-volgorde"],
  },
];

const categoryToGroupTitle: Record<string, string> = {
  Schulden: "Studie & lenen",
  Hypotheek: "Wonen & vervoer",
  Beleggen: "Vermogen & pensioen",
  Belasting: "Vermogen & pensioen",
  Werk: "Inkomen & werk",
  "Regelingen en maandruimte": "Regelingen en maandruimte",
  "Persoonlijke financiën": "Inkomen & werk",
  "Studieschuld & wonen": "Wonen & vervoer",
};

const preferredSlugsByCategory: Record<string, string[]> = {
  Schulden: [
    "duo-schuld-bij-starten-lenen",
    "duo-stoppen-kosten-prestatiebeurs",
    "duo-leenbedrag-impact",
    "duo-aanvullende-beurs",
    "duo-maandbedrag",
    "duo-extra-aflossen",
    "hypotheek-impact-studieschuld",
  ],
  Hypotheek: [
    "hypotheek-impact-studieschuld",
    "artifact-hypotheek-wonen-maximale-hypotheek",
    "familiehulp-eerste-woning",
  ],
  Beleggen: ["duo-extra-aflossen", "duo-maandbedrag"],
  Belasting: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  Werk: ["zzp-uurtarief"],
  "Persoonlijke financiën": [
    "duo-maandbedrag",
    "duo-extra-aflossen",
    "schulden-volgorde",
  ],
  "Studieschuld & wonen": [
    "hypotheek-impact-studieschuld",
    "artifact-hypotheek-wonen-maximale-hypotheek",
    "familiehulp-eerste-woning",
  ],
};

export function getGroupAnchorForCategory(category: string) {
  const groupTitle = categoryToGroupTitle[category] ?? "Inkomen & werk";
  return toAnchorId(groupTitle, "groep");
}

export function getCategoryFallbackToolHref(category: string, apps: AppManifest[]) {
  const preferred = preferredSlugsByCategory[category] ?? [];
  const match = preferred.find((slug) => apps.some((app) => app.slug === slug));
  return match ? `/apps/${match}` : "/apps";
}
