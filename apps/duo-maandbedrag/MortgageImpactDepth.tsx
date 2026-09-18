"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { MobileFieldFlowControls } from "@/components/MobileFieldFlowControls";
import { ResultCard } from "@/components/ResultCard";
import { ResultRow } from "@/components/ResultRow";
import {
  HorizontalBarChart,
  ResultTableDisclosure,
  ResultVisualization,
} from "@/components/ResultVisualization";
import { ToolActionButton } from "@/components/tool/ToolActionButton";
import { useMobileFieldFlow } from "@/hooks/useMobileFieldFlow";
import type { DuoMonthlyPaymentView } from "./logic";
import {
  calculateMortgageDepthView,
  createMortgageDepthDefaultValues,
  type MortgageDepthFormValues,
} from "./mortgage-depth";

function formatCurrency(value: number, digits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function DepthDisclosure({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setIsOpen(event.currentTarget.open);
  }

  return (
    <details open={isOpen} onToggle={handleToggle} className="surface-panel overflow-hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]">
        <div className="min-w-0">
          <h3 className="font-serif text-[clamp(1.1rem,1rem+0.5vw,1.35rem)] text-[var(--ink)]">
            {title}
          </h3>
          <p className="mt-1 text-[13px] leading-[1.55] text-[var(--muted)]">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-md border border-[var(--hair)] bg-white/72 px-2 py-1 text-[12px] text-[var(--soft)]">
          {isOpen ? "Sluiten" : "Openen"}
        </span>
      </summary>
      <div className="hair-t px-5 pb-5 pt-4">{children}</div>
    </details>
  );
}

export function MortgageImpactDepth({ duoView }: { duoView: DuoMonthlyPaymentView }) {
  const [values, setValues] = useState<MortgageDepthFormValues>(
    createMortgageDepthDefaultValues,
  );
  const [showMortgageResult, setShowMortgageResult] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const calculation = useMemo(
    () => calculateMortgageDepthView(duoView, values),
    [duoView, values],
  );
  const mobileFlow = useMobileFieldFlow(["mortgageIncome", "mortgagePartnerIncome"]);

  function updateField(field: keyof MortgageDepthFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setShowMortgageResult(false);
  }

  function complete() {
    mobileFlow.attemptAdvance({
      blocked: Object.keys(calculation.errors).length > 0,
      onComplete: () => setShowMortgageResult(Boolean(calculation.view)),
    });
  }

  useEffect(() => {
    if (!showMortgageResult || !calculation.view) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [calculation.view, showMortgageResult]);

  return (
    <section id="hypotheekimpact" className="scroll-mt-36">
      <DepthDisclosure
        title="Wat betekent dit voor mijn hypotheek?"
        subtitle="Open alleen als je wilt zien hoeveel hypotheekruimte je studieschuld indicatief kan kosten."
      >
      <p className="text-[13px] leading-6 text-[var(--ink-2)]">
        Banken kijken niet alleen naar je resterende schuld. Het wettelijke
        DUO-maandbedrag kan invloed hebben op hoeveel je maximaal kunt lenen.
        Je DUO-gegevens hierboven nemen we automatisch over.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label
          className={mobileFlow.getFieldClassName("mortgageIncome")}
          data-mobile-flow-field="mortgageIncome"
          htmlFor="mortgageIncome"
        >
          <span className="text-[12px] font-medium uppercase text-[var(--muted)]">
            Jouw bruto jaarinkomen
          </span>
          <span className="field-shell flex min-h-12 items-center px-3">
            <span className="mr-2 text-[var(--muted)]">€</span>
            <input
              id="mortgageIncome"
              inputMode="decimal"
              enterKeyHint="next"
              value={values.grossIncomeUser}
              onChange={(event) => updateField("grossIncomeUser", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("mortgageIncome", {
                blocked: Boolean(calculation.errors.grossIncomeUser),
              })}
              className="min-w-0 flex-1 bg-transparent font-mono outline-none"
              aria-invalid={Boolean(calculation.errors.grossIncomeUser)}
            />
          </span>
          <FieldError message={calculation.errors.grossIncomeUser} />
        </label>

        <label
          className={mobileFlow.getFieldClassName("mortgagePartnerIncome")}
          data-mobile-flow-field="mortgagePartnerIncome"
          htmlFor="mortgagePartnerIncome"
        >
          <span className="text-[12px] font-medium uppercase text-[var(--muted)]">
            Bruto jaarinkomen partner
          </span>
          <span className="field-shell flex min-h-12 items-center px-3">
            <span className="mr-2 text-[var(--muted)]">€</span>
            <input
              id="mortgagePartnerIncome"
              inputMode="decimal"
              enterKeyHint="done"
              value={values.grossIncomePartner}
              onChange={(event) => updateField("grossIncomePartner", event.target.value)}
              onKeyDown={mobileFlow.handleEnterAdvance("mortgagePartnerIncome", {
                blocked: Boolean(calculation.errors.grossIncomePartner),
                onComplete: () => setShowMortgageResult(Boolean(calculation.view)),
              })}
              className="min-w-0 flex-1 bg-transparent font-mono outline-none"
              aria-invalid={Boolean(calculation.errors.grossIncomePartner)}
            />
          </span>
          <span className="text-[11px] text-[var(--soft)]">Laat leeg als je alleen koopt.</span>
          <FieldError message={calculation.errors.grossIncomePartner} />
        </label>
      </div>

      {!showMortgageResult ? (
        <MobileFieldFlowControls
          current={mobileFlow.activeIndex + 1}
          total={mobileFlow.total}
          canGoPrev={mobileFlow.canGoPrev}
          canGoNext={mobileFlow.canGoNext}
          canComplete
          dockToViewport
          completeLabel="Bereken hypotheekimpact"
          onPrev={mobileFlow.goPrev}
          onNext={() =>
            mobileFlow.attemptAdvance({
              blocked: Boolean(calculation.errors.grossIncomeUser),
            })
          }
          onComplete={complete}
        />
      ) : null}

      <div className="mt-4 hidden md:block">
        <ToolActionButton type="button" variant="accent" onClick={() => setShowMortgageResult(Boolean(calculation.view))}>
          Bereken mijn hypotheekimpact
        </ToolActionButton>
      </div>

      {showMortgageResult && calculation.view ? (
        <section
          ref={resultRef}
          tabIndex={-1}
          className="mt-5 space-y-4 outline-none"
          aria-label="Jouw hypotheekimpact"
        >
          <h3 className="font-serif text-xl text-[var(--ink)]">Jouw hypotheekimpact</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard label="Zonder studieschuld" value={formatCurrency(calculation.view.maxMortgageWithoutStudentDebt)} />
            <ResultCard label="Met jouw studieschuld" value={formatCurrency(calculation.view.maxMortgageWithStudentDebt)} />
            <ResultCard label="Verschil" value={formatCurrency(calculation.view.mortgageDifference)} tone="warn" />
          </div>
          <ResultVisualization
            title="Effect op je maximale hypotheek"
            description="De kortere balk laat zien hoeveel hypotheekruimte in deze indicatie overblijft nadat je studieschuld is meegeteld."
          >
            <HorizontalBarChart
              maximum={calculation.view.maxMortgageWithoutStudentDebt}
              caption="Vergelijking van de indicatieve maximale hypotheek zonder en met studieschuld."
              data={[
                {
                  key: "without-debt",
                  label: "Zonder studieschuld",
                  value: calculation.view.maxMortgageWithoutStudentDebt,
                  formattedValue: formatCurrency(
                    calculation.view.maxMortgageWithoutStudentDebt,
                  ),
                  color: "var(--accent-line)",
                },
                {
                  key: "with-debt",
                  label: "Met jouw studieschuld",
                  value: calculation.view.maxMortgageWithStudentDebt,
                  formattedValue: formatCurrency(
                    calculation.view.maxMortgageWithStudentDebt,
                  ),
                  color: "var(--accent)",
                },
              ]}
            />
            <ResultTableDisclosure
              title="Bekijk de vergelijking als tabel"
              caption="Indicatieve maximale hypotheek zonder en met studieschuld."
              columns={[
                { key: "situation", label: "Situatie" },
                { key: "meaning", label: "Betekenis" },
                { key: "amount", label: "Bedrag", align: "right" },
              ]}
              rows={[
                {
                  key: "without-debt",
                  cells: {
                    situation: "Zonder studieschuld",
                    meaning: "Hypotheekruimte op basis van het ingevulde inkomen.",
                    amount: formatCurrency(
                      calculation.view.maxMortgageWithoutStudentDebt,
                    ),
                  },
                },
                {
                  key: "with-debt",
                  cells: {
                    situation: "Met jouw studieschuld",
                    meaning: "Hypotheekruimte nadat de DUO-last is meegeteld.",
                    amount: formatCurrency(
                      calculation.view.maxMortgageWithStudentDebt,
                    ),
                  },
                },
                {
                  key: "difference",
                  cells: {
                    situation: "Verschil",
                    meaning: "Indicatief minder hypotheekruimte door je studieschuld.",
                    amount: formatCurrency(calculation.view.mortgageDifference),
                  },
                },
              ]}
            />
          </ResultVisualization>
          <p className="text-[12px] leading-5 text-[var(--muted)]">
            Dit is een indicatie op basis van de centrale hypotheeknormen en je
            invoer. Een geldverstrekker kan aanvullende voorwaarden toepassen.
          </p>

          <DepthDisclosure
            title="Hoe is dit berekend?"
            subtitle="Bekijk welk DUO-bedrag de bank meerekent en hoe dit je hypotheekruimte verandert."
          >
            <div className="space-y-4 text-[13px] leading-6 text-[var(--ink-2)]">
              <div>
                <h4 className="font-semibold text-[var(--ink)]">1. Wettelijk maandbedrag</h4>
                <p>
                  Dit is het bedrag waarmee je DUO-schuld volgens rente en resterende
                  looptijd wordt afgelost. Het kan afwijken van je feitelijke betaling
                  door draagkracht, een aflosvrije periode of vrijwillig extra betalen.
                  Voor deze hypotheekindicatie gebruiken we de centraal berekende
                  wettelijke waarde.
                </p>
                <ResultRow label="Jouw wettelijke maandbedrag" value={`${formatCurrency(calculation.view.result.mortgageImpact.bruteringBaseMonthlyPayment, 2)} per maand`} strong />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--ink)]">2. Omrekening voor de hypotheek</h4>
                <p>
                  Een DUO-last en een hypotheeklast tellen niet één op één hetzelfde
                  mee. De hypotheekberekening zet het wettelijke maandbedrag daarom om
                  naar de woonlast die een bank in deze indicatie meerekent. Dit heet
                  technisch ook brutering.
                </p>
                <ResultRow label="Omrekenfactor voor de bank" value={`${calculation.view.result.mortgageImpact.bruteringFactor.toFixed(2).replace(".", ",")}×`} />
                <ResultRow label="Woonlast die de bank meerekent" value={`${formatCurrency(calculation.view.result.mortgageImpact.grossDuoMonthlyImpact, 2)} per maand`} strong />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--ink)]">3. Beschikbare woonlast en hypotheek</h4>
                <ResultRow label="Ruimte voor hypotheeklast vóór studieschuld" value={`${formatCurrency(calculation.view.result.incomeCapacity.monthlyBudgetFromIncome, 2)} per maand`} />
                <ResultRow label="Maximale hypotheek zonder studieschuld" value={formatCurrency(calculation.view.maxMortgageWithoutStudentDebt)} />
                <ResultRow label="Maximale hypotheek met studieschuld" value={formatCurrency(calculation.view.maxMortgageWithStudentDebt)} strong />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--ink)]">Bronnen en uitgangspunten</h4>
                <p>
                  Grip gebruikt je DUO-gegevens om eerst het wettelijke maandbedrag
                  te bepalen. Daarna rekent de tool uit welke woonlast een bank kan
                  meetellen en wat dat indicatief doet met je maximale hypotheek.
                </p>
                <ul className="space-y-1">
                  {calculation.view.sourceReferences.map((source) => (
                    <li key={`${source.name}-${source.url ?? "zonder-url"}`}>
                      {source.url ? (
                        <a className="underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.name}
                        </a>
                      ) : (
                        source.name
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DepthDisclosure>
        </section>
      ) : null}
      </DepthDisclosure>
    </section>
  );
}
