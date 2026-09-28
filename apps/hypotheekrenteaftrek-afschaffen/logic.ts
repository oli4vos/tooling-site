import {
  calculateMortgageInterestDeduction,
  calculateOwnHomeTaxAssessment,
  type OwnHomeAowStatus,
} from "@/lib/tax";
import { getDefaultFinancialYear } from "@/lib/financial-constants";

export type CalculatorInput = {
  taxYear?: number;
  firstMortgageYear: number;
  taxableIncome: number;
  remainingMortgageDebt: number;
  mortgageRatePercent: number;
  mortgageType: "annuity" | "linear" | "interestOnly";
  remainingMortgageTermYears: number;
  annualMortgageInterestOverride?: number;
  horizonYears: number;
  /** Enables the central 2026 own-home assessment instead of the legacy rate approximation. */
  ownHomeProfile?: {
    wozValue: number;
    labourIncome?: number;
    otherDeductibleCosts?: number;
    aow?: OwnHomeAowStatus;
    iackEligible?: boolean;
    qualifiesAsMainResidence: boolean;
    repaymentCompliant: boolean;
    loanReportedToTaxAuthority: boolean;
    hasHillenException?: boolean;
  };
};

export type TimelinePoint = {
  yearOffset: number;
  calendarYear: number;
  grossInterest: number;
  netInterestWithDeduction: number;
  netInterestWithoutDeduction: number;
  annualDifference: number;
  cumulativeDifference: number;
  deductionApplies: boolean;
};

export type CalculatorResult = {
  startYear: number;
  firstMortgageYear: number;
  horizonYears: number;
  annualGrossInterestUsed: number;
  annualTaxBenefitNow: number;
  annualNetCostWithDeduction: number;
  annualNetCostWithoutDeduction: number;
  annualDifference: number;
  cumulativeDifference: number;
  appliedDeductionRate: number;
  remainingMortgageTermYears: number;
  remainingDeductionYears: number;
  mortgageType: "annuity" | "linear" | "interestOnly";
  hraCalculationMethod: "central-own-home" | "legacy-rate-approximation";
  timeline: TimelinePoint[];
  warnings: string[];
};

function sanitizeMoney(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function sanitizePercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function sanitizeYear(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function sanitizeHorizon(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.round(value), 40));
}
function sanitizeFirstMortgageYear(value?: number, fallbackYear?: number) {
  const fallback = fallbackYear ?? getDefaultFinancialYear();
  if (value === undefined || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < 1980 || rounded > 2200) return fallback;
  return rounded;
}
function sanitizeMortgageType(value?: CalculatorInput["mortgageType"]) {
  if (value === "linear" || value === "interestOnly") return value;
  return "annuity";
}

function buildYearlyGrossInterest(input: {
  remainingMortgageDebt: number;
  mortgageRatePercent: number;
  mortgageType: "annuity" | "linear" | "interestOnly";
  remainingMortgageTermYears: number;
  horizonYears: number;
  annualMortgageInterestOverride?: number;
}) {
  const horizonYears = sanitizeHorizon(input.horizonYears);
  const termYears = sanitizeHorizon(input.remainingMortgageTermYears);
  const remainingDebtStart = sanitizeMoney(input.remainingMortgageDebt);
  const annualRate = sanitizePercent(input.mortgageRatePercent) / 100;
  const monthlyRate = annualRate / 12;
  const monthsLimit = Math.min(termYears * 12, horizonYears * 12);
  const yearlyGrossInterest = Array.from({ length: horizonYears }, () => 0);

  if (input.annualMortgageInterestOverride !== undefined) {
    const override = sanitizeMoney(input.annualMortgageInterestOverride);
    for (let year = 0; year < horizonYears; year += 1) {
      yearlyGrossInterest[year] = year * 12 < monthsLimit ? override : 0;
    }
    return yearlyGrossInterest.map((value) => roundMoney(value));
  }

  if (remainingDebtStart <= 0 || annualRate <= 0 || monthsLimit <= 0) {
    return yearlyGrossInterest;
  }

  let remainingDebt = remainingDebtStart;
  const totalMonths = Math.max(termYears * 12, 1);
  const annuityPayment =
    monthlyRate === 0
      ? remainingDebtStart / totalMonths
      : remainingDebtStart * (monthlyRate / (1 - (1 + monthlyRate) ** -totalMonths));
  const linearPrincipal = remainingDebtStart / totalMonths;

  for (let month = 1; month <= monthsLimit; month += 1) {
    const interest = remainingDebt * monthlyRate;
    const yearIndex = Math.floor((month - 1) / 12);
    yearlyGrossInterest[yearIndex] += interest;

    if (input.mortgageType === "annuity") {
      const principal = Math.max(annuityPayment - interest, 0);
      remainingDebt = Math.max(remainingDebt - principal, 0);
    } else if (input.mortgageType === "linear") {
      remainingDebt = Math.max(remainingDebt - linearPrincipal, 0);
    } else {
      // interestOnly: principal remains unchanged during selected term
      remainingDebt = Math.max(remainingDebt, 0);
    }
  }

  return yearlyGrossInterest.map((value) => roundMoney(value));
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function calculateAnnualHraBenefit(input: {
  taxYear: number;
  taxableIncome: number;
  firstMortgageYear: number;
  grossInterest: number;
  ownHomeProfile?: CalculatorInput["ownHomeProfile"];
}) {
  if (!input.ownHomeProfile || input.taxYear !== 2026) {
    const legacy = calculateMortgageInterestDeduction({
      year: input.taxYear,
      taxableIncome: input.taxableIncome,
      annualMortgageInterest: input.grossInterest,
    });
    return {
      taxBenefit: legacy.estimatedTaxBenefit,
      appliedRate: legacy.appliedDeductionRate,
      method: "legacy-rate-approximation" as const,
      warnings: input.ownHomeProfile && input.taxYear !== 2026
        ? ["De centrale eigenwoningrekenlaag is inhoudelijk gevalideerd voor 2026; voor dit andere jaar is de eerdere tariefbenadering gebruikt."]
        : ["Vul WOZ en leningkwalificatie in om met de centrale eigenwoningrekenlaag te rekenen."],
    };
  }
  const remainingDeductionYears = Math.max(30 - Math.max(input.taxYear - input.firstMortgageYear, 0), 0);
  const assessment = calculateOwnHomeTaxAssessment({
    year: 2026,
    ownHome: {
      wozValue: input.ownHomeProfile.wozValue,
      mortgageInterestPaid: input.grossInterest,
      otherDeductibleCosts: input.ownHomeProfile.otherDeductibleCosts,
      qualification: {
        qualifiesAsMainResidence: input.ownHomeProfile.qualifiesAsMainResidence,
        loanStartYear: input.firstMortgageYear,
        repaymentCompliant: input.ownHomeProfile.repaymentCompliant,
        loanReportedToTaxAuthority: input.ownHomeProfile.loanReportedToTaxAuthority,
        remainingDeductionYears,
        hasHillenException: input.ownHomeProfile.hasHillenException,
      },
    },
    taxpayers: [{
      id: "belastingplichtige",
      box1IncomeBeforeOwnHome: input.taxableIncome,
      labourIncome: input.ownHomeProfile.labourIncome ?? input.taxableIncome,
      aow: input.ownHomeProfile.aow ?? "none",
      iackEligible: input.ownHomeProfile.iackEligible,
    }],
  });
  const taxBenefit = assessment.household.eligibleCostsTaxBenefit;
  return {
    taxBenefit,
    appliedRate: input.grossInterest > 0 ? roundMoney((taxBenefit / input.grossInterest) * 100) : 0,
    method: "central-own-home" as const,
    warnings: assessment.warnings,
  };
}

export function calculateMortgageDeductionAbolitionImpact(
  input: CalculatorInput,
): CalculatorResult {
  const startYear = sanitizeYear(input.taxYear);
  const firstMortgageYear = sanitizeFirstMortgageYear(input.firstMortgageYear, startYear);
  const horizonYears = sanitizeHorizon(input.horizonYears);
  const taxableIncome = sanitizeMoney(input.taxableIncome);
  const remainingMortgageDebt = sanitizeMoney(input.remainingMortgageDebt);
  const mortgageRatePercent = sanitizePercent(input.mortgageRatePercent);
  const mortgageType = sanitizeMortgageType(input.mortgageType);
  const remainingMortgageTermYears = sanitizeHorizon(input.remainingMortgageTermYears);
  const yearsSinceFirstMortgage = Math.max(startYear - firstMortgageYear, 0);
  const remainingDeductionYears = Math.max(30 - yearsSinceFirstMortgage, 0);
  const yearlyGrossInterest = buildYearlyGrossInterest({
    remainingMortgageDebt,
    mortgageRatePercent,
    mortgageType,
    remainingMortgageTermYears,
    horizonYears,
    annualMortgageInterestOverride: input.annualMortgageInterestOverride,
  });
  const annualGrossInterestUsed = yearlyGrossInterest[0] ?? 0;

  const timeline: TimelinePoint[] = [];
  let cumulativeDifference = 0;
  let appliedDeductionRate = 0;
  let annualTaxBenefitNow = 0;
  let annualNetCostWithDeduction = annualGrossInterestUsed;
  let annualNetCostWithoutDeduction = annualGrossInterestUsed;
  let annualDifference = 0;
  let hraCalculationMethod: CalculatorResult["hraCalculationMethod"] = "legacy-rate-approximation";
  const hraWarnings = new Set<string>();

  for (let yearOffset = 0; yearOffset < horizonYears; yearOffset += 1) {
    const calendarYear = startYear + yearOffset;
    const grossInterest = yearlyGrossInterest[yearOffset] ?? 0;
    const deductionApplies = yearOffset < remainingDeductionYears && grossInterest > 0;
    const deduction = calculateAnnualHraBenefit({
      taxYear: startYear,
      taxableIncome,
      firstMortgageYear,
      grossInterest,
      ownHomeProfile: input.ownHomeProfile,
    });
    hraCalculationMethod = deduction.method;
    deduction.warnings.forEach((warning) => hraWarnings.add(warning));

    const netWith = roundMoney(
      deductionApplies ? roundMoney(Math.max(grossInterest - deduction.taxBenefit, 0)) : grossInterest,
    );
    const netWithout = roundMoney(grossInterest);
    const diff = roundMoney(netWithout - netWith);
    cumulativeDifference = roundMoney(cumulativeDifference + diff);

    if (yearOffset === 0) {
      appliedDeductionRate = deduction.appliedRate;
      annualTaxBenefitNow = deduction.taxBenefit;
      annualNetCostWithDeduction = netWith;
      annualNetCostWithoutDeduction = netWithout;
      annualDifference = diff;
    }

    timeline.push({
      yearOffset: yearOffset + 1,
      calendarYear,
      grossInterest,
      netInterestWithDeduction: netWith,
      netInterestWithoutDeduction: netWithout,
      annualDifference: diff,
      cumulativeDifference,
      deductionApplies,
    });
  }

  return {
    startYear,
    firstMortgageYear,
    horizonYears,
    annualGrossInterestUsed,
    annualTaxBenefitNow,
    annualNetCostWithDeduction,
    annualNetCostWithoutDeduction,
    annualDifference,
    cumulativeDifference,
    appliedDeductionRate,
    remainingMortgageTermYears,
    remainingDeductionYears,
    mortgageType,
    hraCalculationMethod,
    timeline,
    warnings: [
      "Dit is een indicatieve scenariovergelijking en geen officiële aangifteberekening.",
      "Renteontwikkeling is benaderd op basis van hypotheekvorm, resterende looptijd en een vaste rente-aanname.",
      `Renteaftrek is hier berekend op basis van eerste hypotheekjaar ${firstMortgageYear}, met maximaal 30 aftrekjaren.`,
      "Werkelijke netto impact hangt ook af van aflossing, rentevaste periodes en persoonlijke fiscale omstandigheden.",
      ...hraWarnings,
      hraCalculationMethod === "central-own-home"
        ? "De centrale eigenwoningberekening gebruikt 2026-regels. Voor latere jaren in deze grafiek blijven die 2026-regels een scenario-aanname."
        : "De tariefbenadering is alleen een overgangsmodus; vul het eigenwoningprofiel in voor de centrale 2026-berekening.",
    ],
  };
}
