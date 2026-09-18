"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { DuoDebtPartsEditor } from "@/components/duo/DuoDebtPartsEditor";
import { DisclosureSection } from "@/components/DisclosureSection";
import { FieldError } from "@/components/forms/FieldError";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
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
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import {
  formatDuoRateYearLabel,
  getAvailableDuoRateYears,
} from "@/lib/financial-constants";
import {
  createDuoDebtPartFormValue,
  type DuoDebtPartFormValue,
} from "@/lib/duo/debt-parts-form";
import {
  createProfilePrefillState,
} from "@/lib/profile-prefill";
import { getDuoMonthlyPaymentDefaultsFromProfile } from "@/lib/profile-tool-mapping";
import { createStudentDebtProfilePatch } from "@/lib/profile-result-mapping";
import {
  mergeProfilePatch,
  type UserProfile,
} from "@/lib/user-profile";
import {
  calculateDuoMonthlyPaymentView,
  createDuoMortgageAssessmentTransferCandidate,
  createDuoMonthlyPaymentDefaultValues,
  createEmptyDuoMonthlyPaymentValues,
  repaymentRuleOptions,
  type DuoHouseholdSituation,
  type DuoMonthlyPaymentFormValues,
} from "./logic";
import { downloadDuoMonthlyPaymentPdfReport } from "./report";
import {
  attachDuoMortgageTransferCandidate,
  getDuoMortgageTransferIdFromUrl,
  getDuoMortgageTransferUrl,
  readDuoMortgageTransfer,
  type DuoMortgageTransferRecord,
} from "@/lib/duo-mortgage-transfer";
import { getToolNextSteps } from "@/lib/tool-journeys";
import { MortgageImpactDepth } from "./MortgageImpactDepth";

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

type FieldProps = {
  id: keyof DuoMonthlyPaymentFormValues;
  label: string;
  value: string;
  error?: string;
  prefix?: string;
  hint?: string;
  className?: string;
  onEnter?: (event: KeyboardEvent) => void;
  enterKeyHint?: "next" | "done";
  onChange: (value: string) => void;
};

function MoneyField({ id, label, value, error, prefix, hint, className, onEnter, enterKeyHint, onChange }: FieldProps) {
  const fieldId = String(id);
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label
      className={`grid min-w-0 gap-2 ${className ?? ""}`.trim()}
      htmlFor={fieldId}
      data-mobile-flow-field={fieldId}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          {label}
        </span>
        {hint ? <span id={hintId} className="text-right text-[11px] text-[var(--soft)]">{hint}</span> : null}
      </span>
      <span className="field-shell flex min-h-12 items-center px-3">
        {prefix ? <span className="mr-2 text-[var(--muted)]">{prefix}</span> : null}
        <input
          id={fieldId}
          inputMode="decimal"
          enterKeyHint={enterKeyHint}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onEnter}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className="ring-focus min-w-0 flex-1 bg-transparent font-mono text-[15px] tabular outline-none"
        />
      </span>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

type DuoMaandbedragContentProps = {
  initialValues: DuoMonthlyPaymentFormValues;
  hasRelevantProfileValues: boolean;
  onSaveToProfile: (patch: Partial<UserProfile>) => UserProfile;
  handoff:
    | {
        sourceTitle: string;
        fieldLabels: string[];
      }
    | null;
};

export default function DuoMaandbedragCalculator() {
  const { profile, hasProfile, mergeProfile } = useUserProfile();
  const handoff = useToolHandoff("duo-maandbedrag");
  const effectiveProfile = handoff
    ? mergeProfilePatch(profile, handoff.profilePatch)
    : profile;
  const profilePatch =
    getDuoMonthlyPaymentDefaultsFromProfile(effectiveProfile);
  const { initialValues, hasRelevantProfileValues } =
    createProfilePrefillState<DuoMonthlyPaymentFormValues>({
      defaultValues: createEmptyDuoMonthlyPaymentValues(),
      profilePatch,
      hasProfile: hasProfile || Boolean(handoff),
      profileUpdatedAt: profile.updatedAt,
    });

  return (
    <DuoMaandbedragContent
      key={handoff ? `handoff-${handoff.transferId}` : "standard"}
      initialValues={initialValues}
      hasRelevantProfileValues={hasRelevantProfileValues}
      onSaveToProfile={mergeProfile}
      handoff={handoff}
    />
  );
}

function DuoMaandbedragContent({
  initialValues,
  hasRelevantProfileValues,
  onSaveToProfile,
  handoff,
}: DuoMaandbedragContentProps) {
  const exampleValues = useMemo(
    () => createDuoMonthlyPaymentDefaultValues(),
    [],
  );
  const [formValues, setFormValues] = useState<DuoMonthlyPaymentFormValues>(
    initialValues,
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [transferRecord, setTransferRecord] =
    useState<DuoMortgageTransferRecord | null>(null);
  const [transferMessage, setTransferMessage] = useState("");
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const initialValuesAtMount = useRef(initialValues);
  const profilePrefillApplied = useRef(hasRelevantProfileValues);
  const view = useMemo(() => calculateDuoMonthlyPaymentView(formValues), [formValues]);
  const isExample = JSON.stringify(formValues) === JSON.stringify(exampleValues);
  const nextSteps = getToolNextSteps("duo-maandbedrag");
  const mobileFieldOrder = [
    "remainingDebt",
    "repaymentRule",
    ...(!formValues.useDebtParts ? ["duoRateYear"] : []),
  ];
  const mobileFlow = useMobileFieldFlow(mobileFieldOrder);

  useEffect(() => {
    queueMicrotask(() => {
      const transferId = getDuoMortgageTransferIdFromUrl(window.location.search);
      if (!transferId) {
        return;
      }

      const transfer = readDuoMortgageTransfer(transferId, {
        targetTool: "duo-maandbedrag",
      });

      if (!transfer.ok) {
        setTransferMessage(
          "De koppeling met je hypotheekberekening is verlopen of niet beschikbaar. Je kunt deze DUO-tool nog los gebruiken.",
        );
        return;
      }

      setTransferRecord(transfer.data);
    });
  }, []);

  useEffect(() => {
    if (!hasRelevantProfileValues || profilePrefillApplied.current) {
      return;
    }

    profilePrefillApplied.current = true;
    if (
      JSON.stringify(formValues) ===
      JSON.stringify(initialValuesAtMount.current)
    ) {
      setFormValues(initialValues);
    }
  }, [formValues, hasRelevantProfileValues, initialValues]);

  function updateField<K extends keyof DuoMonthlyPaymentFormValues>(
    field: K,
    value: DuoMonthlyPaymentFormValues[K],
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
      await downloadDuoMonthlyPaymentPdfReport(formValues, view);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function handleSaveToProfile() {
    if (!view.isValid) {
      return;
    }

    const mortgageCandidate =
      createDuoMortgageAssessmentTransferCandidate(view);
    if (!mortgageCandidate) {
      setProfileSaveMessage(
        "De DUO-uitkomst kon niet veilig in je profiel worden bewaard.",
      );
      return;
    }

    profilePrefillApplied.current = true;
    onSaveToProfile(
      createStudentDebtProfilePatch({
        remainingDebt: view.remainingDebt,
        statutoryMonthlyPayment: view.statutoryMonthlyPayment,
        mortgageAssessmentMonthlyPayment:
          mortgageCandidate.recommendedMonthlyAssessmentPayment,
        repaymentRule: view.repaymentRule,
        duoInterestRate: view.annualInterestRate,
        duoRateYear: view.duoRateYear,
        remainingTermYears: view.termYears,
        debtParts: view.debtPortfolio.usesDebtParts
          ? view.debtPortfolio.parts.map((part) => ({
              remainingDebt: part.remainingDebt,
              rateYear: part.rateYear,
            }))
          : undefined,
      }),
    );
    setProfileSaveMessage(
      "Wettelijk maandbedrag, hypotheektoetsbedrag en DUO-gegevens zijn in je profiel bewaard.",
    );
  }

  function handleReturnToMortgageTool() {
    if (!transferRecord || !view.isValid) {
      return;
    }

    const candidate = createDuoMortgageAssessmentTransferCandidate(view);
    if (!candidate) {
      setTransferMessage("Bereken eerst een geldig DUO-maandbedrag voordat je teruggaat.");
      return;
    }

    const updated = attachDuoMortgageTransferCandidate(
      transferRecord.transferId,
      candidate,
    );
    if (!updated.ok) {
      setTransferMessage(
        "Het terugzetten naar je hypotheekberekening lukt niet in deze browser. Open de hypotheektool opnieuw en vul het bedrag handmatig in.",
      );
      return;
    }

    window.location.assign(
      getDuoMortgageTransferUrl(
        updated.data.returnPath,
        updated.data.transferId,
        updated.data.returnAnchor,
      ),
    );
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
    if (mobileFlow.activeFieldId === "remainingDebt") return view.errors.remainingDebt;
    if (mobileFlow.activeFieldId === "repaymentRule") return view.errors.repaymentRule;
    if (mobileFlow.activeFieldId === "duoRateYear") return view.errors.duoRateYear;
    return undefined;
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

  function visibleError(field: "remainingDebt" | "repaymentRule" | "duoRateYear" | "assessmentIncome") {
    const value = formValues[field];
    const hasInput = typeof value === "string" && value.trim().length > 0;
    return mobileFlow.wasAttempted(field) || hasInput ? view.errors[field] : undefined;
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
        prefix="€"
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
            updateField(
              "repaymentRule",
              event.target.value as DuoMonthlyPaymentFormValues["repaymentRule"],
            )
          }
          aria-invalid={view.errors.repaymentRule ? "true" : "false"}
          aria-describedby="repaymentRule-hint repaymentRule-error"
          className="field-shell ring-focus h-12 px-3 text-[15px] text-[var(--ink)] outline-none"
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
            aria-invalid={view.errors.duoRateYear ? "true" : "false"}
            aria-describedby={
              view.errors.duoRateYear ? "duoRateYear-hint duoRateYear-error" : "duoRateYear-hint"
            }
            className="field-shell ring-focus h-12 px-3 text-[15px] text-[var(--ink)] outline-none"
          >
            {getAvailableDuoRateYears().map((year) => (
              <option key={year} value={year}>
                {formatDuoRateYearLabel(year, formValues.repaymentRule)}
              </option>
            ))}
          </select>
          <p id="duoRateYear-hint" className="text-[12px] leading-[1.5] text-[var(--soft)]">
            Bekijk je rentepercentage in Mijn DUO bij Mijn schulden en kies hier het
            bijbehorende jaar.
          </p>
          <FieldError id="duoRateYear-error" message={view.errors.duoRateYear} />
        </label>
      ) : null}

      <DuoDebtPartsEditor
        enabled={formValues.useDebtParts}
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

      <DisclosureSection
        title="Wat kan inkomen veranderen? (optioneel)"
        subtitle="Vul je inkomen in als je ook een indicatie van een mogelijke verlaging wilt zien."
      >
        <div className="grid gap-4">
          <MoneyField
            id="assessmentIncome"
            label="Inkomen dat DUO gebruikt"
            value={formValues.assessmentIncome}
            error={visibleError("assessmentIncome")}
            prefix="€"
            hint="Meestal je inkomen van twee jaar terug, op je definitieve belastingaanslag"
            onChange={(value) => updateField("assessmentIncome", value)}
          />
          <label className="grid gap-2" htmlFor="householdSituation">
            <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
              Huishoudsituatie
            </span>
            <select
              id="householdSituation"
              value={formValues.householdSituation}
              onChange={(event) =>
                updateField("householdSituation", event.target.value as DuoHouseholdSituation)
              }
              className="field-shell ring-focus h-12 px-3 text-[15px] text-[var(--ink)] outline-none"
            >
              <option value="single">Alleenstaand</option>
              <option value="partner">Met partner of alleenstaande ouder</option>
            </select>
          </label>
        </div>
      </DisclosureSection>

      {hasRelevantProfileValues && !handoff ? (
        <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
          Je studieschuldgegevens zijn ingevuld vanuit je profiel. Controleer ze
          voordat je berekent.
        </p>
      ) : null}
      {handoff ? (
        <ToolHandoffNotice
          sourceTitle={handoff.sourceTitle}
          fieldLabels={handoff.fieldLabels}
        />
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
      {transferRecord ? (
        <div className="surface-subtle px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          Je kwam vanuit de hypotheektool. Bereken hier je DUO-maandbedrag en
          stuur daarna alleen het bevestigbare hypotheekbedrag terug naar je
          opgeslagen concept.
        </div>
      ) : null}
      {transferMessage ? (
        <div className="surface-subtle px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
          {transferMessage}
        </div>
      ) : null}
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
          label="Wettelijke maandtermijn"
          value={formatCurrency(view.statutoryMonthlyPayment)}
          note={`${view.termYears} jaar, ${formatPercent(view.annualInterestRate)}% gewogen DUO-rente. Dit is je verplichte basis; alles daarboven is extra aflossen.`}
          className="sm:col-span-2"
        />
        {view.incomeBased ? (
          <ResultCard
            label="Maandbedrag na inkomenscheck"
            value={formatCurrency(view.duoMonthlyPaymentUsed ?? view.statutoryMonthlyPayment)}
            note="DUO vergelijkt het bedrag op basis van je inkomen met de wettelijke termijn en gebruikt het laagste bedrag."
            tone="warn"
          />
        ) : null}
      </div>
      <ResultContextNotice kind="duo" isExample={isExample} />
      <MortgageImpactDepth duoView={view} />
      <ToolNextSteps
        {...nextSteps}
        handoff={{
          sourceTool: "duo-maandbedrag",
          profilePatch: createStudentDebtProfilePatch({
            remainingDebt: view.remainingDebt,
            statutoryMonthlyPayment: view.statutoryMonthlyPayment,
            mortgageAssessmentMonthlyPayment:
              createDuoMortgageAssessmentTransferCandidate(view)
                ?.recommendedMonthlyAssessmentPayment ??
              view.statutoryMonthlyPayment,
            repaymentRule: view.repaymentRule,
            duoInterestRate: view.annualInterestRate,
            duoRateYear: view.duoRateYear,
            remainingTermYears: view.termYears,
            debtParts: view.debtPortfolio.usesDebtParts
              ? view.debtPortfolio.parts.map((part) => ({
                  remainingDebt: part.remainingDebt,
                  rateYear: part.rateYear,
                }))
              : undefined,
          }),
          fieldLabels: [
            "resterende studieschuld",
            "terugbetalingsregel",
            "DUO-rente",
            "wettelijk maandbedrag",
          ],
        }}
      />
      <CalculationResultActions
        onEdit={() => {
          setShowResult(false);
          mobileFlow.goToFirst();
        }}
        onRestart={() => {
          setFormValues(createEmptyDuoMonthlyPaymentValues());
          setShowResult(false);
          setTransferMessage("");
          setProfileSaveMessage("");
          mobileFlow.resetToFirst();
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        {transferRecord ? (
          <ToolActionButton type="button" variant="accent" onClick={handleReturnToMortgageTool}>
            Terug naar mijn hypotheekberekening
          </ToolActionButton>
        ) : null}
        <ToolActionButton
          type="button"
          variant="secondary"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "PDF wordt gemaakt..." : "Download overzicht"}
        </ToolActionButton>
        {ENABLE_PROFILE ? (
          <ToolActionButton
            type="button"
            variant="secondary"
            onClick={handleSaveToProfile}
          >
            Bewaar DUO-uitkomsten in profiel
          </ToolActionButton>
        ) : null}
      </div>
      {profileSaveMessage ? (
        <p
          role="status"
          className="text-[13px] leading-[1.6] text-[var(--muted)]"
        >
          {profileSaveMessage}
        </p>
      ) : null}

      <DisclosureSection
        title="Volledige berekening"
        subtitle="Bekijk schuld, rente, looptijd en draagkracht."
      >
        <div>
          <ResultRow label="Openstaande schuld" value={formatCurrency(view.remainingDebt)} />
          <ResultRow label="Regeling" value={getRepaymentRuleLabel(view.repaymentRule)} />
          <ResultRow label="Gekozen rentejaar" value={String(view.duoRateYear)} />
          <ResultRow label="Gemiddelde rente over je leningdelen" value={`${formatPercent(view.annualInterestRate)}%`} />
          <ResultRow label="Looptijd" value={`${view.termYears} jaar`} />
          <ResultRow
            label="Wettelijke termijn"
            value={formatCurrency(view.statutoryMonthlyPayment)}
            strong
          />
          {view.debtPortfolio.usesDebtParts ? (
            <ResultRow
              label="Leningdelen"
              value={`${view.debtPortfolio.parts.length} delen`}
              sub="Per deel wordt het gekozen rentejaar apart doorgerekend."
            />
          ) : null}
          {view.incomeBased ? (
            <>
              <ResultRow
                label="Maandbedrag op basis van inkomen"
                value={formatCurrency(view.incomeBased.incomeBasedMonthlyPayment)}
                sub={`Boven vrijstelling: ${formatCurrency(view.incomeBased.amountAboveAllowance)}.`}
              />
              <ResultRow
                label="Indicatief te betalen"
                value={formatCurrency(view.incomeBased.requiredMonthlyPayment)}
                sub="Laagste van wettelijke termijn en draagkrachtindicatie."
                strong
              />
            </>
          ) : null}
        </div>
      </DisclosureSection>
    </div>
  ) : (
    <section id="tool-result-summary" className="surface-panel p-5">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
        Nog geen berekening
      </h2>
      <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
        Vul je openstaande schuld in en kies je concrete terugbetalingsregel.
        Daarna verschijnt je indicatieve maandbedrag.
      </p>
    </section>
  );

  return (
    <CalculatorShell
      intro={
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Wat wordt mijn DUO-maandbedrag?
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)]">
            Bereken eerst het maandbedrag dat hoort bij je schuld, rente en
            looptijd. Wil je daarna zien of inkomen dit bedrag mogelijk verlaagt,
            dan kun je die extra gegevens apart invullen.
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
                  DUO stelt je draagkracht jaarlijks vast op basis van je inkomen
                  van twee jaar terug. Deze indicatie vervangt die vaststelling niet.
                </li>
                <li>
                  Voor terugbetalers blijft een gekozen DUO-rente doorgaans 5 jaar vaststaan.
                </li>
                <li>Bijzondere situaties kunnen in Mijn DUO anders uitpakken.</li>
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
        <p className="surface-subtle p-4 text-[12.5px] leading-[1.7] text-[var(--muted)]">
          Puur informatieve DUO-indicatie. Geen advies. Jij bepaalt wat je met
          deze informatie doet.
        </p>
      }
    />
  );
}
