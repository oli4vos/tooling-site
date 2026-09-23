import { BtnLink } from "@/components/ui";

const routes = {
  plan: { href: "/vermogen/plan", label: "Naar mijn financiële planning" },
  box3: { href: "/apps/box3-indicatie", label: "Verfijn Box 3" },
  fire: { href: "/apps/fire-na-belasting", label: "Toets mijn FIRE-doel" },
  compare: { href: "/apps/hypotheek-aflossen-vs-beleggen", label: "Vergelijk aflossen en beleggen" },
} as const;

export function WealthJourneyLinks({ current }: { current: keyof typeof routes }) {
  const next = Object.entries(routes).filter(([key]) => key !== current).slice(0, 2);
  return <section className="rounded-[1.5rem] border hair bg-[var(--paper-soft)] p-5 sm:p-6">
    <div className="section-label">Vervolg je route</div>
    <h3 className="mt-2 font-serif text-[23px] tracking-[-0.02em] text-[var(--ink)]">Maak je planning stap voor stap scherper.</h3>
    <div className="mt-4 flex flex-wrap gap-3">{next.map(([key, route]) => <BtnLink key={key} href={route.href} kind={key === "plan" ? "primary" : "outline"} size="sm">{route.label}</BtnLink>)}</div>
  </section>;
}
