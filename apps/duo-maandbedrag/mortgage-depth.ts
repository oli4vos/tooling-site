import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { parseOptionalDecimalInput, parseRequiredDecimalInput } from "@/lib/number-input";
import {
  calculateHypotheekImpact,
  type HypotheekImpactInput,
  type HypotheekImpactResult,
} from "../hypotheek-impact-studieschuld/logic";
import type { DuoMonthlyPaymentView } from "./logic";

export type MortgageDepthFormValues = {
  grossIncomeUser: string;
  grossIncomePartner: string;
};

export type MortgageDepthErrors = Partial<Record<keyof MortgageDepthFormValues, string>>;

export type MortgageDepthContext = {
  mortgageRate?: number;
  mortgageTermYears?: number;
};

export type MortgageDepthView = {
  input: HypotheekImpactInput;
  result: HypotheekImpactResult;
  maxMortgageWithoutStudentDebt: number;
  maxMortgageWithStudentDebt: number;
  mortgageDifference: number;
  sourceReferences: Array<{ name: string; url: string | null }>;
};

export function createMortgageDepthDefaultValues(): MortgageDepthFormValues {
  return {
    grossIncomeUser: "",
    grossIncomePartner: "",
  };
}

export function validateMortgageDepthForm(
  values: MortgageDepthFormValues,
): MortgageDepthErrors {
  const errors: MortgageDepthErrors = {};
  const grossIncomeUser = parseRequiredDecimalInput(values.grossIncomeUser);
  const grossIncomePartner = parseOptionalDecimalInput(values.grossIncomePartner);

  if (!Number.isFinite(grossIncomeUser) || grossIncomeUser <= 0) {
    errors.grossIncomeUser = "Vul je bruto jaarinkomen in met een bedrag hoger dan 0.";
  }
  if (
    grossIncomePartner !== undefined &&
    (!Number.isFinite(grossIncomePartner) || grossIncomePartner < 0)
  ) {
    errors.grossIncomePartner = "Gebruik 0 of een hoger bruto jaarinkomen van je partner.";
  }

  return errors;
}

export function calculateMortgageDepthView(
  duoView: DuoMonthlyPaymentView,
  values: MortgageDepthFormValues,
  context: MortgageDepthContext = {},
): { errors: MortgageDepthErrors; view?: MortgageDepthView } {
  const errors = validateMortgageDepthForm(values);
  if (!duoView.isValid || Object.keys(errors).length > 0) {
    return { errors };
  }

  const constants = getFinancialConstants(getDefaultFinancialYear());
  const mortgageRate = context.mortgageRate ?? constants.mortgage.defaultMortgageRate;
  const mortgageTermYears =
    context.mortgageTermYears ?? constants.mortgage.defaultMortgageTermYears;
  const input: HypotheekImpactInput = {
    situation: duoView.incomeBased ? "incomeBasedReduction" : "repaying",
    repaymentRule: duoView.repaymentRule,
    actualMonthlyPayment:
      duoView.duoMonthlyPaymentUsed ?? duoView.statutoryMonthlyPayment,
    statutoryMonthlyPayment: duoView.statutoryMonthlyPayment,
    remainingStudentDebt: duoView.remainingDebt,
    duoInterestRate: duoView.annualInterestRate,
    duoRateYear: duoView.duoRateYear,
    duoDebtParts: duoView.debtPortfolio.usesDebtParts
      ? duoView.debtPortfolio.parts.map((part) => ({
          remainingDebt: part.remainingDebt,
          rateYear: part.rateYear,
        }))
      : undefined,
    remainingTermYears: duoView.termYears,
    grossIncomeUser: parseRequiredDecimalInput(values.grossIncomeUser),
    grossIncomePartner: parseOptionalDecimalInput(values.grossIncomePartner) ?? 0,
    mortgageRate,
    mortgageTermYears,
  };
  const result = calculateHypotheekImpact(input);

  return {
    errors,
    view: {
      input,
      result,
      maxMortgageWithoutStudentDebt:
        result.incomeCapacity.incomeBasedMaxMortgageIndicative,
      maxMortgageWithStudentDebt:
        result.incomeCapacity.incomeBasedMaxMortgageWithStudentDebtIndicative,
      mortgageDifference: result.mortgageImpact.principalImpact,
      sourceReferences: [
        {
          name: constants.duo.meta.sourceLabel,
          url: constants.duo.meta.sourceUrl,
        },
        {
          name: constants.mortgage.meta.sourceLabel,
          url: constants.mortgage.meta.sourceUrl,
        },
      ],
    },
  };
}
