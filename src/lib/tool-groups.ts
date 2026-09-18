import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";

export type ToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: "Studieschuld",
    description: "Begin hier: schuldopbouw, stoppen, leenbedrag, maandbedrag en wat DUO voor je keuzes betekent.",
    slugs: [
      "duo-schuld-bij-starten-lenen",
      "duo-stoppen-kosten-prestatiebeurs",
      "duo-leenbedrag-impact",
      "duo-aanvullende-beurs",
    ],
  },
  {
    title: "Terugbetalen",
    description: "Bereken je maandbedrag, het effect van extra aflossen en een logische schuldvolgorde.",
    slugs: ["duo-extra-aflossen", "duo-maandbedrag", "schulden-volgorde"],
  },
  {
    title: "Belasting & vermogen",
    description: "Bekijk de voorlopige box 3-impact en vergelijk pensioeninleg binnen je eigen jaarruimte met vrij beleggen.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  },
  {
    title: "Werk & ZZP",
    description: "Plan welk uurtarief past bij je gewenste inkomen, declarabele uren, kosten en eigen reserveringen.",
    slugs: ["zzp-uurtarief"],
  },
];

const categoryToGroupTitle: Record<string, string> = {
  Schulden: "Studieschuld",
  Hypotheek: "Wonen",
  Beleggen: "Terugbetalen",
  Belasting: "Belasting",
  Werk: "Werk & ZZP",
  "Regelingen en maandruimte": "Regelingen en maandruimte",
  "Persoonlijke financiën": "Terugbetalen",
  "Studieschuld & wonen": "Wonen",
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
  const groupTitle = categoryToGroupTitle[category] ?? "Extra geld";
  return toAnchorId(groupTitle, "groep");
}

export function getCategoryFallbackToolHref(category: string, apps: AppManifest[]) {
  const preferred = preferredSlugsByCategory[category] ?? ["duo-schuld-bij-starten-lenen"];
  const match = preferred.find((slug) => apps.some((app) => app.slug === slug));
  return `/apps/${match ?? "duo-schuld-bij-starten-lenen"}`;
}
