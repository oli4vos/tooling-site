import type { Metadata } from "next";
import { TopicLanding } from "@/components/TopicLanding";
import { appRegistryBySlug } from "@/lib/app-registry";

export const metadata: Metadata = { title: "Belasting begrijpen | IPC Ole", description: "Begrijp Box 3, inkomen, aftrekposten en fiscale scenario's met duidelijke rekentools." };

export default function BelastingLanding() {
  return <TopicLanding eyebrow="Belasting en regels" title="Welke regel raakt jouw portemonnee?" intro="Een belastingregel is pas bruikbaar als je ziet wat die in euro's kan betekenen. Deze tools maken aannames en verschillen zichtbaar." promise="Je krijgt een indicatie met bron, jaar en waarschuwing — geen schijnzekerheid." steps={["Kies het onderwerp en het belastingjaar.", "Vul alleen de gegevens in die voor jouw scenario nodig zijn.", "Lees de uitkomst samen met de bron en beperkingen."]} apps={["box3-indicatie", "box-3-impact", "netto-inkomen-vergelijking", "overdrachtsbelasting-check"].map((slug) => appRegistryBySlug[slug]).filter(Boolean)} />;
}
