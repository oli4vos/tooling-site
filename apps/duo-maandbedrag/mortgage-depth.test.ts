import { describe, expect, it } from "vitest";
import { createDuoDebtPartFormValue } from "@/lib/duo/debt-parts-form";
import { calculateHypotheekImpact } from "../hypotheek-impact-studieschuld/logic";
import { calculateDuoMonthlyPaymentView } from "./logic";
import {
  calculateMortgageDepthView,
  validateMortgageDepthForm,
} from "./mortgage-depth";

function createDuoView() {
  return calculateDuoMonthlyPaymentView(
    {
      remainingDebt: "42000",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      assessmentIncome: "",
      householdSituation: "single",
    },
    { annualInterestRate: 2.33, remainingTermYears: 35 },
  );
}

describe("DUO mortgage depth adapter", () => {
  it("reuses the completed DUO values and asks only for missing mortgage income", () => {
    const duoView = createDuoView();
    const calculation = calculateMortgageDepthView(
      duoView,
      { grossIncomeUser: "65000", grossIncomePartner: "15000" },
      { mortgageRate: 4, mortgageTermYears: 30 },
    );

    expect(calculation.errors).toEqual({});
    expect(calculation.view?.input).toMatchObject({
      remainingStudentDebt: 42000,
      repaymentRule: "SF35",
      statutoryMonthlyPayment:
        duoView.isValid ? duoView.statutoryMonthlyPayment : undefined,
      duoInterestRate: 2.33,
      duoRateYear: 2026,
      remainingTermYears: 35,
      grossIncomeUser: 65000,
      grossIncomePartner: 15000,
      mortgageRate: 4,
      mortgageTermYears: 30,
    });
  });

  it("returns exactly the existing mortgage use-case result", () => {
    const duoView = createDuoView();
    const calculation = calculateMortgageDepthView(
      duoView,
      { grossIncomeUser: "65000", grossIncomePartner: "" },
      { mortgageRate: 4, mortgageTermYears: 30 },
    );
    if (!calculation.view) throw new Error("expected mortgage depth view");

    const directResult = calculateHypotheekImpact(calculation.view.input);
    expect(calculation.view.result).toEqual(directResult);
    expect(calculation.view.result.duoPayment.statutoryMonthlyPayment).toBe(
      directResult.duoPayment.statutoryMonthlyPayment,
    );
    expect(calculation.view.result.mortgageImpact.bruteringFactor).toBe(
      directResult.mortgageImpact.bruteringFactor,
    );
    expect(calculation.view.maxMortgageWithoutStudentDebt).toBe(
      directResult.incomeCapacity.incomeBasedMaxMortgageIndicative,
    );
    expect(calculation.view.maxMortgageWithStudentDebt).toBe(
      directResult.incomeCapacity.incomeBasedMaxMortgageWithStudentDebtIndicative,
    );
    expect(calculation.view.mortgageDifference).toBe(
      directResult.mortgageImpact.principalImpact,
    );
    expect(calculation.view.mortgageDifference).toBeCloseTo(
      calculation.view.maxMortgageWithoutStudentDebt -
        calculation.view.maxMortgageWithStudentDebt,
      2,
    );
  });

  it("does not mutate the completed DUO result", () => {
    const duoView = createDuoView();
    const before = structuredClone(duoView);

    calculateMortgageDepthView(
      duoView,
      { grossIncomeUser: "65000", grossIncomePartner: "" },
      { mortgageRate: 4, mortgageTermYears: 30 },
    );

    expect(duoView).toEqual(before);
  });

  it("blocks missing or invalid income before calling the mortgage calculation", () => {
    expect(
      validateMortgageDepthForm({ grossIncomeUser: "", grossIncomePartner: "" }),
    ).toHaveProperty("grossIncomeUser");
    expect(
      validateMortgageDepthForm({ grossIncomeUser: "50000", grossIncomePartner: "-1" }),
    ).toHaveProperty("grossIncomePartner");
  });
});
