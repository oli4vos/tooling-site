import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GRIP_INDEPENDENCE_FULL } from "@/lib/trust-copy";

export const metadata: Metadata = {
  title: "Over Grip",
  description:
    "Financiële tools die ingewikkelde geldzaken begrijpelijk maken. Transparante berekeningen, zonder advertenties of persoonlijk advies.",
};

export default function OverPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14"
      >
        <section className="rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <h1 className="text-fluid-h2 max-w-4xl font-serif tracking-[-0.03em] text-[var(--ink)]">
            Over Grip
          </h1>

          <div className="mt-6 max-w-[70ch] space-y-6 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            <p>
              Grip maakt ingewikkelde geldzaken begrijpelijk. Of je nu werkt,
              onderneemt, een woning koopt, voor later opbouwt of studeert:
              de tools helpen je zien wat bedragen en regels voor jouw
              scenario betekenen. Je hoeft geen financieel expert te zijn.
              Er zijn geen advertenties of
              doorverwijzingen naar aanbieders. Je ziet informatieve scenario&apos;s
              met je eigen cijfers; geen persoonlijk advies.
            </p>

            <div id="onafhankelijk" className="scroll-mt-24">
              <h2 className="mb-2 font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)]">
                Privaat en onafhankelijk
              </h2>
              <p>{GRIP_INDEPENDENCE_FULL}</p>
              <p className="mt-3">
                Grip heeft geen toegang tot Mijn DUO, systemen van de
                Belastingdienst of andere interne overheidssystemen. Persoonlijke
                gegevens die je daar ziet, zoek je zelf op en vul je zelf in.
              </p>
            </div>

            <div>
              <h2 className="mb-2 font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)]">
                Van openbare bron naar resultaat
              </h2>
              <ol
                className="grid gap-2 text-[13px] sm:grid-cols-4"
                aria-label="Werkwijze van Grip"
              >
                <li className="rounded-lg border hair bg-[var(--paper-soft)] p-3">
                  Openbare primaire bron
                </li>
                <li className="rounded-lg border hair bg-[var(--paper-soft)] p-3">
                  Centrale Grip-brondata
                </li>
                <li className="rounded-lg border hair bg-[var(--paper-soft)] p-3">
                  Grip-rekenlaag
                </li>
                <li className="rounded-lg border hair bg-[var(--paper-soft)] p-3">
                  Resultaat voor jou
                </li>
              </ol>
              <p className="mt-3">
                Een link naar een officiële website onderbouwt een regel of helpt je
                officiële informatie te vinden. De link betekent niet dat de
                betreffende organisatie de berekening heeft uitgevoerd, gecontroleerd
                of goedgekeurd.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Privacy
              </h2>
              <p>
                In deze versie rekent alles lokaal in je browser. Persoonlijke
                invoer wordt niet naar een centrale database verstuurd. Een
                profiel blijft standaard in de browsersessie en wordt alleen na
                jouw bewuste keuze op dit apparaat bewaard. Lees de volledige{" "}
                <Link
                  href="/privacy"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  privacyverklaring
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Waarop we ons baseren
              </h2>
              <p>
                Elke aanname is terug te voeren op openbare wet- en
                regelgeving, het normadvies van het Nibud, toezichthouders
                zoals de AFM en officiële uitleg van de overheid, DUO en de
                Belastingdienst. De waarden worden minstens jaarlijks en bij
                relevante wijzigingen gecontroleerd. Bekijk de{" "}
                <Link
                  href="/variabelen"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  aannames
                </Link>{" "}
                en de{" "}
                <Link
                  href="/kennisbank"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  uitleg in de kennisbank
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[18px] tracking-[-0.02em] text-[var(--ink)] mb-2">
                Fouten melden
              </h2>
              <p>
                Iets onjuist of onduidelijk? Meld het via{" "}
                <a
                  href="https://github.com/oli4vos/tooling-site/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--ink)] hover:text-[var(--ink-2)]"
                >
                  het foutformulier
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
