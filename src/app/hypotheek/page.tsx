import type { Metadata } from "next";
import { TopicLanding } from "@/components/TopicLanding";
import { appRegistryBySlug } from "@/lib/app-registry";

export const metadata: Metadata = { title: "Hypotheek begrijpen | IPC Ole", description: "Vergelijk hypotheekvormen, maandlasten, renteaftrek en beleggen met begrijpelijke scenario's." };

export default function HypotheekLanding() {
  return <TopicLanding eyebrow="Hypotheek en wonen" title="Wat betekent een hypotheek voor je maandlasten?" intro="Vergelijk hypotheekvormen en beleidsscenario's met je eigen bedrag, rente en looptijd. Zie wat vandaag betaalbaar lijkt én wat het op termijn kost." promise="Je ziet rente, aflossing, netto lasten en scenario-effecten naast elkaar." steps={["Vul je hypotheekbedrag, rente en looptijd in.", "Vergelijk annuïtair, lineair of een renteaftrekscenario.", "Lees de aannames voordat je een keuze maakt."]} apps={["annuitair-lineair", "hypotheekrenteaftrek-afschaffen", "hypotheek-aflossen-vs-beleggen"].map((slug) => appRegistryBySlug[slug]).filter(Boolean)} />;
}
