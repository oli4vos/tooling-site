import type { AppManifest } from "@/lib/app-types";
import { BtnLink } from "@/components/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type TopicLandingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  promise: string;
  steps: string[];
  apps: AppManifest[];
};

export function TopicLanding({ eyebrow, title, intro, promise, steps, apps }: TopicLandingProps) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-12 pt-8 lg:pb-16">
        <section className="grid gap-8 border-b border-[var(--hair)] pb-12 pt-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div>
            <div className="section-label">{eyebrow}</div>
            <h1 className="text-fluid-h1 mt-4 max-w-[16ch] font-serif tracking-[-0.04em] text-[var(--ink)]">{title}</h1>
            <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">{intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BtnLink href="#tools" kind="primary" size="lg">Bekijk de tools</BtnLink>
              <BtnLink href="/" kind="outline" size="lg">Terug naar overzicht</BtnLink>
            </div>
          </div>
          <aside className="surface-panel p-5 sm:p-6">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Wat je hier krijgt</div>
            <p className="mt-3 font-serif text-[22px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{promise}</p>
          </aside>
        </section>

        <section className="grid gap-3 border-b border-[var(--hair)] py-5 text-[13px] text-[var(--muted)] sm:grid-cols-3" aria-label="Vaste uitgangspunten">
          <div><span className="font-medium text-[var(--ink)]">Lokaal berekend.</span> Je invoer blijft in je browser.</div>
          <div><span className="font-medium text-[var(--ink)]">Transparant.</span> Aannames, bronjaar en methode staan bij de uitkomst.</div>
          <div><span className="font-medium text-[var(--ink)]">Indicatief.</span> Een scenario is geen persoonlijk advies.</div>
        </section>

        <section className="grid gap-8 border-b border-[var(--hair)] py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="section-label">Zo werkt het</div>
            <h2 className="mt-3 font-serif text-fluid-h2 tracking-[-0.03em] text-[var(--ink)]">Van vraag naar overzicht.</h2>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => <li key={step} className="rounded-xl border border-[var(--hair)] bg-white p-4 text-[14px] leading-6 text-[var(--ink-2)]"><span className="font-mono text-[11px] text-[var(--accent)]">0{index + 1}</span><p className="mt-3">{step}</p></li>)}
          </ol>
        </section>

        <section id="tools" className="scroll-mt-28 py-10">
          <div className="section-label">Kies je situatie</div>
          <h2 className="mt-3 font-serif text-fluid-h2 tracking-[-0.03em] text-[var(--ink)]">Tools die bij deze vraag horen.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {apps.map((app) => <article key={app.slug} className="flex flex-col rounded-[1.25rem] border border-[var(--hair)] bg-white p-5 shadow-paper">
              <h3 className="font-serif text-[22px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{app.title}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{app.description}</p>
              <div className="mt-auto pt-6"><BtnLink href={`/apps/${app.slug}`} kind="outline" size="sm">Open deze tool</BtnLink></div>
            </article>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
