"use client";

import { useState } from "react";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { CalculationResultActions } from "@/components/tool/CalculationResultActions";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { validateTaxForm } from "./form";
import type { TaxToolConfig, TaxView } from "./types";
import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import Link from "next/link";

export function TaxCalculator({ config }: { config: TaxToolConfig }) {
  const state = useSubmittedCalculation(config.empty);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [result, setResult] = useState<TaxView | null>(null);
  const fields = config.fields.filter(field => !field.visible || field.visible(state.formValues));
  const flow = useMobileFieldFlow(fields.map(field => field.id));
  function calculate() {
    const nextErrors = validateTaxForm(config.fields, state.formValues);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      flow.goToField(Object.keys(nextErrors)[0]);
      return;
    }
    try { setResult(config.calculate(state.formValues)); state.submit(); }
    catch (error) { setErrors({form: error instanceof Error ? error.message : "Controleer de invoer."}); }
  }
  function advance() {
    const nextErrors = validateTaxForm(fields.filter(field => field.id === flow.activeFieldId), state.formValues);
    setErrors(nextErrors);
    flow.attemptAdvance({blocked: !!nextErrors[flow.activeFieldId],onComplete:calculate});
  }
  function reset() { state.reset(); setErrors({}); setResult(null); flow.resetToFirst(); }
  function exportResult() {
    if (!result) return;
    const submitted = state.submittedValues ?? {};
    const inputs = config.fields.filter(field => !field.visible || field.visible(submitted)).map(field => `${field.label}: ${field.options?.find(option => option.value === submitted[field.id])?.label ?? submitted[field.id] ?? "Niet ingevuld"}`);
    const text = [config.title, "Voorstel Belastingplan 2027 — nog niet definitief", `Regelversie ${result.version}; gecontroleerd ${result.verifiedAt}`, "Invoer van deze berekening", ...inputs, result.conclusion,
      ...result.rows.map(row => `${row.label}: ${row.value}`), ...(result.table ? [result.table.headers.join(" | "), ...result.table.rows.map(row => row.join(" | "))] : []), ...result.warnings, ...result.steps, ...result.sources.map(source => `${source.title}: ${source.url}`)].join("\n");
    const url = URL.createObjectURL(new Blob([text], {type:"text/plain;charset=utf-8"}));
    const anchor = document.createElement("a"); anchor.href=url; anchor.download="belasting-scenario.txt"; anchor.click(); URL.revokeObjectURL(url);
  }
  return <CalculatorShell
    intro={<><p className="section-label">Belastingplan 2027 · voorlopig scenario</p><h1 className="mt-3 font-serif text-2xl tracking-tight">{config.title}</h1><p className="mt-3 leading-7 text-[var(--muted)]">{config.intro}</p><p className="mt-3 text-sm leading-6">{config.scope}</p><p className="mt-3 text-sm leading-6">Je invoer blijft op dit scherm en wordt niet opgeslagen of verstuurd.</p></>}
    startActions={<div className="flex flex-wrap gap-2"><ToolActionButton onClick={() => {state.replaceValues(config.example,"Voorbeeldscenario geladen.");setResult(null);setErrors({});flow.resetToFirst();}}>Voorbeeld invullen</ToolActionButton><ToolActionButton onClick={reset}>Wis mijn gegevens</ToolActionButton></div>}
    inputs={<form id="tax-form" noValidate onSubmit={event => {event.preventDefault();calculate();}} className="space-y-5">
      {state.submitContextMessage && <p role="status">{state.submitContextMessage}</p>}
      {fields.map(field => <div key={field.id} {...flow.getFieldProps(field.id)}>
        <label htmlFor={field.id} className="text-sm font-medium">{field.label}{field.optional ? " (optioneel)" : ""}</label>
        {field.help && <p id={`${field.id}-help`} className="text-sm text-[var(--muted)]">{field.help}</p>}
        {field.type === "select" ? <select id={field.id} value={state.formValues[field.id] ?? ""} aria-invalid={!!errors[field.id]} aria-describedby={[field.help ? `${field.id}-help` : null, errors[field.id] ? `${field.id}-error` : null].filter(Boolean).join(" ") || undefined} className="field-shell min-h-12 w-full min-w-0 px-3" onChange={event => state.setFormValues({...state.formValues,[field.id]:event.target.value})}>
          <option value="">Maak een keuze</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select> : <input id={field.id} type={field.type === "date" ? "date" : "text"} inputMode={field.type === "date" ? undefined : "decimal"} value={state.formValues[field.id] ?? ""} aria-invalid={!!errors[field.id]} aria-describedby={[field.help ? `${field.id}-help` : null, errors[field.id] ? `${field.id}-error` : null].filter(Boolean).join(" ") || undefined} className="field-shell min-h-12 w-full min-w-0 px-3 font-mono" onChange={event => state.setFormValues({...state.formValues,[field.id]:event.target.value})} onKeyDown={flow.handleEnterAdvance(field.id,{blocked:!!validateTaxForm([field],state.formValues)[field.id],onInvalid:()=>setErrors(validateTaxForm([field],state.formValues)),onComplete:calculate})} />}
        {errors[field.id] && <p id={`${field.id}-error`} role="alert" className="text-sm text-[var(--neg)]">{errors[field.id]}</p>}
      </div>)}
      {errors.form && <p role="alert">{errors.form}</p>}
      <ToolActionButton type="submit" variant="submit" full className="hidden md:inline-flex">Bekijk uitkomst</ToolActionButton>
      <MobileFieldFlowControls current={flow.activeIndex+1} total={flow.total} canGoPrev={flow.canGoPrev} canGoNext={flow.canGoNext} onPrev={flow.goPrev} onNext={advance} onComplete={calculate} dockToViewport />
    </form>}
    result={<section id="tool-result-summary" tabIndex={-1} className="surface-panel p-5 sm:p-6">
      <p className="mb-3 rounded-lg border border-[var(--warn)] p-3 text-sm font-medium">Voorstel Belastingplan 2027 — nog niet definitief. Verkennende beta; geen fiscaal goedgekeurde berekening.</p>
      <p className="mb-4 break-words text-xs text-[var(--muted)]">Bronversie {result?.version ?? TAX_PROPOSALS.version} · gecontroleerd {result?.verifiedAt ?? TAX_PROPOSALS.verifiedAt}</p>
      {!result ? <p>Vul je gegevens in en bekijk de indicatie.</p> : <>
        {state.hasDirtyChanges && <p role="status" className="mb-3">Je invoer is gewijzigd. Bereken opnieuw om de uitkomst bij te werken.</p>}
        <h2 className="text-xl">{result.conclusion}</h2><dl className="my-5 space-y-3">{result.rows.map(row => <div key={row.label} className="grid gap-1 border-b border-[var(--hair)] pb-3"><dt className="text-sm text-[var(--muted)]">{row.label}</dt><dd className="font-mono text-lg">{row.value}</dd></div>)}</dl>
        {result.warnings.map(warning => <p key={warning} className="my-3 text-sm">{warning}</p>)}
        {result.table && <div className="my-5 overflow-x-auto" tabIndex={0} role="region" aria-label="Vergelijking per jaar"><table className="w-full text-left text-sm"><caption className="sr-only">Vergelijking per jaar</caption><thead><tr>{result.table.headers.map(header=><th key={header} scope="col" className="p-2">{header}</th>)}</tr></thead><tbody>{result.table.rows.map((row,index)=><tr key={index}>{row.map((cell,column)=><td key={column} className="border-t border-[var(--hair)] p-2 font-mono">{cell}</td>)}</tr>)}</tbody></table></div>}
        <details className="my-5"><summary className="min-h-11 cursor-pointer">Berekening en bronnen</summary><ol className="list-decimal space-y-2 pl-5">{result.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="my-3 text-sm">Regelversie: {result.version}. Gecontroleerd: {result.verifiedAt}. Fiscale review: nog niet afgerond.</p>{result.sources.map(source=><p key={source.url}><a className="underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></p>)}</details>
        <CalculationResultActions onEdit={()=>flow.resetToFirst()} onRestart={reset} />
        <ToolActionButton className="mt-3" onClick={exportResult} disabled={state.hasDirtyChanges}>Download samenvatting</ToolActionButton><p className="mt-2 text-xs">De download bevat je bedragen. Deel dit bestand alleen bewust; invoer komt nooit in een deellink.</p>
        <p className="mt-5 text-sm"><Link className="underline" href="/apps">Verder kijken naar een andere financiële vraag</Link></p>
      </>}
    </section>}
  />;
}
