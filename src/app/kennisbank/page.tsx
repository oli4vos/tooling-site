import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryText } from "@/components/GlossaryText";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { appRegistryBySlug } from "@/lib/app-registry";
import { knowledgeHorizonBands, knowledgeTopics } from "@/lib/knowledge-base";
import {
  knowledgeSourceEntries,
  knowledgeSources,
} from "@/lib/knowledge-sources";

export const metadata: Metadata = {
  title: "Geldzaken begrijpen",
  description:
    "Begrijp financiële berekeningen: bruto en netto, aftrek en korting, voorstellen en geldende regels. Met verdiepende uitleg over studieschuld.",
};

function getRelatedToolLabel(slug: string) {
  return appRegistryBySlug[slug]?.title ?? slug;
}

export default function KnowledgeBasePage() {
  const visibleHorizonBands = knowledgeHorizonBands.filter(
    (band) => band.visibility !== "hidden",
  );
  const visibleTopics = knowledgeTopics.filter(
    (topic) => topic.visibility !== "hidden",
  );

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14"
      >
        <section className="hair-b pb-8">
          <div className="max-w-4xl pt-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Kennisbank
            </div>
            <h1 className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]">
              Geldzaken begrijpen, stap voor stap
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[66ch] leading-[1.7] text-[var(--ink-2)]">
              Een uitkomst is pas nuttig als je begrijpt wat die betekent.
              Begin bij de belangrijkste begrippen en verdiep je daarna
              in het onderwerp dat bij jouw situatie past.
            </p>
            <p className="mt-4 max-w-[66ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
              Gebruik dit als routehulp. Voor je eigen cijfers en scenario&apos;s
              ga je daarna door naar de rekentools.
            </p>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="berekeningen-begrijpen">
          <h2 id="berekeningen-begrijpen" className="font-serif text-2xl tracking-tight">Zo lees je een berekening</h2>
          <div className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-2">
            {[
              {title:"Bruto is niet wat je overhoudt",text:"Bruto is het bedrag vóór inhoudingen. Netto is wat na de meegenomen inhoudingen overblijft. Controleer altijd of een tool bijvoorbeeld pensioenpremie en zorgbijdragen meerekent: een jaarvergelijking is niet automatisch je loonstrook."},
              {title:"Aftrek en korting zijn verschillend",text:"Een aftrekpost verlaagt het inkomen of de winst waarover belasting wordt berekend. Een heffingskorting verlaagt de berekende belasting. Een aftrek van € 1.000 betekent dus niet dat je € 1.000 terugkrijgt."},
              {title:"Een voorstel kan nog veranderen",text:"Tools met het label Belastingplan 2027 gebruiken een voorstelversie. Je verkent wat die plannen in een scenario betekenen; de uitkomst is geen toezegging over je toekomstige aanslag. De bronversie en beperkingen staan bij de uitkomst."},
              {title:"Een scenario is geen voorspelling",text:"Verwachte salarisgroei, rendement en eigen belastingpercentages zijn aannames. Verander één aanname tegelijk om te zien welk verschil die maakt. Een bandbreedte geeft onzekerheid weer en belooft niet waar je precies uitkomt."},
            ].map(item => <article key={item.title} className="border-t border-[var(--hair)] pt-4"><h3 className="font-medium text-[var(--ink)]">{item.title}</h3><p className="mt-2 max-w-[65ch] text-sm leading-7 text-[var(--muted)]">{item.text}</p></article>)}
          </div>
          <p className="mt-5 text-sm"><Link href="/apps" className="underline">Kies een tool voor je eigen cijfers</Link></p>
        </section>

        {visibleHorizonBands.length > 0 ? (
          <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
              Stap 1: kies je horizon
            </h2>
            <p className="mt-2 max-w-[66ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
              Hoe lang je geld kan blijven staan bepaalt vaak meer dan het gekozen
              product.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {visibleHorizonBands.map((band) => (
                <article
                  key={band.id}
                  className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                    {band.periodLabel}
                  </div>
                  <h3 className="mt-1 font-serif text-[1.2rem] text-[var(--ink)]">
                    {band.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                    <GlossaryText text={band.primaryGoal} />
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                    <GlossaryText text={band.typicalApproach} />
                  </p>
                  <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--soft)]">
                    Let op: <GlossaryText text={band.watchOut} />
                  </p>
                  <ul className="mt-3 space-y-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
                    {band.firstChecks.map((item) => (
                      <li key={item}>• <GlossaryText text={item} /></li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8 space-y-6">
          <h2 className="font-serif text-2xl tracking-tight">Verdieping: studie en studieschuld</h2>
          {visibleTopics.map((topic) => {
            const relatedTools = topic.relatedTools.filter(
              (slug) => appRegistryBySlug[slug],
            );
            const sourceIds = topic.sourceIds ?? [];

            return (
              <article
                key={topic.id}
                className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper"
              >
                <h2 className="font-serif text-[clamp(1.2rem,1.02rem+0.75vw,1.6rem)] tracking-[-0.02em] text-[var(--ink)]">
                  {topic.title}
                </h2>
                <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
                  <GlossaryText text={topic.summary} />
                </p>
                <details className="mt-4 border-t border-[var(--hair)] pt-4">
                  <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">
                    Lees uitleg, checklist en bronnen
                  </summary>
                  <p className="mt-4 max-w-[68ch] text-[13px] leading-[1.65] text-[var(--muted)]">
                    <strong className="text-[var(--ink)]">Wanneer relevant:</strong>{" "}
                    <GlossaryText text={topic.whenRelevant} />
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Checklist
                    </div>
                    <ul className="mt-2 space-y-1 text-[13px] leading-[1.6] text-[var(--muted)]">
                      {topic.checklist.map((item) => (
                        <li key={item}>• <GlossaryText text={item} /></li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Veelgemaakte fouten
                    </div>
                    <ul className="mt-2 space-y-1 text-[13px] leading-[1.6] text-[var(--muted)]">
                      {topic.commonMistakes.map((item) => (
                        <li key={item}>• <GlossaryText text={item} /></li>
                      ))}
                    </ul>
                  </div>
                  </div>

                {relatedTools.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Verdiepen met tools
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {relatedTools.map((slug) => (
                        <Link
                          key={slug}
                          href={`/apps/${slug}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                        >
                          {getRelatedToolLabel(slug)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {sourceIds.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Bronnen
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sourceIds.map((sourceId) => {
                        const source = knowledgeSources[sourceId];

                        return (
                          <a
                            key={sourceId}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                          >
                            {source.publisher}: {source.title}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                </details>
              </article>
            );
          })}
        </section>

        <section className="mt-8">
          <ToolDisclosure
            title="Bronnenregister"
            subtitle="Eén overzicht van de bronnen achter de kennisbank."
          >
          <p className="max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Deze bronnen zijn de basis voor de uitleg op de kennisbank en
            de rekentools. Wet- en regelgeving en officiële uitvoeringsinformatie
            zijn leidend; praktijkbronnen zijn alleen aanvullend.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {knowledgeSourceEntries.map(([id, source]) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-2xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                  {source.type} · {source.publisher}
                </div>
                <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-dotted decoration-[var(--accent)] underline-offset-4 transition hover:text-[var(--accent)]"
                  >
                    {source.title}
                  </a>
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--ink-2)]">
                  {source.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
                  <span>{source.date}</span>
                  <span aria-hidden="true">·</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-md underline decoration-dotted underline-offset-4 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                  >
                    Open bron
                  </a>
                </div>
              </article>
            ))}
          </div>
          </ToolDisclosure>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
