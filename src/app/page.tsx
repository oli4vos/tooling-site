import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistryBySlug } from "@/lib/app-registry";

const routeSteps = [
  {
    title: "Wat wordt mijn schuld?",
    body: "Bekijk wat je tijdens je studie opbouwt en welke rente daarbij hoort.",
    links: [
      { href: "/apps/duo-schuld-bij-starten-lenen", label: "Ik ga beginnen met lenen" },
      { href: "/apps/duo-leenbedrag-impact", label: "Ik leen al" },
      { href: "/kennisbank", label: "Lees hoe DUO-rente werkt" },
    ],
  },
  {
    title: "Wat ga ik betalen?",
    body: "Bereken je wettelijke DUO-maandbedrag en wat extra aflossen feitelijk verandert.",
    links: [
      { href: "/apps/duo-maandbedrag", label: "DUO-maandbedrag" },
      { href: "/apps/duo-extra-aflossen", label: "Extra aflossen" },
    ],
  },
  {
    title: "Wat betekent dit voor een huis?",
    body: "Bekijk de impact van je studieschuld op hypotheekruimte, eigen geld en woningwaarde.",
    links: [
      { href: "/apps/duo-maandbedrag#hypotheekimpact", label: "Bekijk hypotheekimpact" },
      { href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek", label: "Maximale hypotheek" },
      { href: "/apps/familiehulp-eerste-woning", label: "Familiehulp eerste woning" },
    ],
  },
  {
    title: "Belasting, vermogen of ZZP?",
    body: "Bereken je voorlopige box 3-impact, vergelijk jaarruimte met vrij beleggen of plan een ZZP-uurtarief.",
    links: [
      { href: "/apps/box-3-impact", label: "Box 3-impact" },
      { href: "/apps/jaarruimte-vs-vrij-beleggen", label: "Jaarruimte vergelijken" },
      { href: "/apps/zzp-uurtarief", label: "ZZP-uurtarief" },
    ],
  },
];

export default async function HomePage() {
  const availableRouteSteps = routeSteps.map((step) => ({
    ...step,
    links: step.links.filter((link) => {
      const slug = /^\/apps\/([^/?#]+)/.exec(link.href)?.[1];
      return !slug || Boolean(appRegistryBySlug[slug]);
    }),
  }));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="pb-10 pt-2">
          <div className="max-w-3xl">
            <div className="section-label">
              Rekentools voor je geldzaken
            </div>
            <h1
              className="text-fluid-h1 mt-4 max-w-[13ch] font-serif tracking-[-0.03em] text-[var(--ink)]"
              style={{ textWrap: "balance" }}
            >
              Reken je financiële scenario&apos;s zelf door.
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">
              Van studieschuld tot box 3 en ZZP-uurtarief: werk met je eigen
              cijfers en zie welke aannames de uitkomst bepalen.
            </p>
            <div className="mt-7">
              <BtnLink href="#route" kind="primary" size="lg">
                Kies je onderwerp
              </BtnLink>
            </div>
            <p className="mt-4 max-w-[60ch] text-[13px] leading-6 text-[var(--muted)]">
              Geen advies. Je ziet scenario&apos;s met jouw eigen cijfers. Wat je
              ermee doet, bepaal jij.
            </p>
          </div>
        </section>

        <section id="route" className="py-10">
          <div className="max-w-2xl">
            <h2 className="font-serif text-fluid-h2 tracking-[-0.02em] text-[var(--ink)]">
              Het stappenplan
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
              Begin klein. Open pas meer wanneer de vorige laag duidelijk is.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {availableRouteSteps.map((step, index) => (
              <article
                key={step.title}
                className="surface-panel flex min-h-full flex-col p-5"
              >
                <div className="section-label">
                  Stap {index + 1}
                </div>
                <h3 className="mt-3 font-serif text-[1.25rem] tracking-[-0.02em] text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-6 text-[var(--muted)]">
                  {step.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.links.map((link) => (
                    <BtnLink key={link.href} href={link.href} kind="outline" size="sm">
                      {link.label}
                    </BtnLink>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-8">
          <div className="surface-panel p-6">
            <h2 className="font-serif text-fluid-h2 tracking-[-0.02em] text-[var(--ink)]">
              Zelf een tool kiezen
            </h2>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-7 text-[var(--muted)]">
              Bekijk het volledige overzicht als je al weet welke vraag je wilt
              beantwoorden.
            </p>
            <div className="mt-5">
              <BtnLink href="/apps" kind="outline" size="md">
                Bekijk alle tools
              </BtnLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
