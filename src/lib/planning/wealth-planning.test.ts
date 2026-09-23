import { describe, expect, it } from "vitest";
import { projectWealthPlan } from "./wealth-planning";

describe("shared wealth planning", () => {
  it("keeps monthly contributions separate by asset category", () => {
    const result = projectWealthPlan({
      startBankDeposits: 10_000,
      startInvestmentsAndOtherAssets: 20_000,
      monthlyBankDepositsContribution: 100,
      monthlyInvestmentsContribution: 300,
      expectedBankDepositsReturn: 2,
      expectedInvestmentsReturn: 6,
      horizonYears: 1,
    });

    expect(result.monthlyContributionByCategory).toEqual({
      bankDeposits: 100,
      investmentsAndOtherAssets: 300,
    });
    expect(result.totalContributions).toBe(4_800);
    expect(result.endingInvestmentsAndOtherAssets).toBeGreaterThan(result.endingBankDeposits);
  });

  it("uses end-of-month contributions and caps the planning horizon", () => {
    const result = projectWealthPlan({
      startBankDeposits: 0,
      startInvestmentsAndOtherAssets: 0,
      monthlyInvestmentsContribution: 100,
      expectedInvestmentsReturn: 0,
      horizonYears: 100,
    });

    expect(result.points).toHaveLength(60);
    expect(result.endingTotalAssets).toBe(72_000);
  });
});
