"use client";

import { useState } from "react";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { FieldError } from "@/components/forms/FieldError";
import { ResultRow } from "@/components/ResultRow";
import { ToolDisclosure } from "@/components/ToolDisclosure";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { WealthJourneyLinks } from "@/components/WealthJourneyLinks";
import { Pill } from "@/components/ui";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import type { Box3Method } from "@/lib/tax";
import {
  createProfilePrefillState,
  mergeProfilePatchIntoValues,
} from "@/lib/profile-prefill";
import { getBox3IndicatieDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { calculateBox3Indicatie, type Box3ToolInput } from "./logic";

const DEFAULT_YEAR = getDefaultFinancialYear();

type FormState = {
  method: Box3Method;
  year: string;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  hasFiscalPartner: boolean;
  actualAnnualReturnRate: string;
  actualIncome: string;
  actualValueChange: string;
  actualDebtInterest: string;
  monthlyBankDepositsContribution: string;
  monthlyInvestmentsContribution: string;
  expectedBankDepositsReturn: string;
  expectedInvestmentsReturn: string;
  horizonYears: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const exampleValues: FormState = {
  method: "actual",
  year: String(DEFAULT_YEAR),
  bankDeposits: "50000",
  investmentsAndOtherAssets: "25000",
  debts: "0",
  hasFiscalPartner: false,
  actualAnnualReturnRate: "5",
  actualIncome: "",
  actualValueChange: "",
  actualDebtInterest: "",
  monthlyBankDepositsContribution: "250",
  monthlyInvestmentsContribution: "500",
  expectedBankDepositsReturn: "2",
  expectedInvestmentsReturn: "6",
  horizonYears: "10",
};

const defaultValues: FormState = {
  method: "actual",
  year: "",
  bankDeposits: "",
  investmentsAndOtherAssets: "",
  debts: "",
  hasFiscalPartner: false,
  actualAnnualReturnRate: "",
  actualIncome: "",
  actualValueChange: "",
  actualDebtInterest: "",
  monthlyBankDepositsContribution: "",
  monthlyInvestmentsContribution: "",
  expectedBankDepositsReturn: "",
  expectedInvestmentsReturn: "",
  horizonYears: "",
};

type CalculatorContentProps = {
  initialValues: FormState;
  hasRelevantProfileValues: boolean;
  profilePatch: Partial<FormState>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseOptionalNumber(value: string) {
  return parseOptionalDecimalInput(value);
}

function validateForm(values: FormState) {
  const errors: ValidationErrors = {};
  const year = parseOptionalNumber(values.year);
  const bankDeposits = parseOptionalNumber(values.bankDeposits);
  const investmentsAndOtherAssets = parseOptionalNumber(values.investmentsAndOtherAssets);
  const debts = parseOptionalNumber(values.debts);
  const actualAnnualReturnRate = parseOptionalNumber(values.actualAnnualReturnRate);
  const actualIncome = parseOptionalNumber(values.actualIncome);
  const actualValueChange = parseOptionalNumber(values.actualValueChange);
  const actualDebtInterest = parseOptionalNumber(values.actualDebtInterest);
  const monthlyBankDepositsContribution = parseOptionalNumber(values.monthlyBankDepositsContribution);
  const monthlyInvestmentsContribution = parseOptionalNumber(values.monthlyInvestmentsContribution);
  const expectedBankDepositsReturn = parseOptionalNumber(values.expectedBankDepositsReturn);
  const expectedInvestmentsReturn = parseOptionalNumber(values.expectedInvestmentsReturn);
  const horizonYears = parseOptionalNumber(values.horizonYears);
  const hasActualComponents = [actualIncome, actualValueChange, actualDebtInterest].some(
    (value) => value !== undefined,
  );

  if (year === undefined || !Number.isFinite(year) || year < 2000 || year > 2200) {
    errors.year = "Gebruik een geldig belastingjaar.";
  }

  if (
    bankDeposits === undefined ||
    !Number.isFinite(bankDeposits) ||
    bankDeposits < 0
  ) {
    errors.bankDeposits = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    investmentsAndOtherAssets === undefined ||
    !Number.isFinite(investmentsAndOtherAssets) ||
    investmentsAndOtherAssets < 0
  ) {
    errors.investmentsAndOtherAssets = "Gebruik 0 of een hoger bedrag.";
  }

  if (debts === undefined || !Number.isFinite(debts) || debts < 0) {
    errors.debts = "Gebruik 0 of een hoger bedrag.";
  }

  if (
    values.method === "actual" &&
    (!hasActualComponents && (actualAnnualReturnRate === undefined ||
      !Number.isFinite(actualAnnualReturnRate) ||
      actualAnnualReturnRate < 0 ||
      actualAnnualReturnRate > 100))
  ) {
    errors.actualAnnualReturnRate = "Gebruik een rendement tussen 0 en 100.";
  }

  for (const [field, value] of [
    ["monthlyBankDepositsContribution", monthlyBankDepositsContribution],
    ["monthlyInvestmentsContribution", monthlyInvestmentsContribution],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      errors[field] = "Gebruik 0 of een hoger bedrag.";
    }
  }
  for (const [field, value] of [
    ["expectedBankDepositsReturn", expectedBankDepositsReturn],
    ["expectedInvestmentsReturn", expectedInvestmentsReturn],
  ] as const) {
    if (value === undefined || !Number.isFinite(value) || value < 0 || value > 100) {
      errors[field] = "Gebruik een rendement tussen 0 en 100.";
    }
  }
  if (horizonYears === undefined || !Number.isFinite(horizonYears) || horizonYears < 1 || horizonYears > 60) {
    errors.horizonYears = "Gebruik een horizon van 1 tot 60 jaar.";
  }

  const parsedValues: Box3ToolInput | null =
    Object.keys(errors).length === 0
      ? {
          method: values.method,
          year,
          bankDeposits: bankDeposits ?? 0,
          investmentsAndOtherAssets: investmentsAndOtherAssets ?? 0,
          debts: debts ?? 0,
          hasFiscalPartner: values.hasFiscalPartner,
          actualAnnualReturnRate:
            values.method === "actual" ? actualAnnualReturnRate : undefined,
          actualIncome: values.method === "actual" ? actualIncome : undefined,
          actualValueChange: values.method === "actual" ? actualValueChange : undefined,
          actualDebtInterest: values.method === "actual" ? actualDebtInterest : undefined,
          monthlyBankDepositsContribution: monthlyBankDepositsContribution ?? 0,
          monthlyInvestmentsContribution: monthlyInvestmentsContribution ?? 0,
          expectedBankDepositsReturn: expectedBankDepositsReturn ?? 0,
          expectedInvestmentsReturn: expectedInvestmentsReturn ?? 0,
          horizonYears: horizonYears ?? 10,
        }
      : null;

  return { errors, parsedValues };
}

export default function Calculator() {
  const { profile, hasProfile } = useUserProfile();
  const profilePatch = getBox3IndicatieDefaultsFromProfile(profile);
  const { hasRelevantProfileValues, profileKey, initialValues } =
    createProfilePrefillState<FormState>({
      defaultValues,
      profilePatch,
      hasProfile,
      profileUpdatedAt: profile.updatedAt,
    });

  return (
    <CalculatorContent
      key={profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      profilePatch={profilePatch}
    />
  );
}

function CalculatorContent({
  initialValues,
  hasRelevantProfileValues,
  profilePatch,
}: CalculatorContentProps) {
  const [formValues, setFormValues] = useState<FormState>(initialValues);
  const validation = validateForm(formValues);
  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => {
      const value = formValues[field as keyof FormState];
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }),
  ) as ValidationErrors;
  const { parsedValues } = validation;
  const result = parsedValues ? calculateBox3Indicatie(parsedValues) : null;
  const mobileFlow = useMobileFieldFlow([
    "method",
    "year",
    "bankDeposits",
    "investmentsAndOtherAssets",
    "debts",
    "hasFiscalPartner",
    ...(formValues.method === "actual" ? ["actualAnnualReturnRate"] : []),
    ...(formValues.method === "actual" ? ["actualIncome", "actualValueChange", "actualDebtInterest"] : []),
    "monthlyBankDepositsContribution",
    "monthlyInvestmentsContribution",
    "expectedBankDepositsReturn",
    "expectedInvestmentsReturn",
    "horizonYears",
  ]);

  const isCurrentFieldBlocked = Boolean(
    {
      year: errors.year,
      bankDeposits: errors.bankDeposits,
      investmentsAndOtherAssets: errors.investmentsAndOtherAssets,
      debts: errors.debts,
      actualAnnualReturnRate: errors.actualAnnualReturnRate,
      actualIncome: undefined,
      actualValueChange: undefined,
      actualDebtInterest: undefined,
      monthlyBankDepositsContribution: errors.monthlyBankDepositsContribution,
      monthlyInvestmentsContribution: errors.monthlyInvestmentsContribution,
      expectedBankDepositsReturn: errors.expectedBankDepositsReturn,
      expectedInvestmentsReturn: errors.expectedInvestmentsReturn,
      horizonYears: errors.horizonYears,
    }[mobileFlow.activeFieldId],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function applyProfileValues() {
    setFormValues((current) => mergeProfilePatchIntoValues(current, profilePatch));
  }

  function applyExampleValues() {
    setFormValues(exampleValues);
  }

  function goToResult() {
    document.getElementById("tool-result-summary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <CalculatorShell>
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Box 3
        </div>
        <h1 className="mt-2 font-serif text-[28px] tracking-[-0.02em] text-[var(--ink)]">
          Box 3 indicatie
        </h1>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Bereken indicatief hoeveel box 3-heffing past bij jouw spaargeld,
          beleggingen en schulden. Kies tussen werkelijk rendement (default) en
          forfaitair rendement als scenario.
        </p>

        {hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Profielwaarden gevonden in deze browser.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Voorbeeld invullen
            </ToolActionButton>
            <ToolActionButton type="button" onClick={applyProfileValues} variant="secondary" size="sm">
              Gebruik profiel
            </ToolActionButton>
          </div>
        ) : null}
        {!hasRelevantProfileValues ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            <span>Start leeg en vul snel een voorbeeldscenario in.</span>
            <ToolActionButton type="button" onClick={applyExampleValues} variant="secondary" size="sm">
              Voorbeeld invullen
            </ToolActionButton>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <label className={mobileFlow.getFieldClassName("method")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Rekensysteem
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.method === "forfaitary"}
                onChange={(event) =>
                  updateField("method", event.target.checked ? "forfaitary" : "actual")
                }
                className="size-4 accent-[var(--accent)]"
              />
              Gebruik forfaitair rendement (uit = werkelijk rendement)
            </span>
          </label>

          <label className={mobileFlow.getFieldClassName("year")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Belastingjaar
            </span>
            <input
              inputMode="numeric"
              value={formValues.year}
              onChange={(event) => updateField("year", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("year", Boolean(errors.year))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.year} />
          </label>

          <label className={mobileFlow.getFieldClassName("bankDeposits")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Banktegoeden / spaargeld
            </span>
            <input
              inputMode="decimal"
              value={formValues.bankDeposits}
              onChange={(event) => updateField("bankDeposits", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance(
                "bankDeposits",
                Boolean(errors.bankDeposits),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.bankDeposits} />
          </label>

          <label className={mobileFlow.getFieldClassName("investmentsAndOtherAssets")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Beleggingen / overige bezittingen
            </span>
            <input
              inputMode="decimal"
              value={formValues.investmentsAndOtherAssets}
              onChange={(event) =>
                updateField("investmentsAndOtherAssets", event.target.value)
              }
              onKeyDown={mobileFlow.handleEnterAdvance(
                "investmentsAndOtherAssets",
                Boolean(errors.investmentsAndOtherAssets),
              )}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.investmentsAndOtherAssets} />
          </label>

          <label className={mobileFlow.getFieldClassName("debts")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Box 3-schulden
            </span>
            <input
              inputMode="decimal"
              value={formValues.debts}
              onChange={(event) => updateField("debts", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("debts", Boolean(errors.debts))}
              className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
            />
            <FieldError message={errors.debts} />
          </label>

          <label className={mobileFlow.getFieldClassName("hasFiscalPartner")}>
            <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              Fiscale partner
            </span>
            <span className="flex items-center gap-3 text-[14px] text-[var(--ink)]">
              <input
                type="checkbox"
                checked={formValues.hasFiscalPartner}
                onChange={(event) => updateField("hasFiscalPartner", event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Ja, gebruik partner-vrijstelling
            </span>
          </label>

          {formValues.method === "actual" ? (
            <label className={mobileFlow.getFieldClassName("actualAnnualReturnRate")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                Snelle rendement-projectie (%) — leeg laten bij componenten
              </span>
              <input
                inputMode="decimal"
                value={formValues.actualAnnualReturnRate}
                onChange={(event) => updateField("actualAnnualReturnRate", event.target.value)}
                onKeyDown={mobileFlow.handleEnterAdvance(
                  "actualAnnualReturnRate",
                  Boolean(errors.actualAnnualReturnRate),
                )}
                className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none"
              />
              <FieldError message={errors.actualAnnualReturnRate} />
            </label>
          ) : null}

          {formValues.method === "actual" ? (
            <div className="grid gap-4 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
              <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
                Voor een inhoudelijker werkelijk-rendementsscenario kun je de echte inkomsten,
                waardeverandering en betaalde rente op box 3-schulden opgeven. Als je één component
                invult, wordt de percentage-projectie genegeerd.
              </p>
              <label className={mobileFlow.getFieldClassName("actualIncome")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Werkelijke inkomsten uit vermogen (€)
                </span>
                <input inputMode="decimal" value={formValues.actualIncome} onChange={(event) => updateField("actualIncome", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              </label>
              <label className={mobileFlow.getFieldClassName("actualValueChange")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Werkelijke waardeverandering (+/- €)
                </span>
                <input inputMode="decimal" value={formValues.actualValueChange} onChange={(event) => updateField("actualValueChange", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              </label>
              <label className={mobileFlow.getFieldClassName("actualDebtInterest")}>
                <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
                  Betaalde rente op box 3-schulden (€)
                </span>
                <input inputMode="decimal" value={formValues.actualDebtInterest} onChange={(event) => updateField("actualDebtInterest", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              </label>
            </div>
          ) : null}

          <div className="grid gap-4 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
            <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
              Vermogensplanning: geef de maandelijkse inleg per categorie op. De tool projecteert de groei per maand en rekent de eindpositie door naar Box 3.
            </p>
            <label className={mobileFlow.getFieldClassName("monthlyBankDepositsContribution")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Maandelijkse inleg bank/spaartegoeden (€)</span>
              <input inputMode="decimal" value={formValues.monthlyBankDepositsContribution} onChange={(event) => updateField("monthlyBankDepositsContribution", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              <FieldError message={errors.monthlyBankDepositsContribution} />
            </label>
            <label className={mobileFlow.getFieldClassName("monthlyInvestmentsContribution")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Maandelijkse inleg beleggingen/overige bezittingen (€)</span>
              <input inputMode="decimal" value={formValues.monthlyInvestmentsContribution} onChange={(event) => updateField("monthlyInvestmentsContribution", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              <FieldError message={errors.monthlyInvestmentsContribution} />
            </label>
            <label className={mobileFlow.getFieldClassName("expectedBankDepositsReturn")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Verwacht jaarlijks rendement sparen (%)</span>
              <input inputMode="decimal" value={formValues.expectedBankDepositsReturn} onChange={(event) => updateField("expectedBankDepositsReturn", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              <FieldError message={errors.expectedBankDepositsReturn} />
            </label>
            <label className={mobileFlow.getFieldClassName("expectedInvestmentsReturn")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Verwacht jaarlijks rendement beleggen (%)</span>
              <input inputMode="decimal" value={formValues.expectedInvestmentsReturn} onChange={(event) => updateField("expectedInvestmentsReturn", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              <FieldError message={errors.expectedInvestmentsReturn} />
            </label>
            <label className={mobileFlow.getFieldClassName("horizonYears")}>
              <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">Planningshorizon (jaar)</span>
              <input inputMode="numeric" value={formValues.horizonYears} onChange={(event) => updateField("horizonYears", event.target.value)} className="ring-focus hair h-12 rounded-md border bg-white px-4 font-mono text-[16px] tabular text-[var(--ink)] outline-none" />
              <FieldError message={errors.horizonYears} />
            </label>
          </div>

          <MobileFieldFlowControls
            current={mobileFlow.activeIndex + 1}
            total={mobileFlow.total}
            canGoPrev={mobileFlow.canGoPrev}
            canGoNext={mobileFlow.canGoNext && !isCurrentFieldBlocked}
            canComplete={Boolean(result)}
            onPrev={mobileFlow.goPrev}
            onNext={mobileFlow.goNext}
            onComplete={goToResult}
          />
        </div>
      </section>

      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        <div id="tool-result-summary" className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Beknopte samenvatting
            </div>
            {result ? <Pill tone="accent">{result.method === "actual" ? "Werkelijk" : "Forfaitair"}</Pill> : null}
          </div>
          {result ? (
            <>
              <div className="mt-4 font-serif text-[40px] leading-none tracking-[-0.03em]">
                {formatCurrency(result.box3Tax)}
              </div>
              <p className="mt-3 text-[14px] leading-[1.7] text-white/75">
                Indicatieve box 3-heffing in {result.year} op basis van je invoer.
              </p>
            </>
          ) : null}
        </div>

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">
              Resultaatdetails
            </h3>
            <div className="mt-5">
              <ResultRow label="Totaal bezittingen" value={formatCurrency(result.assetsTotal)} />
              <ResultRow label="Totaal schulden" value={formatCurrency(result.debtsTotal)} />
              <ResultRow label="Netto vermogen" value={formatCurrency(result.netWorth)} />
              <ResultRow
                label="Heffingsvrij vermogen"
                value={result.method === "actual" ? "Niet toegepast" : formatCurrency(result.taxFreeAllowance)}
                sub={result.method === "actual" ? "Bij werkelijk rendement geldt deze vrijstelling niet" : "Afhankelijk van single of fiscale partner"}
              />
              <ResultRow
                label="Belastbare grondslag"
                value={formatCurrency(result.taxableBase)}
              />
              <ResultRow
                label="Belastbaar (forfaitair/werkelijk) rendement"
                value={formatCurrency(result.taxableDeemedReturn)}
              />
              {result.method === "actual" ? (
                <ResultRow
                  label="Werkelijk rendement uit invoer"
                  value={formatCurrency(result.actualReturn)}
                  sub={result.actualReturnComponentsProvided ? "Inkomsten + waardeverandering − betaalde rente op schulden" : "Vereenvoudigde percentage-projectie"}
                />
              ) : null}
              <ResultRow
                label="Indicatieve box 3-heffing"
                value={formatCurrency(result.box3Tax)}
                accent
              />
              <ResultRow
                label="Effectieve druk op netto vermogen"
                value={`${formatPercent(result.effectiveTaxRateOnNetWorth)}%`}
              />
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h3 className="font-serif text-[24px] tracking-[-0.02em] text-[var(--ink)]">Vermogensplanning</h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              Maandelijkse inleg wordt aan het einde van elke maand toegevoegd. Dit is een scenario, geen gegarandeerde opbrengst.
            </p>
            <div className="mt-5">
              <ResultRow label="Totale maandelijkse inleg" value={formatCurrency(result.planning.totalMonthlyContribution)} />
              <ResultRow label="Totale inleg over horizon" value={formatCurrency(result.planning.totalContributions)} />
              <ResultRow label="Eindwaarde sparen" value={formatCurrency(result.planning.endingBankDeposits)} />
              <ResultRow label="Eindwaarde beleggen" value={formatCurrency(result.planning.endingInvestmentsAndOtherAssets)} />
              <ResultRow label={`Eindvermogen na ${result.planning.horizonYears} jaar`} value={formatCurrency(result.planning.endingTotalAssets)} accent />
              <ResultRow label="Indicatieve Box 3-heffing op eindpositie" value={formatCurrency(result.planning.endingBox3Tax)} />
            </div>
            <details className="mt-5 rounded-lg border border-[var(--hair)] p-4">
              <summary className="cursor-pointer text-[13px] font-medium text-[var(--ink)]">Jaaroverzicht uitklappen</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[12px] text-[var(--muted)]">
                  <thead><tr><th className="py-2 pr-3">Jaar</th><th className="py-2 pr-3">Sparen</th><th className="py-2 pr-3">Beleggen</th><th className="py-2 pr-3">Totaal</th><th className="py-2">Groei</th></tr></thead>
                  <tbody>{result.planning.points.map((point) => <tr key={point.yearIndex} className="border-t border-[var(--hair)]"><td className="py-2 pr-3">{point.yearIndex}</td><td className="py-2 pr-3">{formatCurrency(point.bankDeposits)}</td><td className="py-2 pr-3">{formatCurrency(point.investmentsAndOtherAssets)}</td><td className="py-2 pr-3">{formatCurrency(point.totalAssets)}</td><td className="py-2">{formatCurrency(point.growthThisYear)}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </div>
        ) : null}

        <ToolDisclosure
          title="Welke aannames gebruiken we?"
          subtitle="Bron, percentages en status van gebruikte box 3-aannames."
        >
          {result ? (
            <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
              <p>Bron: {result.meta.sourceLabel}</p>
              <p>Gecontroleerd op: {result.meta.lastChecked}</p>
              <p>Status: {result.meta.status}</p>
              <p>Box 3-tarief: {formatPercent(result.rates.taxRate)}%</p>
              <p>Forfait banktegoeden: {formatPercent(result.rates.deemedReturnBankDeposits)}%</p>
              <p>
                Forfait beleggingen/overige bezittingen:{" "}
                {formatPercent(result.rates.deemedReturnInvestments)}%
              </p>
              <p>Forfait schulden: {formatPercent(result.rates.deemedReturnDebts)}%</p>
            </div>
          ) : null}
        </ToolDisclosure>

        {result?.warnings?.length ? (
          <div className="rounded-[1.5rem] border border-[var(--hair)] bg-[var(--paper-soft)] p-5 text-[12.5px] leading-[1.6] text-[var(--muted)]">
            <ul className="space-y-2">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {result ? <WealthJourneyLinks current="box3" /> : null}
      </section>
    </CalculatorShell>
  );
}
