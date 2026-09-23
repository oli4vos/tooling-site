import type { Metadata } from "next";
import { BtnLink } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Zo werkt IPC Ole",
  description: "Een heldere route van financiële vraag naar begrijpelijk scenario.",
};

const routes = [
  ["Een keuze voorbereiden", "Vergelijk twee routes voordat je tekent, aflost, belegt of minder gaat werken.", "/vermogen"],
  ["Een regel begrijpen", "Zie wat belasting, renteaftrek of een andere regel in jouw cijfers kan betekenen.", "/belasting"],
  ["Een plan maken", "Bouw met horizon, categorieën en maandelijkse inleg aan een vermogensscenario.", "/vermogen"],
] as const;

export default function StartPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-12 pt-8 lg:pb-16">
        <section className="grid gap-8 border-b border-[var(--hair)] pb-12 pt-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div>
            <div className="section-label">Zo werkt IPC Ole</div>
            <h1 className="text-fluid-h1 mt-4 max-w-[15ch] font-serif tracking-[-0.04em] text-[var(--ink)]">
              Begrijp je geldkeuze voordat je haar maakt.
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">
              IPC Ole vertaalt regels, rente en rendement naar een scenario met jouw cijfers. Je vergelijkt mogelijkheden, ziet wat onzeker is en houdt zelf de regie.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BtnLink href="/#route" kind="primary" size="lg">Kies jouw vraag</BtnLink>
              <BtnLink href="/apps" kind="outline" size="lg">Bekijk alle tools</BtnLink>
            </div>
          </div>
          <aside className="surface-panel p-5 sm:p-6">
            <div className="section-label">In één zin</div>
            <p className="mt-3 font-serif text-[24px] leading-tight tracking-[-0.03em] text-[var(--ink)]">Geen verkooppraatje. Wel zicht op de keuze achter het bedrag.</p>
          </aside>
        </section>

        <section className="grid gap-4 border-b border-[var(--hair)] py-10 md:grid-cols-3">
          {routes.map(([title, copy, href], index) => (
            <article key={title} className="border-t-2 border-[var(--accent)] pt-4">
              <span className="font-mono text-[11px] text-[var(--accent)]">0{index + 1}</span>
              <h2 className="mt-3 font-serif text-[23px] tracking-[-0.025em] text-[var(--ink)]">{title}</h2>
              <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">{copy}</p>
              <div className="mt-5"><BtnLink href={href} kind="outline" size="sm">Start hier</BtnLink></div>
            </article>
          ))}
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="section-label">Wat je altijd ziet</div>
            <h2 className="mt-3 font-serif text-fluid-h2 tracking-[-0.03em] text-[var(--ink)]">Een uitkomst met context.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["De aannames", "Welke rente, inflatie, horizon of inleg is gebruikt?"],
              ["De bron", "Welk jaar en welke openbare bron hoort bij een fiscale regel?"],
              ["De onzekerheid", "Wat is een scenario en wat is geen voorspelling?"],
              ["De volgende stap", "Welke vergelijking helpt je daarna verder?"],
            ].map(([title, copy]) => <div key={title} className="rounded-xl border border-[var(--hair)] bg-white p-4"><h3 className="font-medium text-[var(--ink)]">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">{copy}</p></div>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
