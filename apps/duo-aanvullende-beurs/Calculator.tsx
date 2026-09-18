"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import {
  HorizontalBarChart,
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
import { ToolNextSteps } from "@/components/tool/ToolNextSteps";
import { useSubmittedCalculation } from "@/hooks/useSubmittedCalculation";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import { getToolNextSteps } from "@/lib/tool-journeys";
import {
  createAdditionalGrantView,
  defaultValues,
  emptyValues,
  getAdditionalGrantSpecialCaseGuidance,
  validateAdditionalGrantForm,
  type AdditionalGrantFormValues,
} from "./logic";

type FieldProps = {
  id: keyof AdditionalGrantFormValues;
  label: string;
  value: string;
  error?: string;
  prefix?: string;
  hint?: string;
  inputMode?: "decimal" | "numeric" | "text";
  className?: string;
  onEnter?: (event: KeyboardEvent) => void;
  enterKeyHint?: "next" | "done";
  onChange: (value: string) => void;
};

function FieldShell({
  children,
  className,
  fieldId,
}: {
  children: ReactNode;
  className?: string;
  fieldId?: string;
}) {
  return (
    <div
      className={`additional-grant-field grid min-w-0 content-start gap-2 ${className ?? ""}`.trim()}
      data-mobile-flow-field={fieldId}
    >
      {children}
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="additional-grant-field-label text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
    >
      {children}
    </label>
  );
}

function MoneyField({
  id,
  label,
  value,
  error,
  prefix = "€",
  hint,
  inputMode = "decimal",
  className,
  onEnter,
  enterKeyHint,
  onChange,
}: FieldProps) {
  const errorId = `${String(id)}-error`;
  const hintId = `${String(id)}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldShell className={className} fieldId={String(id)}>
      <Label htmlFor={String(id)}>{label}</Label>
      <span className="field-shell flex min-h-12 w-full min-w-0 items-center px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={String(id)}
          value={value}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
      </span>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
      <div id={errorId}>
        <FieldError message={error} />
      </div>
    </FieldShell>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  error,
  hint,
  className,
  onChange,
}: {
  id: keyof AdditionalGrantFormValues;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  error?: string;
  hint?: string;
  className?: string;
  onChange: (value: T) => void;
}) {
  const errorId = `${String(id)}-error`;
  const hintId = `${String(id)}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldShell className={className} fieldId={String(id)}>
      <Label htmlFor={String(id)}>{label}</Label>
      <select
        id={String(id)}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="field-shell ring-focus h-12 w-full min-w-0 px-3 text-[15px] text-[var(--ink)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-[12px] leading-[1.5] text-[var(--soft)]">
          {hint}
        </p>
      ) : null}
      <div id={errorId}>
        <FieldError message={error} />
      </div>
    </FieldShell>
  );
}

function BulletList({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
        {title}
      </h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-[1.6] text-[var(--ink-2)]">
        {[...new Set(items)].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DuoAanvullendeBeursCalculator() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [didSubmitAttempt, setDidSubmitAttempt] = useState(false);
  const [mobileFlowActive, setMobileFlowActive] = useState(true);
  const {
    formValues,
    setFormValues,
    submittedValues,
    submit,
    hasDirtyChanges,
    replaceValues,
    reset,
  } = useSubmittedCalculation<AdditionalGrantFormValues>(emptyValues);
  const errors = validateAdditionalGrantForm(formValues);
  const submittedView = useMemo(
    () => (submittedValues ? createAdditionalGrantView(submittedValues) : null),
    [submittedValues],
  );
  const nextSteps = getToolNextSteps("duo-aanvullende-beurs");
  const hasErrors = Object.keys(errors).length > 0;
  const hasTwoParents = formValues.familySituation === "two-parents";
  const isMbo = formValues.educationType === "mbo-1-2" || formValues.educationType === "mbo-3-4";
  const specialCaseGuidance = getAdditionalGrantSpecialCaseGuidance(
    formValues.specialCase,
  );
  const mobileFieldOrder = [
    "educationType",
    "residence",
    ...(isMbo ? ["calculationMonth", "tuitionDue"] : []),
    "specialCase",
    ...(!specialCaseGuidance
      ? ["familySituation", "parent1IncomeGroup", ...(hasTwoParents ? ["parent2IncomeGroup"] : [])]
      : []),
  ];
  const mobileFlow = useMobileFieldFlow(mobileFieldOrder);
  const isExampleInput =
    JSON.stringify(formValues) === JSON.stringify(defaultValues);
  const isExampleResult =
    submittedValues !== null &&
    JSON.stringify(submittedValues) === JSON.stringify(defaultValues);
  const submittedSpecialCaseGuidance = submittedValues
    ? getAdditionalGrantSpecialCaseGuidance(submittedValues.specialCase)
    : null;

  useEffect(() => {
    if (submittedView?.isValid) {
      resultRef.current?.focus();
    }
  }, [submittedView]);

  function updateField<K extends keyof AdditionalGrantFormValues>(
    field: K,
    value: AdditionalGrantFormValues[K],
  ) {
    setMobileFlowActive(true);
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    setDidSubmitAttempt(true);
    if (hasErrors) {
      document.getElementById("aanvullende-beurs-errors")?.focus();
      return;
    }
    setMobileFlowActive(false);
    submit();
  }

  function fieldError(field: keyof AdditionalGrantFormValues) {
    const value = formValues[field];
    const hasInput = typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    return didSubmitAttempt || mobileFlow.wasAttempted(String(field)) || hasInput
      ? errors[field]
      : undefined;
  }

  const activeStepError = (() => {
    if (mobileFlow.activeFieldId === "parent1IncomeGroup") {
      return errors.parent1Income || errors.parent1IncomeReliability;
    }
    if (mobileFlow.activeFieldId === "parent2IncomeGroup") {
      return errors.parent2Income || errors.parent2IncomeReliability;
    }
    return errors[mobileFlow.activeFieldId as keyof AdditionalGrantFormValues];
  })();

  function advanceMobileFlow() {
    mobileFlow.attemptAdvance({
      blocked: Boolean(activeStepError),
      onComplete: handleSubmit,
    });
  }

  const studyStepVisible = ["educationType", "residence", "calculationMonth", "tuitionDue"].some(
    (field) => mobileFlow.isActiveField(field),
  );
  const parentStepVisible = [
    "specialCase",
    "familySituation",
    "parent1IncomeGroup",
    "parent2IncomeGroup",
  ].some((field) => mobileFlow.isActiveField(field));

  const inputs = (
    <div className="additional-grant-form space-y-6">
      {didSubmitAttempt && hasErrors ? (
        <div
          id="aanvullende-beurs-errors"
          tabIndex={-1}
          className="rounded-xl border border-[var(--neg-soft)] bg-[var(--neg-soft)]/55 px-4 py-3 text-sm text-[oklch(35%_0.13_28)]"
        >
          Vul de ontbrekende concrete gegevens aan. De berekening gebruikt geen “weet ik niet”
          als eindinvoer.
        </div>
      ) : null}

      <section
        className={`${studyStepVisible ? "space-y-4" : "hidden"} md:block md:space-y-4`}
        aria-labelledby="duo-additional-study-heading"
      >
        <h3 id="duo-additional-study-heading" className="font-serif text-[23px] text-[var(--ink)]">
          Studie en woonsituatie
        </h3>
        <div className="additional-grant-responsive-grid">
          <SelectField
            id="educationType"
            label="Opleiding"
            value={formValues.educationType}
            error={fieldError("educationType")}
            className={mobileFlow.getFieldClassName("educationType")}
            options={[
              { value: "", label: "Kies opleiding" },
              { value: "mbo-1-2", label: "Mbo niveau 1 of 2" },
              { value: "mbo-3-4", label: "Mbo niveau 3 of 4" },
              { value: "hbo", label: "Hbo" },
              { value: "university", label: "Universiteit" },
            ]}
            onChange={(value) => updateField("educationType", value)}
          />
          <SelectField
            id="residence"
            label="Woonsituatie volgens DUO"
            value={formValues.residence}
            error={fieldError("residence")}
            className={mobileFlow.getFieldClassName("residence")}
            options={[
              { value: "", label: "Kies woonsituatie" },
              { value: "living-at-home", label: "Thuiswonend" },
              { value: "living-away", label: "Uitwonend" },
            ]}
            onChange={(value) => updateField("residence", value)}
          />
          {isMbo ? (
            <>
              <MoneyField
                id="calculationMonth"
                label="Maandnummer in 2026"
                value={formValues.calculationMonth}
                error={fieldError("calculationMonth")}
                prefix=""
                inputMode="numeric"
                enterKeyHint="next"
                onEnter={mobileFlow.handleEnterAdvance("calculationMonth", {
                  blocked: Boolean(errors.calculationMonth),
                })}
                className={mobileFlow.getFieldClassName("calculationMonth")}
                hint="De berekening ondersteunt de gecontroleerde mbo-periode."
                onChange={(value) => updateField("calculationMonth", value)}
              />
              <SelectField
                id="tuitionDue"
                label="Lesgeldplichtig?"
                value={formValues.tuitionDue}
                className={mobileFlow.getFieldClassName("tuitionDue")}
                options={[
                  { value: "yes", label: "Ja" },
                  { value: "no", label: "Nee, bijzondere situatie" },
                ]}
                onChange={(value) => updateField("tuitionDue", value)}
              />
            </>
          ) : null}
        </div>
      </section>

      <section
        className={`${parentStepVisible ? "space-y-4" : "hidden"} md:block md:space-y-4`}
        aria-labelledby="duo-additional-parents-heading"
      >
        <h3 id="duo-additional-parents-heading" className="font-serif text-[23px] text-[var(--ink)]">
          Ouderinkomen
        </h3>
        <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
          Voor aanvullende beurs in 2026 gebruikt DUO normaal ouderinkomen uit 2024:
          verzamelinkomen uit de definitieve aanslag, of belastbaar loon als er geen aangifte is.
        </p>
        <div className="grid gap-4">
          <SelectField
            id="specialCase"
            label="Bijzondere oudersituatie?"
            value={formValues.specialCase}
            className={mobileFlow.getFieldClassName("specialCase")}
            options={[
              { value: "none", label: "Nee, reguliere berekening" },
              { value: "parent-deceased", label: "Ouder overleden" },
              { value: "parent-unknown", label: "Ouder onbekend" },
              { value: "parent-abroad", label: "Ouder in het buitenland" },
              { value: "parent-ignored", label: "Ouder buiten beschouwing" },
              { value: "no-contact-or-conflict", label: "Geen contact of conflict" },
            ]}
            onChange={(value) => updateField("specialCase", value)}
          />
          {specialCaseGuidance ? (
            <div className="surface-subtle space-y-3 p-4 sm:col-span-2">
              <h4 className="font-serif text-lg text-[var(--ink)]">
                {specialCaseGuidance.title}
              </h4>
              <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
                {specialCaseGuidance.explanation}
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-[1.6] text-[var(--ink-2)]">
                {specialCaseGuidance.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href={specialCaseGuidance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-link ring-focus inline-flex min-h-11 items-center text-[13px] font-medium text-[var(--ink)] underline underline-offset-4"
              >
                {specialCaseGuidance.sourceLabel}
                <span className="sr-only"> (opent extern)</span>
              </a>
            </div>
          ) : (
            <>
              <SelectField
                id="familySituation"
                label="Hoeveel ouders tellen mee?"
                value={formValues.familySituation}
                error={fieldError("familySituation")}
                className={mobileFlow.getFieldClassName("familySituation")}
                options={[
                  { value: "", label: "Kies aantal ouders" },
                  { value: "single-parent", label: "Eén ouder" },
                  { value: "two-parents", label: "Twee ouders" },
                ]}
                onChange={(value) => updateField("familySituation", value)}
              />
              <div className="grid gap-4">
                <fieldset
                  data-parent-income-group="1"
                  data-mobile-flow-field="parent1IncomeGroup"
                  className={`${mobileFlow.getFieldClassName("parent1IncomeGroup")} min-w-0 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4`}
                >
                  <legend className="px-1 text-[13px] font-semibold text-[var(--ink)]">
                    Inkomen ouder 1
                  </legend>
                  <div className="additional-grant-responsive-grid mt-1">
                    <MoneyField
                      id="parent1Income"
                      label="Ouderinkomen 2024"
                      value={formValues.parent1Income}
                      error={fieldError("parent1Income")}
                      hint="Verzamelinkomen op de definitieve aanslag 2024; anders belastbaar loon"
                      enterKeyHint={hasTwoParents ? "next" : "done"}
                      onEnter={mobileFlow.handleEnterAdvance("parent1IncomeGroup", {
                        blocked: Boolean(errors.parent1Income || errors.parent1IncomeReliability),
                        onComplete: handleSubmit,
                      })}
                      onChange={(value) => updateField("parent1Income", value)}
                    />
                    <SelectField
                      id="parent1IncomeReliability"
                      label="Status inkomen"
                      value={formValues.parent1IncomeReliability}
                      hint="Definitief = vastgesteld op de aanslag; anders kies je Schatting"
                      options={[
                        { value: "final", label: "Definitief" },
                        { value: "estimated", label: "Schatting" },
                      ]}
                      onChange={(value) =>
                        updateField("parent1IncomeReliability", value)
                      }
                    />
                  </div>
                </fieldset>
                {hasTwoParents ? (
                  <fieldset
                    data-parent-income-group="2"
                    data-mobile-flow-field="parent2IncomeGroup"
                    className={`${mobileFlow.getFieldClassName("parent2IncomeGroup")} min-w-0 rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4`}
                  >
                    <legend className="px-1 text-[13px] font-semibold text-[var(--ink)]">
                      Inkomen ouder 2
                    </legend>
                    <div className="additional-grant-responsive-grid mt-1">
                  <MoneyField
                    id="parent2Income"
                    label="Ouderinkomen 2024"
                    value={formValues.parent2Income}
                    error={fieldError("parent2Income")}
                    hint="Verzamelinkomen op de definitieve aanslag 2024; anders belastbaar loon"
                    enterKeyHint="done"
                    onEnter={mobileFlow.handleEnterAdvance("parent2IncomeGroup", {
                      blocked: Boolean(errors.parent2Income || errors.parent2IncomeReliability),
                      onComplete: handleSubmit,
                    })}
                    onChange={(value) => updateField("parent2Income", value)}
                  />
                  <SelectField
                    id="parent2IncomeReliability"
                    label="Status inkomen"
                    value={formValues.parent2IncomeReliability}
                    hint="Definitief = vastgesteld op de aanslag; anders kies je Schatting"
                    options={[
                      { value: "final", label: "Definitief" },
                      { value: "estimated", label: "Schatting" },
                    ]}
                    onChange={(value) =>
                      updateField("parent2IncomeReliability", value)
                    }
                  />
                    </div>
                  </fieldset>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      {!specialCaseGuidance ? (
        <div className={`${mobileFlow.isActiveField(hasTwoParents ? "parent2IncomeGroup" : "parent1IncomeGroup") ? "block" : "hidden"} md:block`}>
        <DisclosureSection title="Aftrekposten en broers of zussen">
          <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
            Laat deze velden leeg als ze niet spelen. De berekening gebruikt ze alleen als je
            concrete waarden invult.
          </p>
          <div className="mt-4 grid gap-4">
            <fieldset
              data-parent-deductions-group="1"
              className="min-w-0 rounded-xl border border-[var(--hair)] bg-white p-4"
            >
              <legend className="px-1 text-[13px] font-semibold text-[var(--ink)]">
                Ouder 1
              </legend>
              <div className="additional-grant-responsive-grid mt-1">
                <MoneyField
                  id="parent1AnnualDuoRepaymentTerms"
                  label="DUO-termijnen per jaar"
                  value={formValues.parent1AnnualDuoRepaymentTerms}
                  error={errors.parent1AnnualDuoRepaymentTerms}
                  onChange={(value) => updateField("parent1AnnualDuoRepaymentTerms", value)}
                />
                <MoneyField
                  id="parent1OtherQualifyingChildren"
                  label="Andere kwalificerende kinderen"
                  value={formValues.parent1OtherQualifyingChildren}
                  error={errors.parent1OtherQualifyingChildren}
                  prefix=""
                  inputMode="numeric"
                  onChange={(value) => updateField("parent1OtherQualifyingChildren", value)}
                />
                <MoneyField
                  id="parent1ChildrenWithAdditionalGrant"
                  label="Kinderen met aanvullende beurs"
                  value={formValues.parent1ChildrenWithAdditionalGrant}
                  error={errors.parent1ChildrenWithAdditionalGrant}
                  prefix=""
                  inputMode="numeric"
                  onChange={(value) => updateField("parent1ChildrenWithAdditionalGrant", value)}
                />
              </div>
            </fieldset>
            {hasTwoParents ? (
              <fieldset
                data-parent-deductions-group="2"
                className="min-w-0 rounded-xl border border-[var(--hair)] bg-white p-4"
              >
                <legend className="px-1 text-[13px] font-semibold text-[var(--ink)]">
                  Ouder 2
                </legend>
                <div className="additional-grant-responsive-grid mt-1">
                  <MoneyField
                    id="parent2AnnualDuoRepaymentTerms"
                    label="DUO-termijnen per jaar"
                    value={formValues.parent2AnnualDuoRepaymentTerms}
                    error={errors.parent2AnnualDuoRepaymentTerms}
                    onChange={(value) => updateField("parent2AnnualDuoRepaymentTerms", value)}
                  />
                  <MoneyField
                    id="parent2OtherQualifyingChildren"
                    label="Andere kwalificerende kinderen"
                    value={formValues.parent2OtherQualifyingChildren}
                    error={errors.parent2OtherQualifyingChildren}
                    prefix=""
                    inputMode="numeric"
                    onChange={(value) => updateField("parent2OtherQualifyingChildren", value)}
                  />
                  <MoneyField
                    id="parent2ChildrenWithAdditionalGrant"
                    label="Kinderen met aanvullende beurs"
                    value={formValues.parent2ChildrenWithAdditionalGrant}
                    error={errors.parent2ChildrenWithAdditionalGrant}
                    prefix=""
                    inputMode="numeric"
                    onChange={(value) => updateField("parent2ChildrenWithAdditionalGrant", value)}
                  />
                </div>
              </fieldset>
            ) : null}
          </div>
        </DisclosureSection>
        </div>
      ) : null}
      {mobileFlowActive ? (
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

  const result = submittedView?.isValid ? (
    <div
      ref={resultRef}
      id="tool-result-summary"
      tabIndex={-1}
      className="space-y-5 outline-none"
      aria-live="polite"
    >
      <section className="surface-panel p-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
          {submittedView.statusLabel}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-[var(--ink)]">
          {submittedSpecialCaseGuidance?.title ?? submittedView.conclusion}
        </h3>
        {submittedSpecialCaseGuidance ? (
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--muted)]">
            {submittedSpecialCaseGuidance.explanation}
          </p>
        ) : null}
      </section>
      {submittedSpecialCaseGuidance ? (
        <section className="surface-panel space-y-4 p-5">
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">Wat je nu kunt doen</h3>
          <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-[1.65] text-[var(--ink-2)]">
            {submittedSpecialCaseGuidance.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <a
            href={submittedSpecialCaseGuidance.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-link ring-focus inline-flex min-h-11 items-center text-[13px] font-medium text-[var(--ink)] underline underline-offset-4"
          >
            {submittedSpecialCaseGuidance.sourceLabel}
            <span className="sr-only"> (opent extern)</span>
          </a>
        </section>
      ) : (
        <div className="grid gap-3">
          <ResultCard
            label="Aanvullende beurs per maand"
            value={submittedView.monthlyGrantLabel}
            tone={submittedView.result.status === "calculated" ? "pos" : "warn"}
          />
        </div>
      )}
      {!submittedSpecialCaseGuidance &&
      submittedView.result.estimatedMonthlyGrant !== undefined &&
      submittedView.result.appliedMaximumMonthlyGrant !== undefined &&
      submittedView.result.appliedMaximumMonthlyGrant > 0 ? (
        <ResultVisualization
          title="Zo ontstaat je maandbedrag"
          description="De maximale beurs is het vertrekpunt. De berekende ouderbijdrage verlaagt het bedrag dat voor jou overblijft."
        >
          <HorizontalBarChart
            maximum={submittedView.result.appliedMaximumMonthlyGrant}
            caption="Vergelijking van de maximale aanvullende beurs, de berekende ouderbijdrage en de geschatte aanvullende beurs per maand."
            data={[
              {
                key: "maximum",
                label: "Maximale aanvullende beurs",
                value: submittedView.result.appliedMaximumMonthlyGrant,
                formattedValue: formatCurrency(
                  submittedView.result.appliedMaximumMonthlyGrant,
                ),
                color: "var(--accent-line)",
              },
              {
                key: "parental-contribution",
                label: "Berekende ouderbijdrage",
                value:
                  submittedView.result.standardReferenceYearResult
                    .parentalMonthlyContribution ?? 0,
                formattedValue: formatCurrency(
                  submittedView.result.standardReferenceYearResult
                    .parentalMonthlyContribution ?? 0,
                ),
                color: "var(--soft)",
              },
              {
                key: "estimated-grant",
                label: "Geschatte aanvullende beurs",
                value: submittedView.result.estimatedMonthlyGrant,
                formattedValue: formatCurrency(
                  submittedView.result.estimatedMonthlyGrant,
                ),
                color: "var(--pos)",
              },
            ]}
          />
          <ResultTableDisclosure
            title="Bekijk de berekening als tabel"
            caption="Opbouw van de geschatte aanvullende beurs per maand."
            columns={[
              { key: "part", label: "Onderdeel" },
              { key: "meaning", label: "Betekenis" },
              { key: "amount", label: "Bedrag", align: "right" },
            ]}
            rows={[
              {
                key: "maximum",
                cells: {
                  part: "Maximale aanvullende beurs",
                  meaning: "Het maximum voor je opleiding en woonsituatie.",
                  amount: formatCurrency(
                    submittedView.result.appliedMaximumMonthlyGrant,
                  ),
                },
              },
              {
                key: "parental-contribution",
                cells: {
                  part: "Berekende ouderbijdrage",
                  meaning: "Het bedrag dat DUO volgens deze invoer van het maximum aftrekt.",
                  amount: formatCurrency(
                    submittedView.result.standardReferenceYearResult
                      .parentalMonthlyContribution ?? 0,
                  ),
                },
              },
              {
                key: "estimated-grant",
                cells: {
                  part: "Geschatte aanvullende beurs",
                  meaning: "Het bedrag dat na de berekende ouderbijdrage overblijft.",
                  amount: formatCurrency(
                    submittedView.result.estimatedMonthlyGrant,
                  ),
                },
              },
            ]}
          />
        </ResultVisualization>
      ) : null}
      <ResultContextNotice kind="duo" isExample={isExampleResult} />
      {!submittedSpecialCaseGuidance && submittedView.warningMessages.length > 0 ? (
        <section className="surface-panel p-5">
          <BulletList title="Let op" items={submittedView.warningMessages} />
        </section>
      ) : null}
      <ToolNextSteps {...nextSteps} />
      <CalculationResultActions
        onEdit={() => {
          setMobileFlowActive(true);
          mobileFlow.goToFirst();
        }}
        onRestart={() => {
          setDidSubmitAttempt(false);
          setMobileFlowActive(true);
          reset("Je begint met een lege berekening.");
          mobileFlow.resetToFirst();
        }}
      />
      {!submittedSpecialCaseGuidance ? (
        <DisclosureSection
          title="Berekening, aannames en bronnen"
          subtitle="Open de onderbouwing als je de uitkomst wilt controleren."
        >
        <ResultRow label="Aanvullende beurs per jaar" value={submittedView.annualGrantLabel} />
        <ResultRow label="Waarschijnlijk recht" value={submittedView.probablyEligibleLabel} />
        <div className="mt-4">
          {submittedView.explanationRows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
        <div className="mt-5 space-y-5">
          <BulletList title="Aannames" items={submittedView.assumptionMessages} />
          <BulletList title="Toelichting" items={submittedView.reasonMessages} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {submittedView.sourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-link ring-focus inline-flex min-h-11 items-center rounded-lg border border-[var(--hair)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--ink)] underline-offset-4 hover:underline"
            >
              {link.label} <span className="sr-only">(opent extern)</span>
            </a>
          ))}
        </div>
        </DisclosureSection>
      ) : null}
    </div>
  ) : (
    <div className="surface-panel p-5">
      <h3 className="font-serif text-xl text-[var(--ink)]">Nog geen uitkomst</h3>
      <p className="mt-2 text-[14px] leading-[1.65] text-[var(--muted)]">
        {specialCaseGuidance
          ? "Klik op Bereken. De tool toont geen regulier bedrag, maar legt uit waarom DUO je situatie apart beoordeelt."
          : "Vul je opleiding, woonsituatie en het ouderinkomen in. Daarna zie je een bedrag per maand en per jaar."}
      </p>
    </div>
  );

  return (
    <CalculatorShell
      intro={
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
            DUO · aanvullende beurs 2026
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[var(--ink)]">
            Schat je aanvullende beurs
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bereken met concrete ouderinkomens uit 2024 wat de aanvullende beurs in 2026
            indicatief per maand en per jaar kan zijn.
          </p>
        </div>
      }
      startActions={
        <div>
          <div className="flex flex-wrap gap-2">
            <ToolActionButton
              type="button"
              variant="secondary"
              onClick={() => {
                replaceValues(
                  defaultValues,
                  "Voorbeeld ingevuld. Klik op Bereken voor de voorbeeldberekening.",
                );
                setDidSubmitAttempt(false);
                setMobileFlowActive(true);
                mobileFlow.resetToFirst();
              }}
            >
              Voorbeeld invullen
            </ToolActionButton>
          </div>
          {isExampleInput ? <ExampleValuesNotice /> : null}
        </div>
      }
      inputs={inputs}
      submitAction={
        <div className="hidden space-y-3 md:block">
          <ToolActionButton type="button" onClick={handleSubmit} disabled={hasErrors}>
            Bereken
          </ToolActionButton>
          {hasDirtyChanges ? (
            <p className="text-[12px] leading-[1.5] text-[var(--muted)]">
              Je hebt de invoer gewijzigd na de laatste berekening.
            </p>
          ) : null}
        </div>
      }
      result={result}
      disclaimer={
        <p className="text-[12px] leading-[1.6] text-[var(--muted)]">
          Deze tool geeft een indicatie en geen DUO-beschikking.
          Ouderinkomens blijven alleen in je browser.
        </p>
      }
    />
  );
}
