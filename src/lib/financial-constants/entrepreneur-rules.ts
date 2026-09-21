import { TAX_PROPOSALS, TAX_PROPOSAL_SOURCE } from "./tax-proposals";
export const ENTREPRENEUR_RULES = {
  version:TAX_PROPOSALS.version,
  sourceUrl:"https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/ondernemersaftrek_en_investeringsaftrek",
  proposalSourceUrl:TAX_PROPOSAL_SOURCE,
  locator:"Ondernemersaftrek 2026; Belastingplan 2027 §5.5 en artikelen I G, II C en III F",
  lastVerifiedAt:"2026-09-18",nextReviewAt:"2026-10-01",
  hours:1225, disabilityHours:800, historyYears:5, maximumPriorUses:2,
  mkbPpm:127000,
  selfDeductionCents:{2026:120000,2027:90000,2028:90000,2029:90000},
  disabilityCents:[1200000,800000,400000],
  disabilityEnds:"2029-01-01",arbitraryDepreciationEnds:"2028-01-01",
  // 2028–29 retain the separately identified 2027 parameters as a scenario,
  // not a claim that future indexed values have already been established.
  futureAssumption:"Voor 2028–2029 blijven zelfstandigenaftrek en MKB-percentage in dit scenario op het 2027-niveau; geen definitieve toekomstige jaarberekening.",
};
