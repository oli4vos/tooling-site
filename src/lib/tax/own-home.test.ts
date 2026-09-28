import { describe, expect, it } from "vitest";
import { calculateOwnHomeResult, calculateOwnHomeTaxAssessment } from "./own-home";

const qualifiedHome = {
  wozValue: 280_000,
  mortgageInterestPaid: 9_000,
  qualification: {
    qualifiesAsMainResidence: true,
    loanStartYear: 2020,
    repaymentCompliant: true,
    loanReportedToTaxAuthority: true,
    remainingDeductionYears: 24,
  },
};

describe("own-home tax engine", () => {
  it("calculates 2026 eigenwoningforfait and a qualifying home balance", () => {
    const result = calculateOwnHomeResult({ ...qualifiedHome, year: 2026 });

    expect(result.eigenwoningforfait).toBe(980);
    expect(result.eligibleMortgageInterest).toBe(9_000);
    expect(result.balanceAfterHillen).toBe(-8_020);
    expect(result.qualifiesForDeduction).toBe(true);
  });

  it("does not deduct costs until the own-home qualification is confirmed", () => {
    const result = calculateOwnHomeResult({
      ...qualifiedHome,
      qualification: { qualifiesAsMainResidence: false },
      year: 2026,
    });

    expect(result.eligibleCosts).toBe(0);
    expect(result.balanceAfterHillen).toBeCloseTo(275.7, 2);
    expect(result.warnings.join(" ")).toContain("eigen woning");
  });

  it("keeps Zvw separate while including the general-credit effect in the Box 1 comparison", () => {
    const result = calculateOwnHomeTaxAssessment({
      year: 2026,
      ownHome: qualifiedHome,
      taxpayers: [{
        id: "persoon-1",
        box1IncomeBeforeOwnHome: 50_000,
        labourIncome: 50_000,
        zvwLines: [{ incomeCents: 5_000_000, mode: "employee" }],
      }],
    });
    const taxpayer = result.taxpayers[0];

    expect(result.household.ownHomeTaxBenefit).toBeGreaterThan(8_020 * 0.3756);
    expect(taxpayer.creditEffectOfOwnHome).toBeGreaterThan(0);
    expect(taxpayer.zvwIsAffectedByOwnHome).toBe(false);
    expect(result.household.zvwEffect).toBe(0);
  });

  it("finds a partner allocation that is no worse than an equal split", () => {
    const base = {
      year: 2026 as const,
      ownHome: qualifiedHome,
      taxpayers: [
        { id: "a", box1IncomeBeforeOwnHome: 35_000, labourIncome: 35_000 },
        { id: "b", box1IncomeBeforeOwnHome: 90_000, labourIncome: 90_000 },
      ] as [{ id: string; box1IncomeBeforeOwnHome: number; labourIncome: number }, { id: string; box1IncomeBeforeOwnHome: number; labourIncome: number }],
    };
    const equal = calculateOwnHomeTaxAssessment({ ...base, allocation: { mode: "equal" } });
    const optimised = calculateOwnHomeTaxAssessment({ ...base, allocation: { mode: "optimise" } });

    expect(optimised.household.taxWithOwnHome).toBeLessThanOrEqual(equal.household.taxWithOwnHome);
    expect(optimised.household.ownHomeTaxBenefit).toBeGreaterThanOrEqual(equal.household.ownHomeTaxBenefit);
  });

  it("applies the high-income deduction cap as a correction", () => {
    const result = calculateOwnHomeTaxAssessment({
      year: 2026,
      ownHome: { ...qualifiedHome, wozValue: 0, mortgageInterestPaid: 10_000 },
      taxpayers: [{ id: "persoon-1", box1IncomeBeforeOwnHome: 100_000, labourIncome: 100_000 }],
    });

    expect(result.taxpayers[0].ownHomeTariffAdjustment).toBeCloseTo(1_194, 2);
    expect(result.household.ownHomeTaxBenefit).toBeCloseTo(3_756, 2);
  });
});
