import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistryBySlug } from "@/lib/app-registry";
import { toolGroups } from "@/lib/tool-groups";

export default function HomePage() {
  const topics = toolGroups.map(group => ({...group, apps: group.slugs.map(slug => appRegistryBySlug[slug]).filter(Boolean)})).filter(group => group.apps.length > 0);
  return <>
    <SiteHeader />
    <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
      <section className="grid gap-8 pb-10 pt-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)] lg:items-end">
        <div>
          <div className="section-label">Begrijp je geldkeuze voordat je haar maakt</div>
          <h1 className="text-fluid-h1 mt-4 max-w-[17ch] font-serif tracking-[-0.03em] text-[var(--ink)]">Geldzaken ingewikkeld?<br />Maak ze inzichtelijk.</h1>
          <p className="text-fluid-lead mt-5 max-w-[55ch] leading-[1.75] text-[var(--ink-2)]">IPC Ole vertaalt regels, rente en rendement naar een scenario met jouw cijfers. Vergelijk mogelijkheden en begrijp wat een keuze voor jouw situatie betekent.</p>
          <div className="mt-7 flex flex-wrap gap-3"><BtnLink href="#route" kind="primary" size="lg">Vind jouw vraag</BtnLink><BtnLink href="/start" kind="outline" size="lg">Zo werkt het</BtnLink></div>
        </div>
        <aside className="border-l-2 border-[var(--accent)] pl-5 text-[14px] leading-7 text-[var(--ink-2)]" aria-label="Wat je van IPC Ole kunt verwachten">
          <h2 className="font-medium text-[var(--ink)]">Je hoeft geen expert te zijn.</h2>
          <p className="mt-2">Je krijgt een begrijpelijke uitkomst, met de aannames en uitleg erbij. De berekening gebeurt in je browser.</p>
          <p className="mt-3 text-[13px] text-[var(--muted)]">Een hulpmiddel om te begrijpen en te vergelijken. Geen persoonlijk financieel of belastingadvies.</p>
        </aside>
      </section>
      <section className="grid gap-3 border-y border-[var(--hair)] py-5 sm:grid-cols-3" aria-label="Start bij een onderwerp">
        <BtnLink href="/hypotheek" kind="outline" size="md">Hypotheek begrijpen</BtnLink>
        <BtnLink href="/vermogen" kind="outline" size="md">Vermogen en beleggen</BtnLink>
        <BtnLink href="/belasting" kind="outline" size="md">Belasting begrijpen</BtnLink>
      </section>
      <section id="route" className="scroll-mt-36 border-t border-[var(--hair)] py-10">
        <h2 className="font-serif text-fluid-h2 tracking-[-0.02em] text-[var(--ink)]">Waar wil je inzicht in?</h2>
        <p className="mt-3 max-w-[60ch] text-[14px] leading-7 text-[var(--muted)]">Kies wat nu bij je past. Er is geen vaste volgorde.</p>
        <div className="mt-7 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {topics.map(group => <article key={group.title} className="border-t border-[var(--hair)] py-5">
            <h3 className="font-serif text-xl tracking-tight text-[var(--ink)]">{group.title}</h3>
            <p className="mt-2 max-w-[58ch] text-[14px] leading-7 text-[var(--muted)]">{group.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">{group.apps.map(app => <BtnLink key={app.slug} href={`/apps/${app.slug}`} kind="outline" size="sm">{app.title}</BtnLink>)}</div>
          </article>)}
        </div>
      </section>
      <section className="surface-panel p-6 sm:p-8">
        <h2 className="font-serif text-fluid-h2 tracking-tight">Begrijpen vóór je beslist</h2>
        <p className="mt-3 max-w-[65ch] text-[14px] leading-7 text-[var(--muted)]">Een belastingkorting is niet hetzelfde als een aftrekpost. En een voorstel is nog geen geldende wet. In de uitleg lees je wat je uit een berekening kunt halen — en wat niet.</p>
        <div className="mt-5"><BtnLink href="/kennisbank" kind="outline" size="md">Lees de uitleg</BtnLink></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
