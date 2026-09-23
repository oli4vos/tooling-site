import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { Box3Method } from "@/lib/tax";
import { projectWealthPlan, type WealthProjectionPoint } from "@/lib/planning/wealth-planning";

export type Box3ToolInput = {
  year?: number;
  method: Box3Method;
  bankDeposits: number;
  investmentsAndOtherAssets: number;
  debts: number;
  hasFiscalPartner: boolean;
  actualAnnualReturnRate?: number;
  actualIncome?: number;
  actualValueChange?: number;
  actualDebtInterest?: number;
  monthlyBankDepositsContribution?: number;
  monthlyInvestmentsContribution?: number;
  expectedBankDepositsReturn?: number;
  expectedInvestmentsReturn?: number;
  horizonYears?: number;
};

export type Box3ToolResult = {
  year: number;
  method: Box3Method;
  assetsTotal: number;
  debtsTotal: number;
  netWorth: number;
  taxFreeAllowance: number;
  taxableBase: number;
  taxableDeemedReturn: number;
  actualReturn: number;
  actualReturnComponentsProvided: boolean;
  box3Tax: number;
  effectiveTaxRateOnNetWorth: number;
  rates: {
    taxRate: number;
    deemedReturnBankDeposits: number;
    deemedReturnInvestments: number;
    deemedReturnDebts: number;
  };
  meta: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
  planning: {
    horizonYears: number;
    monthlyContributionByCategory: { bankDeposits: number; investmentsAndOtherAssets: number };
    totalMonthlyContribution: number;
    totalContributions: number;
    endingBankDeposits: number;
    endingInvestmentsAndOtherAssets: number;
    endingTotalAssets: number;
    endingBox3Tax: number;
    points: WealthProjectionPoint[];
  };
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizeYear(value?: number) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }

  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }

  return rounded;
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

export function calculateBox3Indicatie(input: Box3ToolInput): Box3ToolResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const bankDeposits = sanitizeMoney(input.bankDeposits);
  const investmentsAndOtherAssets = sanitizeMoney(input.investmentsAndOtherAssets);
  const debts = sanitizeMoney(input.debts);
  const planning = projectWealthPlan({
    startBankDeposits: bankDeposits,
    startInvestmentsAndOtherAssets: investmentsAndOtherAssets,
    monthlyBankDepositsContribution: input.monthlyBankDepositsContribution,
    monthlyInvestmentsContribution: input.monthlyInvestmentsContribution,
    expectedBankDepositsReturn: input.expectedBankDepositsReturn,
    expectedInvestmentsReturn: input.expectedInvestmentsReturn,
    horizonYears: input.horizonYears ?? 10,
  });

  const base = calculateBox3Tax({
    year,
    method: input.method,
    hasFiscalPartner: input.hasFiscalPartner,
    bankDeposits,
    investmentsAndOtherAssets,
    debts,
    actualAnnualReturnRate:
      input.method === "actual" ? sanitizePercent(input.actualAnnualReturnRate) : undefined,
    actualIncome: input.method === "actual" ? input.actualIncome : undefined,
    actualValueChange: input.method === "actual" ? input.actualValueChange : undefined,
    actualDebtInterest: input.method === "actual" ? input.actualDebtInterest : undefined,
  });
  const planningTax = calculateBox3Tax({
    year: year + planning.points.length - 1,
    method: input.method,
    hasFiscalPartner: input.hasFiscalPartner,
    bankDeposits: planning.endingBankDeposits,
    investmentsAndOtherAssets: planning.endingInvestmentsAndOtherAssets,
    debts,
    actualAnnualReturnRate: input.method === "actual" ? sanitizePercent(input.actualAnnualReturnRate) : undefined,
  });

  return {
    year: base.year,
    method: base.method,
    assetsTotal: base.assetsTotal,
    debtsTotal: base.debtsTotal,
    netWorth: Math.max(base.assetsTotal - base.debtsTotal, 0),
    taxFreeAllowance: base.taxFreeAllowance,
    taxableBase: base.taxableBase,
    taxableDeemedReturn: base.taxableDeemedReturn,
    actualReturn: base.actualReturn,
    actualReturnComponentsProvided: base.actualReturnComponentsProvided,
    box3Tax: base.box3Tax,
    effectiveTaxRateOnNetWorth: base.effectiveTaxRateOnNetWorth,
    rates: {
      taxRate: constants.box3.taxRate,
      deemedReturnBankDeposits: constants.box3.deemedReturns.bankDeposits,
      deemedReturnInvestments: constants.box3.deemedReturns.investmentsAndOtherAssets,
      deemedReturnDebts: constants.box3.deemedReturns.debts,
    },
    meta: {
      sourceLabel: constants.box3.meta.sourceLabel,
      lastChecked: constants.box3.meta.lastChecked,
      status: constants.box3.meta.status,
    },
    warnings: base.warnings,
    planning: {
      horizonYears: planning.points.length,
      monthlyContributionByCategory: planning.monthlyContributionByCategory,
      totalMonthlyContribution: planning.totalMonthlyContribution,
      totalContributions: planning.totalContributions,
      endingBankDeposits: planning.endingBankDeposits,
      endingInvestmentsAndOtherAssets: planning.endingInvestmentsAndOtherAssets,
      endingTotalAssets: planning.endingTotalAssets,
      endingBox3Tax: planningTax.box3Tax,
      points: planning.points,
    },
  };
}
