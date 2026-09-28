import type { Metadata } from "next";
import { TopicLanding } from "@/components/TopicLanding";
import { appRegistryBySlug } from "@/lib/app-registry";

export const metadata: Metadata = { title: "Hypotheek begrijpen | IPC Ole", description: "Vergelijk hypotheekvormen, maandlasten, renteaftrek en beleggen met begrijpelijke scenario's." };

export default function HypotheekLanding() {
  return <TopicLanding eyebrow="Hypotheek en wonen" title="Wat betekent een hypotheek voor je maandlasten?" intro="Vergelijk hypotheekvormen en beleidsscenario's met je eigen bedrag, rente en looptijd. Zie wat vandaag betaalbaar lijkt én wat het op termijn kost." promise="Je ziet rente, aflossing, netto lasten en scenario-effecten naast elkaar." steps={["Bepaal eerst je hypotheekbedrag en rente.", "Vergelijk maandlast, totale rente en HRA-effect.", "Test daarna wat beleggen of wegvallen van aftrek doet."]} journey={[
    { title: "Vergelijk de vormen", description: "Zie annuïtair en lineair naast elkaar met maandlasten, rente en aflossing.", href: "/apps/annuitair-lineair" },
    { title: "Controleer HRA", description: "Bekijk hoe eigenwoningregels en stoppen van aftrek doorwerken.", href: "/apps/hypotheekrenteaftrek-afschaffen" },
    { title: "Vergelijk aflossen", description: "Zet extra aflossen tegenover beleggen van hetzelfde maandbedrag.", href: "/apps/hypotheek-aflossen-vs-beleggen" },
  ]} apps={["annuitair-lineair", "hypotheekrenteaftrek-afschaffen", "hypotheek-aflossen-vs-beleggen"].map((slug) => appRegistryBySlug[slug]).filter(Boolean)} />;
}
