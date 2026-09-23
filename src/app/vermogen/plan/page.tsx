import type { Metadata } from "next";
import { FinancialPlanBuilder } from "@/components/FinancialPlanBuilder";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Mijn financiële planning", description: "Bouw, controleer en download een financiële planning met spaargeld, beleggingen en Box 3." };

export default function FinancialPlanPage() {
  return <><SiteHeader /><main id="main-content" className="page-shell min-h-[100dvh] pb-12 pt-8 lg:pb-16"><section className="pb-8"><div className="section-label">Vermogensroute</div><h1 className="text-fluid-h1 mt-4 max-w-[17ch] font-serif tracking-[-0.04em] text-[var(--ink)]">Van losse cijfers naar een plan dat je kunt meenemen.</h1><p className="text-fluid-lead mt-5 max-w-[60ch] leading-[1.75] text-[var(--ink-2)]">Begin met je maandelijkse ruimte. Zie sparen, beleggen, groei en een indicatief belastingeffect naast elkaar. Daarna download je de planning als PDF.</p></section><FinancialPlanBuilder /></main><SiteFooter /></>;
}
