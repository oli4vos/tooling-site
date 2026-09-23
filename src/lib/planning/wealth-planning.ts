export type WealthCategory = "bankDeposits" | "investmentsAndOtherAssets";

export type WealthProjectionInput = {
  startBankDeposits: number;
  startInvestmentsAndOtherAssets: number;
  monthlyBankDepositsContribution?: number;
  monthlyInvestmentsContribution?: number;
  expectedBankDepositsReturn?: number;
  expectedInvestmentsReturn?: number;
  horizonYears: number;
};

export type WealthProjectionPoint = {
  yearIndex: number;
  bankDeposits: number;
  investmentsAndOtherAssets: number;
  totalAssets: number;
  contributedThisYear: number;
  cumulativeContributions: number;
  growthThisYear: number;
};

export type WealthProjectionResult = {
  points: WealthProjectionPoint[];
  monthlyContributionByCategory: Record<WealthCategory, number>;
  totalMonthlyContribution: number;
  totalContributions: number;
  endingBankDeposits: number;
  endingInvestmentsAndOtherAssets: number;
  endingTotalAssets: number;
};

function nonNegative(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(value as number, 0) : 0;
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function boundedYears(value: number) {
  return Math.min(Math.max(Math.round(value), 1), 60);
}

/**
 * Shared end-of-month contribution model for wealth planning.
 * Tax is deliberately not calculated here; callers apply the relevant tax layer.
 */
export function projectWealthPlan(input: WealthProjectionInput): WealthProjectionResult {
  const monthlyBankDepositsContribution = roundMoney(nonNegative(input.monthlyBankDepositsContribution));
  const monthlyInvestmentsContribution = roundMoney(nonNegative(input.monthlyInvestmentsContribution));
  const bankRate = nonNegative(input.expectedBankDepositsReturn) / 100 / 12;
  const investmentRate = nonNegative(input.expectedInvestmentsReturn) / 100 / 12;
  const years = boundedYears(input.horizonYears);
  let bankDeposits = roundMoney(nonNegative(input.startBankDeposits));
  let investmentsAndOtherAssets = roundMoney(nonNegative(input.startInvestmentsAndOtherAssets));
  let cumulativeContributions = 0;
  const points: WealthProjectionPoint[] = [];

  for (let yearIndex = 1; yearIndex <= years; yearIndex += 1) {
    const startTotal = bankDeposits + investmentsAndOtherAssets;
    const annualContribution = (monthlyBankDepositsContribution + monthlyInvestmentsContribution) * 12;
    for (let month = 0; month < 12; month += 1) {
      bankDeposits = (bankDeposits + monthlyBankDepositsContribution) * (1 + bankRate);
      investmentsAndOtherAssets = (investmentsAndOtherAssets + monthlyInvestmentsContribution) * (1 + investmentRate);
    }
    bankDeposits = roundMoney(bankDeposits);
    investmentsAndOtherAssets = roundMoney(investmentsAndOtherAssets);
    cumulativeContributions = roundMoney(cumulativeContributions + annualContribution);
    const totalAssets = roundMoney(bankDeposits + investmentsAndOtherAssets);
    const growthThisYear = roundMoney(totalAssets - startTotal - annualContribution);
    points.push({
      yearIndex,
      bankDeposits,
      investmentsAndOtherAssets,
      totalAssets,
      contributedThisYear: roundMoney(annualContribution),
      cumulativeContributions,
      growthThisYear,
    });
  }

  const last = points.at(-1);
  return {
    points,
    monthlyContributionByCategory: {
      bankDeposits: monthlyBankDepositsContribution,
      investmentsAndOtherAssets: monthlyInvestmentsContribution,
    },
    totalMonthlyContribution: roundMoney(monthlyBankDepositsContribution + monthlyInvestmentsContribution),
    totalContributions: cumulativeContributions,
    endingBankDeposits: last?.bankDeposits ?? roundMoney(nonNegative(input.startBankDeposits)),
    endingInvestmentsAndOtherAssets: last?.investmentsAndOtherAssets ?? roundMoney(nonNegative(input.startInvestmentsAndOtherAssets)),
    endingTotalAssets: last?.totalAssets ?? roundMoney(nonNegative(input.startBankDeposits) + nonNegative(input.startInvestmentsAndOtherAssets)),
  };
}
