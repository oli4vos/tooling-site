"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { AreaChart, getAdaptiveEuroTicks } from "@/components/charts";
import { ChartContainer, ChartLegend } from "@/components/ChartPrimitives";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import {
  ResultTableDisclosure,
  ResultVisualization,
} from "@/components/ResultVisualization";
import { CalculatorShell } from "@/components/tool/CalculatorShell";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { CalculationResultActions } from "@/components/tool/CalculationResultActions";
import {
  ExampleValuesNotice,
  ResultContextNotice,
} from "@/components/tool/CalculationContextNotice";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { ToolHandoffNotice } from "@/components/tool/ToolHandoffNotice";
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { useToolHandoff } from "@/hooks/useToolHandoff";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getRepaymentRuleLabel } from "@/lib/copy-glossary";
import { getSparseYearTicks } from "@/lib/chart-utils";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
} from "@/lib/financial-constants";
import {
  createDuoDebtPartFormValue,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import { createProfilePrefillState } from "@/lib/profile-prefill";
import { getDuoExtraRepaymentDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { createStudentDebtProfilePatch } from "@/lib/profile-result-mapping";
import { getToolNextSteps } from "@/lib/tool-journeys";
import { mergeProfilePatch } from "@/lib/user-profile";
import {
  calculateDuoExtraRepaymentView,
  createDuoExtraRepaymentDefaultValues,
  createEmptyDuoExtraRepaymentValues,
  repaymentRuleOptions,
  type DuoExtraRepaymentFormValues,
} from "./logic";
import { downloadDuoExtraRepaymentPdfReport } from "./report";

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

type MoneyFieldProps = {
  id: keyof DuoExtraRepaymentFormValues;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  className?: string;
  onEnter?: (event: KeyboardEvent) => void;
  enterKeyHint?: "next" | "done";
  onChange: (value: string) => void;
};

function MoneyField({ id, label, value, error, hint, className, onEnter, enterKeyHint, onChange }: MoneyFieldProps) {
  return (
    <label
      className={`grid min-w-0 gap-2 ${className ?? ""}`.trim()}
      htmlFor={String(id)}
      data-mobile-flow-field={String(id)}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span className="text-right text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="hair flex min-h-12 items-center rounded-md border bg-white px-3">
        <span className="mr-2 text-[var(--muted)]">€</span>
        <input
          id={String(id)}
          inputMode="decimal"
          enterKeyHint={enterKeyHint}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          aria-invalid={error ? "true" : "false"}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
      </span>
      <FieldError message={error} />
    </label>
  );
}

type DuoExtraAflossenContentProps = {
  initialValues: DuoExtraRepaymentFormValues;
  hasRelevantProfileValues: boolean;
  handoff:
    | {
        sourceTitle: string;
        fieldLabels: string[];
      }
    | null;
};

export default function DuoExtraAflossenCalculator() {
  const { profile, hasProfile } = useUserProfile();
  const handoff = useToolHandoff("duo-extra-aflossen");
  const effectiveProfile = handoff
    ? mergeProfilePatch(profile, handoff.profilePatch)
    : profile;
  const profilePatch =
    getDuoExtraRepaymentDefaultsFromProfile(effectiveProfile);
  const { initialValues, profileKey, hasRelevantProfileValues } =
    createProfilePrefillState<DuoExtraRepaymentFormValues>({
      defaultValues: createEmptyDuoExtraRepaymentValues(),
      profilePatch,
      hasProfile: hasProfile || Boolean(handoff),
      profileUpdatedAt: profile.updatedAt,
    });

  return (
    <DuoExtraAflossenContent
      key={handoff ? `handoff-${handoff.transferId}` : profileKey}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      handoff={handoff}
    />
  );
}

function DuoExtraAflossenContent({
  initialValues,
  hasRelevantProfileValues,
  handoff,
}: DuoExtraAflossenContentProps) {
  const exampleValues = useMemo(
    () => createDuoExtraRepaymentDefaultValues(),
    [],
  );
  const [formValues, setFormValues] = useState<DuoExtraRepaymentFormValues>(
    initialValues,
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const view = useMemo(() => calculateDuoExtraRepaymentView(formValues), [formValues]);
  const isExample = JSON.stringify(formValues) === JSON.stringify(exampleValues);
  const nextSteps = getToolNextSteps("duo-extra-aflossen");
  const mobileFieldOrder = [
    "remainingDebt",
    "repaymentRule",
    ...(!formValues.useDebtParts ? ["duoRateYear"] : []),
    "oneTimeExtraRepayment",
    "monthlyExtraRepayment",
    "strategy",
  ];
  const mobileFlow = useMobileFieldFlow(mobileFieldOrder);

  function updateField<K extends keyof DuoExtraRepaymentFormValues>(
    field: K,
    value: DuoExtraRepaymentFormValues[K],
  ) {
    setShowResult(false);
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function updateDebtPart(
    id: string,
    field: keyof Pick<DuoDebtPartFormValue, "amount" | "rateYear">,
    value: string,
  ) {
    setShowResult(false);
    setFormValues((current) => ({
      ...current,
      debtParts: current.debtParts.map((part) =>
        part.id === id ? { ...part, [field]: value } : part,
      ),
    }));
  }

  function addDebtPart() {
    setShowResult(false);
    setFormValues((current) => ({
      ...current,
      debtParts: [...current.debtParts, createDuoDebtPartFormValue()],
    }));
  }

  function removeDebtPart(id: string) {
    setShowResult(false);
    setFormValues((current) => ({
      ...current,
      debtParts:
        current.debtParts.length > 1
          ? current.debtParts.filter((part) => part.id !== id)
          : current.debtParts,
    }));
  }

  async function handleDownloadPdf() {
    if (!view.isValid || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadDuoExtraRepaymentPdfReport(formValues, view);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function toggleDebtParts(enabled: boolean) {
    setShowResult(false);
    setFormValues((current) => {
      if (!enabled) {
        return { ...current, useDebtParts: false };
      }

      const nextParts =
        current.debtParts.length > 0
          ? current.debtParts
          : [createDuoDebtPartFormValue()];
      const firstPart = nextParts[0];

      return {
        ...current,
        useDebtParts: true,
        debtParts: nextParts.map((part, index) =>
          index === 0 && part.amount.trim().length === 0 && current.remainingDebt.trim().length > 0
            ? { ...part, amount: current.remainingDebt }
            : part,
        ),
        duoRateYear:
          current.duoRateYear.trim().length > 0
            ? current.duoRateYear
            : firstPart.rateYear,
      };
    });
  }

  function activeStepError() {
    return view.errors[mobileFlow.activeFieldId as keyof DuoExtraRepaymentFormValues];
  }

  function completeCalculation() {
    if (!view.isValid) return;
    setShowResult(true);
    requestAnimationFrame(() => {
      const target = document.getElementById("tool-result-summary");
      if (target instanceof HTMLElement) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function advanceMobileFlow() {
    mobileFlow.attemptAdvance({
      blocked: Boolean(activeStepError()),
      onComplete: completeCalculation,
    });
  }

  function visibleError(field: keyof DuoExtraRepaymentFormValues) {
    const value = formValues[field];
    const hasInput = typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    return mobileFlow.wasAttempted(String(field)) || hasInput ? view.errors[field] : undefined;
  }

  const inputs = (
    <div className="space-y-5">
      <MoneyField
        id="remainingDebt"
        label="Openstaande studieschuld"
        value={formValues.remainingDebt}
        error={visibleError("remainingDebt")}
        className={mobileFlow.getFieldClassName("remainingDebt")}
        enterKeyHint="next"
        onEnter={mobileFlow.handleEnterAdvance("remainingDebt", {
          blocked: Boolean(view.errors.remainingDebt),
        })}
        hint={
          formValues.useDebtParts
            ? "Wordt overschreven door leningdelen"
            : "Bedrag bij DUO"
        }
        onChange={(value) => updateField("remainingDebt", value)}
      />

      <label {...mobileFlow.getFieldProps("repaymentRule")} htmlFor="repaymentRule">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Hoe lang heb je om terug te betalen?
        </span>
        <select
          id="repaymentRule"
          value={formValues.repaymentRule}
          onChange={(event) =>
            updateField("repaymentRule", event.target.value as DuoExtraRepaymentFormValues["repaymentRule"])
          }
          className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
          aria-invalid={view.errors.repaymentRule ? "true" : "false"}
          aria-describedby="repaymentRule-hint repaymentRule-error"
        >
          {repaymentRuleOptions.map((option) => (
            <option key={option} value={option}>
              {getRepaymentRuleLabel(option)}
            </option>
          ))}
        </select>
        <p id="repaymentRule-hint" className="text-[12px] leading-[1.5] text-[var(--soft)]">
          In Mijn DUO staat bij Mijn schulden of je onder SF35 of SF15 terugbetaalt.
        </p>
        <FieldError id="repaymentRule-error" message={view.errors.repaymentRule} />
      </label>

      {!formValues.useDebtParts ? (
        <label {...mobileFlow.getFieldProps("duoRateYear")} htmlFor="duoRateYear">
          <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
            Jouw DUO-rentepercentage
          </span>
          <select
            id="duoRateYear"
            value={formValues.duoRateYear}
            onChange={(event) => updateField("duoRateYear", event.target.value)}
            className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
          >
            {getAvailableDuoRateYears().map((year) => (
              <option key={year} value={year}>
                {formatDuoRateYearLabel(year, formValues.repaymentRule)}
              </option>
            ))}
          </select>
          <p className="text-[12px] leading-[1.5] text-[var(--soft)]">
            Bekijk je rentepercentage in Mijn DUO bij Mijn schulden en kies hier het
            bijbehorende jaar.
          </p>
          <FieldError message={view.errors.duoRateYear} />
        </label>
      ) : null}

      <DisclosureSection
        title="Nauwkeuriger rekenen (optioneel)"
        subtitle="Vul alleen je huidige termijn of losse leningdelen in als je die precies weet."
      >
        <MoneyField
          id="currentMonthlyPayment"
          label="Huidige maandtermijn"
          value={formValues.currentMonthlyPayment}
          error={visibleError("currentMonthlyPayment")}
          hint="Laat leeg om het wettelijke bedrag te gebruiken"
          onChange={(value) => updateField("currentMonthlyPayment", value)}
        />
        <DuoDebtPartsEditor
          enabled={formValues.useDebtParts}
          embedded
          parts={formValues.debtParts}
          totalDebt={view.debtPartsTotal}
          errorsById={view.debtPartErrors}
          repaymentRule={formValues.repaymentRule}
          onToggle={toggleDebtParts}
          onPartChange={updateDebtPart}
          onAddPart={addDebtPart}
          onRemovePart={removeDebtPart}
        />
        <FieldError message={view.errors.debtParts} />
      </DisclosureSection>
      <MoneyField
        id="oneTimeExtraRepayment"
        label="Eenmalig extra aflossen"
        value={formValues.oneTimeExtraRepayment}
        error={visibleError("oneTimeExtraRepayment")}
        className={mobileFlow.getFieldClassName("oneTimeExtraRepayment")}
        enterKeyHint="next"
        onEnter={mobileFlow.handleEnterAdvance("oneTimeExtraRepayment", {
          blocked: Boolean(view.errors.oneTimeExtraRepayment),
        })}
        onChange={(value) => updateField("oneTimeExtraRepayment", value)}
      />
      <MoneyField
        id="monthlyExtraRepayment"
        label="Extra per maand"
        value={formValues.monthlyExtraRepayment}
        error={visibleError("monthlyExtraRepayment")}
        className={mobileFlow.getFieldClassName("monthlyExtraRepayment")}
        enterKeyHint="next"
        onEnter={mobileFlow.handleEnterAdvance("monthlyExtraRepayment", {
          blocked: Boolean(view.errors.monthlyExtraRepayment),
        })}
        onChange={(value) => updateField("monthlyExtraRepayment", value)}
      />

      <label {...mobileFlow.getFieldProps("strategy")} htmlFor="strategy">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Strategie
        </span>
        <select
          id="strategy"
          value={formValues.strategy}
          onChange={(event) =>
            updateField("strategy", event.target.value as DuoExtraRepaymentFormValues["strategy"])
          }
          className="ring-focus hair h-12 rounded-md border bg-white px-3 text-[15px] text-[var(--ink)] outline-none"
        >
          <option value="shortenTerm">Maandbedrag gelijk, kortere looptijd</option>
          <option value="lowerMonthlyPayment">Lagere maandlast</option>
        </select>
      </label>

      {handoff ? (
        <ToolHandoffNotice
          sourceTitle={handoff.sourceTitle}
          fieldLabels={handoff.fieldLabels}
        />
      ) : null}
      {hasRelevantProfileValues && !handoff ? (
        <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
          Je studieschuldgegevens zijn ingevuld vanuit je profiel. Controleer ze
          voordat je berekent.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ToolActionButton
          type="button"
          onClick={() => {
            setFormValues(exampleValues);
            setShowResult(false);
            mobileFlow.resetToFirst();
          }}
        >
          Voorbeeld invullen
        </ToolActionButton>
      </div>
      {isExample ? <ExampleValuesNotice /> : null}
      {!showResult ? (
        <MobileFieldFlowControls
          current={mobileFlow.activeIndex + 1}
          total={mobileFlow.total}
          canGoPrev={mobileFlow.canGoPrev}
          canGoNext={mobileFlow.canGoNext}
          canComplete
          dockToViewport
          onPrev={mobileFlow.goPrev}
          onNext={advanceMobileFlow}
          onComplete={advanceMobileFlow}
        />
      ) : null}
    </div>
  );

  const result = showResult && view.isValid ? (
    <div id="tool-result-summary" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard
          label="Nieuwe verplichte maandtermijn"
          value={formatCurrency(view.result.newRequiredMonthlyPayment)}
          note={
            view.result.payoffImpact.strategy === "lowerMonthlyPayment"
              ? "Bij strategie lagere maandlast."
              : "Bij kortere looptijd blijft de termijn gelijk."
          }
          className="sm:col-span-2"
        />
        <ResultCard
          label="Eerder schuldenvrij"
          value={
            view.result.payoffImpact.monthsSaved > 0
              ? `${view.result.payoffImpact.monthsSaved} maanden`
              : "Niet eerder"
          }
          note={
            view.result.timelineAfter.payoffDate
              ? `Nieuwe einddatum: ${view.result.timelineAfter.payoffDate}.`
              : "Er is in deze berekening geen betrouwbare nieuwe einddatum."
          }
          tone={view.result.payoffImpact.monthsSaved > 0 ? "pos" : "default"}
        />
        <ResultCard
          label="Indicatieve rentebesparing"
          value={formatCurrency(view.result.interestSaved)}
          note="Verschil in rente over de resterende looptijd in deze projectie."
          tone="pos"
        />
      </div>
      <ResultContextNotice kind="duo" isExample={isExample} />
      <ToolNextSteps
        {...nextSteps}
        handoff={{
          sourceTool: "duo-extra-aflossen",
          profilePatch: createStudentDebtProfilePatch({
            remainingDebt: view.result.newRemainingDebt,
            statutoryMonthlyPayment:
              view.result.newRequiredMonthlyPayment,
            mortgageAssessmentMonthlyPayment:
              view.result.newRequiredMonthlyPayment,
            repaymentRule: view.result.repaymentRule,
            duoInterestRate: view.annualInterestRate,
            duoRateYear: view.duoRateYear,
            remainingTermYears: view.result.remainingTermYearsUsed,
            currentMonthlyPayment:
              view.result.effectiveNewMonthlyPayment,
          }),
          fieldLabels: [
            "schuld na eenmalige aflossing",
            "nieuw maandbedrag",
            "terugbetalingsregel",
            "DUO-rente",
          ],
        }}
      />
      <CalculationResultActions
        onEdit={() => {
          setShowResult(false);
          mobileFlow.goToFirst();
        }}
        onRestart={() => {
          setFormValues(createEmptyDuoExtraRepaymentValues());
          setShowResult(false);
          mobileFlow.resetToFirst();
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download overzicht"}
        </ToolActionButton>
      </div>

      <DisclosureSection
        title="Volledige berekening"
        subtitle="Bekijk bedragen, looptijd en de gebruikte schuldgegevens."
      >
        <div>
          <ResultRow label="Gekozen rentejaar" value={String(view.duoRateYear)} />
          <ResultRow
            label="Gemiddelde rente over je leningdelen"
            value={`${formatPercent(view.annualInterestRate)}%`}
          />
          <ResultRow
            label="Wettelijke maandtermijn nu"
            value={formatCurrency(view.statutoryMonthlyPayment)}
            sub={`${view.termYears} jaar resterende looptijd in deze indicatie.`}
          />
          {view.debtPortfolio.usesDebtParts ? (
            <ResultRow
              label="Leningdelen"
              value={`${view.debtPortfolio.parts.length} delen`}
              sub="Extra aflossen gaat eerst naar het deel met de hoogste rente."
            />
          ) : null}
          <ResultRow
            label="Eenmalig extra bedrag gebruikt"
            value={formatCurrency(view.result.extraRepaymentUsed)}
          />
          <ResultRow
            label="Extra maandbedrag"
            value={formatCurrency(view.result.extraMonthlyAmountUsed)}
          />
          <ResultRow
            label="Nieuwe resterende schuld na eenmalige aflossing"
            value={formatCurrency(view.result.newRemainingDebt)}
          />
          <ResultRow
            label="Verwachte einddatum zonder extra aflossen"
            value={view.result.timelineBefore.payoffDate ?? "Niet te bepalen"}
          />
          <ResultRow
            label="Nieuwe einddatum"
            value={view.result.timelineAfter.payoffDate ?? "Onzeker"}
            sub={
              view.result.payoffImpact.monthsSaved > 0
                ? `${view.result.payoffImpact.monthsSaved} maanden eerder in deze indicatie.`
                : "Geen eerdere einddatum in deze indicatie."
            }
            strong
          />
        </div>
      </DisclosureSection>

      {view.chart.labels.length > 1 ? (
        <ResultVisualization
          title="Je schuld vóór en na extra aflossen"
          description="De lijnen maken zichtbaar hoeveel sneller je schuld daalt. De tabel eronder bevat de exacte jaarbedragen."
        >
          <figure>
            <ChartContainer
              className="overflow-hidden"
              xValues={view.chart.labels.map(Number)}
              yearTicks={getSparseYearTicks(view.chart.labels.map(Number), 4)}
              tickPrefix=""
              chart={
                <div className="space-y-3">
                  <AreaChart
                    series={[
                      { color: "oklch(50% 0.08 250)", points: view.chart.before },
                      { color: "oklch(52% 0.10 150)", points: view.chart.after },
                    ]}
                    seriesLabels={["Voor extra aflossen", "Na extra aflossen"]}
                    xValues={view.chart.labels.map(Number)}
                    yTicks={getAdaptiveEuroTicks(
                      Math.max(...view.chart.before, ...view.chart.after),
                    )}
                    ariaLabel="Resterende studieschuld vóór en na extra aflossen per jaar. De exacte bedragen staan in de tabel onder de grafiek."
                  />
                  <ChartLegend
                    items={[
                      { label: "Voor extra aflossen", color: "oklch(50% 0.08 250)" },
                      { label: "Na extra aflossen", color: "oklch(52% 0.10 150)" },
                    ]}
                  />
                </div>
              }
            />
            <figcaption className="sr-only">
              Resterende studieschuld per jaar vóór en na extra aflossen. De exacte bedragen staan in de uitklapbare tabel onder de grafiek.
            </figcaption>
          </figure>
          <ResultTableDisclosure
            title="Bekijk de schuld per jaar"
            caption="Resterende studieschuld per jaar vóór en na extra aflossen."
            columns={[
              { key: "year", label: "Jaar" },
              { key: "before", label: "Zonder extra", align: "right" },
              { key: "after", label: "Met extra", align: "right" },
              { key: "difference", label: "Verschil", align: "right" },
            ]}
            rows={view.chart.labels.map((label, index) => ({
              key: label,
              cells: {
                year: label,
                before: formatCurrency(view.chart.before[index] ?? 0),
                after: formatCurrency(view.chart.after[index] ?? 0),
                difference: formatCurrency(
                  Math.max(
                    (view.chart.before[index] ?? 0) - (view.chart.after[index] ?? 0),
                    0,
                  ),
                ),
              },
            }))}
          />
        </ResultVisualization>
      ) : null}
    </div>
  ) : (
    <section id="tool-result-summary" className="surface-panel p-5">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Nog geen berekening
      </h2>
      <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
        Vul je schuld, concrete terugbetalingsregel en extra aflossing in. Daarna
        zie je het effect op maandbedrag, rente en einddatum.
      </p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Wat doet extra aflossen?
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bekijk feitelijk wat een eenmalige of maandelijkse extra DUO-aflossing
            doet met je maandtermijn, einddatum en rentelast. Je wettelijke
            maandbedrag blijft de basis; alles daarboven is vrijwillig extra
            aflossen.
          </p>
        </>
      }
      inputs={inputs}
      submitAction={
        <div className="hidden md:block">
          <ToolActionButton type="button" variant="submit" size="md" full onClick={completeCalculation} disabled={!view.isValid}>
            Bereken
          </ToolActionButton>
        </div>
      }
      result={result}
      details={
        view.isValid ? (
          <div className="space-y-4">
            <DisclosureSection title="Aannames">
              <ul className="list-disc space-y-2 pl-5 text-[13px] leading-[1.7] text-[var(--muted)]">
                <li>Gebruikte normversie: {view.normVersion}.</li>
                <li>
                  Rentejaar {view.duoRateYear} met een gemiddelde rente van {formatPercent(view.annualInterestRate)}%;
                  resterende looptijd: {view.termYears} jaar.
                </li>
                <li>Vervroegd aflossen bij DUO is boetevrij.</li>
                {view.result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </DisclosureSection>
            {view.debtPortfolio.usesDebtParts ? (
              <DisclosureSection title="Gebruikte leningdelen">
                <div className="space-y-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                  {view.debtPortfolio.parts.map((part) => (
                    <ResultRow
                      key={part.key}
                      label={part.label}
                      value={formatCurrency(part.remainingDebt)}
                      sub={`${part.rateYear} • ${formatPercent(part.annualInterestRate)}% • ${formatCurrency(part.statutoryMonthlyPayment)} p/m`}
                    />
                  ))}
                </div>
              </DisclosureSection>
            ) : null}
          </div>
        ) : null
      }
      disclaimer={
        <p className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Puur informatieve DUO-indicatie. Geen advies en geen persoonlijke
          keuzehulp. Het wettelijke maandbedrag is verplicht; extra aflossen
          is vrijwillig. Controleer wijzigingen altijd in Mijn DUO.
        </p>
      }
    />
  );
}
