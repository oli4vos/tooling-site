import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { projectWealthPlan } from "@/lib/planning/wealth-planning";
import { calculateBox3Tax, type Box3Method } from "@/lib/tax";

export type FinancialPlanInput = {
  year?: number;
  hasFiscalPartner?: boolean;
  box3Method?: Box3Method;
  currentSavings?: number;
  currentInvestments?: number;
  monthlySavingsContribution?: number;
  monthlyInvestmentsContribution?: number;
  expectedSavingsReturn?: number;
  expectedInvestmentsReturn?: number;
  horizonYears?: number;
  annualExpenses?: number;
  withdrawalRate?: number;
};

export type FinancialPlanResult = {
  year: number;
  horizonYears: number;
  totalMonthlyContribution: number;
  endingAssets: number;
  endingSavings: number;
  endingInvestments: number;
  totalContributions: number;
  totalGrowth: number;
  endingBox3Tax: number;
  fireTarget: number | null;
  fireGap: number | null;
  yearly: Array<{
    year: number;
    savings: number;
    investments: number;
    totalAssets: number;
    contributions: number;
    growth: number;
    indicativeBox3Tax: number;
  }>;
  nextSteps: Array<{ title: string; detail: string; href: string }>;
  warnings: string[];
};

function money(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(value as number, 0) : 0;
}

function percent(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Math.min(Math.max(value as number, 0), 100) : fallback;
}

function year(value: number | undefined) {
  const rounded = Math.round(value ?? getDefaultFinancialYear());
  return rounded >= 2000 && rounded <= 2200 ? rounded : getDefaultFinancialYear();
}

function horizon(value: number | undefined) {
  return Math.min(Math.max(Math.round(value ?? 20), 1), 60);
}

function round(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

export function calculateFinancialPlan(input: FinancialPlanInput): FinancialPlanResult {
  const taxYear = year(input.year);
  const horizonYears = horizon(input.horizonYears);
  const box3Method = input.box3Method ?? "forfaitary";
  const startingSavings = money(input.currentSavings);
  const startingInvestments = money(input.currentInvestments);
  const monthlySavingsContribution = money(input.monthlySavingsContribution);
  const monthlyInvestmentsContribution = money(input.monthlyInvestmentsContribution);
  const expectedSavingsReturn = percent(input.expectedSavingsReturn, 2);
  const expectedInvestmentsReturn = percent(input.expectedInvestmentsReturn, 6);
  const annualExpenses = money(input.annualExpenses);
  const withdrawalRate = percent(input.withdrawalRate, 4);

  const projection = projectWealthPlan({
    startBankDeposits: startingSavings,
    startInvestmentsAndOtherAssets: startingInvestments,
    monthlyBankDepositsContribution: monthlySavingsContribution,
    monthlyInvestmentsContribution,
    expectedBankDepositsReturn: expectedSavingsReturn,
    expectedInvestmentsReturn,
    horizonYears,
  });

  const yearly = projection.points.map((point) => {
    const tax = calculateBox3Tax({
      year: taxYear,
      hasFiscalPartner: Boolean(input.hasFiscalPartner),
      method: box3Method,
      bankDeposits: point.bankDeposits,
      investmentsAndOtherAssets: point.investmentsAndOtherAssets,
      debts: 0,
      actualAnnualReturnRate: expectedInvestmentsReturn,
    });
    return {
      year: point.yearIndex,
      savings: point.bankDeposits,
      investments: point.investmentsAndOtherAssets,
      totalAssets: point.totalAssets,
      contributions: point.contributedThisYear,
      growth: point.growthThisYear,
      indicativeBox3Tax: round(tax.box3Tax),
    };
  });
  const fireTarget = annualExpenses > 0 && withdrawalRate > 0
    ? round(annualExpenses / (withdrawalRate / 100))
    : null;
  const endingAssets = projection.endingTotalAssets;

  return {
    year: taxYear,
    horizonYears,
    totalMonthlyContribution: projection.totalMonthlyContribution,
    endingAssets,
    endingSavings: projection.endingBankDeposits,
    endingInvestments: projection.endingInvestmentsAndOtherAssets,
    totalContributions: projection.totalContributions,
    totalGrowth: round(endingAssets - startingSavings - startingInvestments - projection.totalContributions),
    endingBox3Tax: yearly.at(-1)?.indicativeBox3Tax ?? 0,
    fireTarget,
    fireGap: fireTarget === null ? null : round(Math.max(fireTarget - endingAssets, 0)),
    yearly,
    nextSteps: [
      { title: "Controleer Box 3", detail: "Verfijn werkelijk of forfaitair rendement met je eigen gegevens.", href: "/apps/box3-indicatie" },
      { title: "Toets je FIRE-doel", detail: "Neem uitgaven, inflatie en jaarlijks opnamepercentage mee.", href: "/apps/fire-na-belasting" },
      { title: "Vergelijk je woonkeuze", detail: "Bekijk aflossen versus beleggen als een hypotheek meespeelt.", href: "/apps/hypotheek-aflossen-vs-beleggen" },
    ],
    warnings: [
      "Rendementen zijn scenario-aannames, geen voorspelling of beleggingsadvies.",
      "De box 3-uitkomst is een indicatie op basis van het gekozen jaar en de gekozen methode.",
      "Deze planning bevat geen schulden, pensioenrechten, kosten of persoonlijke aftrekposten tenzij je die in een vervolgstap apart onderzoekt.",
    ],
  };
}
