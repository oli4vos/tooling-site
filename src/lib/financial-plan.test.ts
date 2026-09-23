import { describe, expect, it } from "vitest";
import { calculateFinancialPlan } from "./financial-plan";

describe("calculateFinancialPlan", () => {
  it("keeps savings and investments separate while projecting a total", () => {
    const result = calculateFinancialPlan({
      year: 2026,
      currentSavings: 10_000,
      currentInvestments: 20_000,
      monthlySavingsContribution: 100,
      monthlyInvestmentsContribution: 400,
      expectedSavingsReturn: 2,
      expectedInvestmentsReturn: 6,
      horizonYears: 10,
    });
    expect(result.endingSavings).toBeGreaterThan(10_000);
    expect(result.endingInvestments).toBeGreaterThan(result.endingSavings);
    expect(result.endingAssets).toBeCloseTo(result.endingSavings + result.endingInvestments, 2);
    expect(result.totalMonthlyContribution).toBe(500);
  });

  it("calculates an optional FIRE target without creating a false target for missing expenses", () => {
    expect(calculateFinancialPlan({ annualExpenses: 30_000, withdrawalRate: 4 }).fireTarget).toBe(750_000);
    expect(calculateFinancialPlan({}).fireTarget).toBeNull();
  });
});
