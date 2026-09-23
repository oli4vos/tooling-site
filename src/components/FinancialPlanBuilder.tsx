"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateFinancialPlan, type FinancialPlanInput } from "@/lib/financial-plan";
import { downloadFinancialPlanPdf } from "@/lib/financial-plan-report";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { BtnLink } from "@/components/ui";
import { ToolActionButton } from "@/components/tool/ToolActionButton";

type FormValues = Record<keyof FinancialPlanInput, string | boolean>;

const defaults: FormValues = {
  year: String(getDefaultFinancialYear()), hasFiscalPartner: false, box3Method: "actual",
  currentSavings: "", currentInvestments: "", monthlySavingsContribution: "", monthlyInvestmentsContribution: "",
  expectedSavingsReturn: "2", expectedInvestmentsReturn: "6", horizonYears: "20", annualExpenses: "", withdrawalRate: "4",
};

function currency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function number(value: string | boolean | undefined) {
  return typeof value === "string" ? parseOptionalDecimalInput(value) ?? 0 : 0;
}

export function FinancialPlanBuilder() {
  const [values, setValues] = useState<FormValues>(defaults);
  const [isDownloading, setIsDownloading] = useState(false);
  const input = useMemo<FinancialPlanInput>(() => ({
    year: number(values.year), hasFiscalPartner: Boolean(values.hasFiscalPartner),
    box3Method: values.box3Method === "actual" ? "actual" : "forfaitary",
    currentSavings: number(values.currentSavings), currentInvestments: number(values.currentInvestments),
    monthlySavingsContribution: number(values.monthlySavingsContribution), monthlyInvestmentsContribution: number(values.monthlyInvestmentsContribution),
    expectedSavingsReturn: number(values.expectedSavingsReturn), expectedInvestmentsReturn: number(values.expectedInvestmentsReturn),
    horizonYears: number(values.horizonYears), annualExpenses: number(values.annualExpenses), withdrawalRate: number(values.withdrawalRate),
  }), [values]);
  const result = useMemo(() => calculateFinancialPlan(input), [input]);

  function set(field: keyof FormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function download() {
    if (isDownloading) return;
    setIsDownloading(true);
    try { await downloadFinancialPlanPdf(input, result); } finally { setIsDownloading(false); }
  }

  const fields: Array<[keyof FormValues, string, string]> = [
    ["currentSavings", "Spaargeld nu", "0"], ["currentInvestments", "Beleggingen nu", "0"],
    ["monthlySavingsContribution", "Maandelijkse spaarinleg", "0"], ["monthlyInvestmentsContribution", "Maandelijkse beleggingsinleg", "0"],
    ["expectedSavingsReturn", "Rendement spaargeld (%)", "2"], ["expectedInvestmentsReturn", "Rendement beleggingen (%)", "6"],
    ["horizonYears", "Horizon (jaren)", "20"], ["annualExpenses", "Jaarlijkse uitgaven (optioneel)", "30000"],
    ["withdrawalRate", "Opnamepercentage (%)", "4"],
  ];

  return <div className="grid gap-8 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)]">
    <section className="surface-panel p-5 sm:p-6">
      <div className="section-label">Stap 1 - jouw uitgangspunt</div>
      <h2 className="mt-3 font-serif text-[26px] tracking-[-0.03em] text-[var(--ink)]">Bouw een scenario dat bij jou past.</h2>
      <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">Vul bedragen per vermogenscategorie in. Lege velden tellen als nul. Alles blijft lokaal in je browser.</p>
      <div className="mt-6 grid gap-4">
        {fields.map(([field, label, placeholder]) => <label key={field} className="grid gap-2">
          <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">{label}</span>
          <input inputMode="decimal" value={values[field] as string} placeholder={placeholder} onChange={(event) => set(field, event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
        </label>)}
        <label className="grid gap-2"><span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">Box 3-methode</span>
          <select value={values.box3Method as string} onChange={(event) => set("box3Method", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 text-[15px] text-[var(--ink)] outline-none"><option value="actual">Werkelijk rendement (scenario)</option><option value="forfaitary">Forfaitair rendement</option></select>
        </label>
        <label className="flex items-center gap-3 text-[14px] text-[var(--ink)]"><input type="checkbox" checked={Boolean(values.hasFiscalPartner)} onChange={(event) => set("hasFiscalPartner", event.target.checked)} className="size-4 accent-[var(--accent)]" /> Fiscale partner</label>
      </div>
    </section>

    <section aria-live="polite">
      <div className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">Stap 2 - jouw plan</div>
        <div className="mt-4 font-serif text-[38px] leading-none tracking-[-0.04em]">{currency(result.endingAssets)}</div>
        <p className="mt-3 text-[14px] leading-7 text-white/75">Indicatief vermogen na {result.horizonYears} jaar, bij {currency(result.totalMonthlyContribution)} maandelijkse inleg.</p>
      </div>
      <div className="mt-4 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <h2 className="font-serif text-[25px] tracking-[-0.03em] text-[var(--ink)]">Waaruit bestaat dit?</h2>
        <dl className="mt-4">
          <div className="flex justify-between gap-4 border-b border-[var(--hair)] py-3"><dt>Spaargeld op eindhorizon</dt><dd className="font-mono tabular text-[var(--ink)]">{currency(result.endingSavings)}</dd></div>
          <div className="flex justify-between gap-4 border-b border-[var(--hair)] py-3"><dt>Beleggingen op eindhorizon</dt><dd className="font-mono tabular text-[var(--ink)]">{currency(result.endingInvestments)}</dd></div>
          <div className="flex justify-between gap-4 border-b border-[var(--hair)] py-3"><dt>Eigen inleg</dt><dd className="font-mono tabular text-[var(--ink)]">{currency(result.totalContributions)}</dd></div>
          <div className="flex justify-between gap-4 border-b border-[var(--hair)] py-3"><dt>Scenario-groei</dt><dd className="font-mono tabular text-[var(--ink)]">{currency(result.totalGrowth)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt>Indicatieve Box 3 in eindjaar</dt><dd className="font-mono tabular text-[var(--ink)]">{currency(result.endingBox3Tax)}</dd></div>
        </dl>
        {result.fireTarget !== null ? <p className="mt-5 rounded-lg bg-[var(--paper-soft)] p-4 text-[13px] leading-6 text-[var(--ink-2)]">Je ingevulde uitgaven geven een indicatief FIRE-doel van <strong>{currency(result.fireTarget)}</strong>. {result.fireGap && result.fireGap > 0 ? `Op de eindhorizon resteert nog ${currency(result.fireGap)}.` : "Dit scenario bereikt dat doel."}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3"><ToolActionButton type="button" onClick={download} variant="accent" size="md" disabled={isDownloading}>{isDownloading ? "Planning wordt gemaakt..." : "Download mijn planning (PDF)"}</ToolActionButton><BtnLink href="/apps/box3-indicatie" kind="outline" size="md">Verfijn Box 3</BtnLink></div>
      </div>
      <section className="mt-6 border-t border-[var(--hair)] pt-6"><div className="section-label">Stap 3 - maak het scherper</div><h2 className="mt-3 font-serif text-[25px] tracking-[-0.03em] text-[var(--ink)]">Logische vervolgstappen</h2><div className="mt-4 grid gap-3">{result.nextSteps.map((step, index) => <Link key={step.href} href={step.href} className="group rounded-xl border border-[var(--hair)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-paper"><span className="font-mono text-[11px] text-[var(--accent)]">0{index + 1}</span><h3 className="mt-2 font-medium text-[var(--ink)] group-hover:underline">{step.title}</h3><p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">{step.detail}</p></Link>)}</div></section>
      <details className="mt-6 rounded-xl border border-[var(--hair)] bg-white p-4"><summary className="cursor-pointer font-medium text-[var(--ink)]">Jaarlijkse planning bekijken</summary><div className="mt-4 overflow-x-auto"><table className="min-w-full text-[12px]"><thead><tr className="border-b border-[var(--hair)] text-left"><th className="p-2">Jaar</th><th className="p-2 text-right">Vermogen</th><th className="p-2 text-right">Inleg</th><th className="p-2 text-right">Groei</th></tr></thead><tbody>{result.yearly.map((point) => <tr key={point.year} className="border-b border-[var(--hair)]/70"><td className="p-2">{point.year}</td><td className="p-2 text-right font-mono">{currency(point.totalAssets)}</td><td className="p-2 text-right font-mono">{currency(point.contributions)}</td><td className="p-2 text-right font-mono">{currency(point.growth)}</td></tr>)}</tbody></table></div></details>
    </section>
  </div>;
}
