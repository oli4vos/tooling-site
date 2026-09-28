export { calculateBox1Tax } from "@/lib/tax/box1";
export { calculateBox3Tax } from "@/lib/tax/box3";
export { calculateMortgageInterestDeduction } from "@/lib/tax/mortgage-interest-deduction";
export {
  calculateOwnHomeResult,
  calculateOwnHomeTaxAssessment,
} from "@/lib/tax/own-home";
export type {
  OwnHomeAllocationMode,
  OwnHomeAowStatus,
  OwnHomeInput,
  OwnHomeQualification,
  OwnHomeResult,
  OwnHomeTaxAssessmentInput,
  OwnHomeTaxAssessmentResult,
  OwnHomeTaxpayerInput,
} from "@/lib/tax/own-home";
export { calculateZvw } from "@/lib/tax/zvw";
export type {
  Box1IncomeInput,
  Box1TaxResult,
  Box3Method,
  Box3Input,
  Box3Result,
  MortgageInterestDeductionInput,
  MortgageInterestDeductionResult,
  TaxYear,
  ZvwInput,
  ZvwLine,
  ZvwMode,
  ZvwResult,
} from "@/lib/tax/types";
