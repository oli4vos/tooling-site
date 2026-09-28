import Link from "next/link";
import type { AppManifest } from "@/lib/app-types";

type RouteLink = { label: string; href: string; reason: string };

const routes: Record<string, RouteLink[]> = {
  "box3-indicatie": [
    { label: "Neem mee naar mijn planning", href: "/vermogen/plan", reason: "Gebruik je vermogensverdeling en maandelijkse inleg in één plan." },
    { label: "Toets mijn FIRE-doel", href: "/apps/fire-na-belasting", reason: "Bekijk of je vermogen aansluit bij je uitgaven en opnamepercentage." },
  ],
  "box-3-impact": [
    { label: "Verfijn Box 3", href: "/apps/box3-indicatie", reason: "Voeg werkelijk rendement en maandelijkse inleg per categorie toe." },
    { label: "Bouw mijn planning", href: "/vermogen/plan", reason: "Maak van deze indicatie een scenario voor je vermogen." },
  ],
  "annuitair-lineair": [
    { label: "Test stoppen van HRA", href: "/apps/hypotheekrenteaftrek-afschaffen", reason: "Zie wat er gebeurt als het fiscale voordeel wegvalt." },
    { label: "Vergelijk aflossen en beleggen", href: "/apps/hypotheek-aflossen-vs-beleggen", reason: "Zet het maandlastverschil tegenover beleggen." },
  ],
  "artifact-hypotheek-wonen-maximale-hypotheek": [
    { label: "Vergelijk annuïtair en lineair", href: "/apps/annuitair-lineair", reason: "Bekijk maandlasten, rente en aflossing door de tijd." },
    { label: "Test het HRA-effect", href: "/apps/hypotheekrenteaftrek-afschaffen", reason: "Maak de fiscale onzekerheid zichtbaar." },
  ],
  "fire-na-belasting": [
    { label: "Bouw mijn financiële planning", href: "/vermogen/plan", reason: "Combineer vermogen, inleg, uitgaven en Box 3." },
    { label: "Bereken eindvermogen", href: "/apps/prive-beleggen-eindvermogen", reason: "Vergelijk verschillende horizon- en rendementsaannames." },
  ],
  "prive-beleggen-eindvermogen": [
    { label: "Controleer Box 3", href: "/apps/box3-indicatie", reason: "Neem belasting en maandelijkse inleg per categorie mee." },
    { label: "Toets mijn FIRE-doel", href: "/apps/fire-na-belasting", reason: "Vergelijk de uitkomst met je jaarlijkse uitgaven." },
  ],
  "netto-inkomen-vergelijking": [
    { label: "Bouw mijn planning", href: "/vermogen/plan", reason: "Gebruik je maandruimte voor sparen, beleggen en doelen." },
    { label: "Bekijk mijn volgende euro", href: "/apps/volgende-euro", reason: "Onderzoek welke bestemming bij je ruimte past." },
  ],
};

export function ToolRouteFooter({ app }: { app: AppManifest }) {
  const links = routes[app.slug];
  if (!links) return null;

  return (
    <aside className="mt-8 rounded-[1.25rem] border border-[var(--hair)] bg-[var(--paper-soft)] p-5 sm:p-6" aria-label="Logische vervolgstappen">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">Stap 4 · Ga verder</p>
      <h2 className="mt-2 font-serif text-[24px] tracking-[-0.03em] text-[var(--ink)]">Maak je antwoord scherper.</h2>
      <p className="mt-2 max-w-[62ch] text-[13.5px] leading-6 text-[var(--muted)]">Je hoeft niet opnieuw te beginnen. Kies wat logisch volgt uit deze berekening.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group rounded-xl border border-[var(--hair)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent-line)] hover:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
            <span className="font-medium text-[var(--ink)] group-hover:underline">{link.label} →</span>
            <span className="mt-1 block text-[13px] leading-5 text-[var(--muted)]">{link.reason}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
