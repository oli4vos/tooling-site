import type { Metadata } from "next";
import { TopicLanding } from "@/components/TopicLanding";
import { appRegistryBySlug } from "@/lib/app-registry";

export const metadata: Metadata = { title: "Vermogen en beleggen | IPC Ole", description: "Krijg inzicht in beleggen, eindvermogen, FIRE en Box 3 zonder ingewikkelde vaktaal." };

export default function VermogenLanding() {
  return <TopicLanding eyebrow="Vermogen en beleggen" title="Wat gebeurt er met je geld als je het laat groeien?" intro="Vergelijk sparen, beleggen, pensioen en belastingeffecten met een scenario dat je kunt begrijpen en aanpassen." promise="Je ziet welk deel uit inleg komt, welk deel uit rendement en waar onzekerheid zit." steps={["Kies je doel, horizon en maandelijkse ruimte.", "Selecteer werkelijk of forfaitair rendement waar dat relevant is.", "Bekijk eindvermogen, belastingeffect en risico naast elkaar."]} apps={["box3-indicatie", "prive-beleggen-eindvermogen", "fire-na-belasting", "volgende-euro"].map((slug) => appRegistryBySlug[slug]).filter(Boolean)} />;
}
