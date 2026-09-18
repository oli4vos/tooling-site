import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateFutureValueLumpSum,
  calculatePensionContributionScenario,
  sanitizePensionMoney,
  sanitizePensionPercent,
  sanitizePensionYears,
} from "@/lib/pension";
import { calculateBox1Tax, calculateBox3Tax } from "@/lib/tax";

export type JaarruimteVsVrijBeleggenInput = {
  year?: number;
  grossAnnualIncome?: number;
  taxableIncome?: number;
  availableJaarruimte?: number;
  plannedContribution?: number;
  currentInvestableAssets?: number;
  hasFiscalPartner?: boolean;
  expectedAnnualReturn?: number;
  horizonYears?: number;
  overrideCurrentTaxRate?: number;
  expectedTaxRateAtPayout?: number;
  includeBox3Effect?: boolean;
};

export type JaarruimteVsVrijBeleggenResult = {
  year: number;
  usedTaxableIncome: number;
  contributionRequested: number;
  contributionEligibleForJaarruimte: number;
  contributionOutsideJaarruimte: number;
  expectedAnnualReturn: number;
  horizonYears: number;
  currentTaxRateUsed: number;
  expectedTaxRateAtPayoutUsed?: number;
  scenarioPension: {
    contribution: number;
    taxBenefitNow: number;
    netCostNow: number;
    futureValueGross: number;
    estimatedTaxAtPayout?: number;
    futureValueNetIndicative: number;
  };
  scenarioFreeInvesting: {
    contribution: number;
    futureValueGross: number;
    additionalBox3TaxIndicative?: number;
    futureValueNetIndicative: number;
  };
  comparison: {
    netDifferencePensionMinusInvesting: number;
    headline: string;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
    box3TaxRate: number;
  };
  warnings: string[];
  guidance: string[];
  wealthPlanning: {
    points: Array<{
      year: number;
      pensionGross: number;
      pensionNetIndicative: number;
      investingGrossWithoutBox3: number;
      investingNetAfterBox3: number;
      box3TaxThisYear: number;
      cumulativeBox3Tax: number;
    }>;
    totalBox3TaxPaid: number;
    endInvestingWithoutBox3: number;
    endInvestingAfterBox3: number;
  };
};

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

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function chooseHeadline(netDiff: number) {
  if (netDiff > 0) {
    return "De berekende netto eindwaarde van pensioeninleg is in dit scenario hoger.";
  }

  if (netDiff < 0) {
    return "De berekende netto eindwaarde van vrij beleggen is in dit scenario hoger.";
  }

  return "De berekende netto eindwaarden zijn in dit scenario gelijk.";
}

function buildWealthPlanning(input: {
  year: number;
  contributionEligibleForJaarruimte: number;
  freeInvestingContribution: number;
  currentInvestableAssets: number;
  hasFiscalPartner: boolean;
  expectedAnnualReturn: number;
  horizonYears: number;
  expectedTaxRateAtPayout?: number;
  includeBox3Effect: boolean;
}) {
  const points: JaarruimteVsVrijBeleggenResult["wealthPlanning"]["points"] = [];
  const growthFactor = 1 + input.expectedAnnualReturn / 100;
  const payoutTaxFactor =
    input.expectedTaxRateAtPayout !== undefined
      ? Math.max(1 - input.expectedTaxRateAtPayout / 100, 0)
      : 1;

  let investingWithoutBox3 = input.freeInvestingContribution;
  let investingAfterBox3 = input.freeInvestingContribution;
  let cumulativeBox3Tax = 0;

  for (let yearIndex = 1; yearIndex <= input.horizonYears; yearIndex += 1) {
    const pensionGross = roundMoney(
      calculateFutureValueLumpSum(
        input.contributionEligibleForJaarruimte,
        input.expectedAnnualReturn,
        yearIndex,
      ),
    );
    const pensionNetIndicative = roundMoney(pensionGross * payoutTaxFactor);

    investingWithoutBox3 = roundMoney(investingWithoutBox3 * growthFactor);
    const investingBeforeTax = roundMoney(investingAfterBox3 * growthFactor);

    let box3TaxThisYear = 0;
    if (input.includeBox3Effect) {
      const baseBox3 = calculateBox3Tax({
        year: input.year,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "forfaitary",
        bankDeposits: 0,
        investmentsAndOtherAssets: input.currentInvestableAssets,
        debts: 0,
      });
      const scenarioBox3 = calculateBox3Tax({
        year: input.year,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "forfaitary",
        bankDeposits: 0,
        investmentsAndOtherAssets:
          input.currentInvestableAssets + investingBeforeTax,
        debts: 0,
      });
      box3TaxThisYear = roundMoney(
        Math.max(scenarioBox3.box3Tax - baseBox3.box3Tax, 0),
      );
    }

    cumulativeBox3Tax = roundMoney(cumulativeBox3Tax + box3TaxThisYear);
    investingAfterBox3 = roundMoney(Math.max(investingBeforeTax - box3TaxThisYear, 0));

    points.push({
      year: yearIndex,
      pensionGross,
      pensionNetIndicative,
      investingGrossWithoutBox3: investingWithoutBox3,
      investingNetAfterBox3: investingAfterBox3,
      box3TaxThisYear,
      cumulativeBox3Tax,
    });
  }

  return {
    points,
    totalBox3TaxPaid: roundMoney(cumulativeBox3Tax),
    endInvestingWithoutBox3: roundMoney(investingWithoutBox3),
    endInvestingAfterBox3: roundMoney(investingAfterBox3),
  };
}

export function calculateJaarruimteVsVrijBeleggen(
  input: JaarruimteVsVrijBeleggenInput,
): JaarruimteVsVrijBeleggenResult {
  const year = sanitizeYear(input.year);
  const constants = getFinancialConstants(year);
  const grossAnnualIncome = sanitizePensionMoney(input.grossAnnualIncome);
  const taxableIncomeInput = sanitizePensionMoney(input.taxableIncome);
  const usedTaxableIncome = taxableIncomeInput > 0 ? taxableIncomeInput : grossAnnualIncome;
  const availableJaarruimte = sanitizePensionMoney(input.availableJaarruimte);
  const contributionRequested = sanitizePensionMoney(input.plannedContribution);
  const contributionEligibleForJaarruimte = Math.min(
    contributionRequested,
    availableJaarruimte,
  );
  const contributionOutsideJaarruimte = roundMoney(
    Math.max(contributionRequested - contributionEligibleForJaarruimte, 0),
  );
  const expectedAnnualReturn = sanitizePensionPercent(input.expectedAnnualReturn) ?? 5;
  const horizonYears = sanitizePensionYears(input.horizonYears);
  const includeBox3Effect = Boolean(input.includeBox3Effect);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);
  const currentInvestableAssets = sanitizePensionMoney(input.currentInvestableAssets);

  const box1Result = calculateBox1Tax({
    taxableIncome: usedTaxableIncome,
    year,
  });
  const derivedCurrentTaxRate = box1Result.marginalRate;
  const overrideCurrentTaxRate = sanitizePensionPercent(input.overrideCurrentTaxRate);
  const currentTaxRateUsed = roundPercent(
    overrideCurrentTaxRate ?? derivedCurrentTaxRate,
  );
  const expectedTaxRateAtPayout = sanitizePensionPercent(input.expectedTaxRateAtPayout);
  const pensionScenario = calculatePensionContributionScenario({
    contribution: contributionEligibleForJaarruimte,
    annualReturnPercent: expectedAnnualReturn,
    horizonYears,
    currentTaxRatePercent: currentTaxRateUsed,
    payoutTaxRatePercent: expectedTaxRateAtPayout,
  });
  const freeInvestingContribution = roundMoney(pensionScenario.netCostNow);

  const freeInvestingFutureValueGross = calculateFutureValueLumpSum(
    freeInvestingContribution,
    expectedAnnualReturn,
    horizonYears,
  );

  const wealthPlanning = buildWealthPlanning({
    year,
    contributionEligibleForJaarruimte,
    freeInvestingContribution,
    currentInvestableAssets,
    hasFiscalPartner,
    expectedAnnualReturn,
    horizonYears,
    expectedTaxRateAtPayout,
    includeBox3Effect,
  });
  const additionalBox3TaxIndicative = includeBox3Effect
    ? wealthPlanning.points.at(-1)?.box3TaxThisYear ?? 0
    : undefined;

  const freeInvestingFutureValueNetIndicative = roundMoney(
    includeBox3Effect
      ? wealthPlanning.endInvestingAfterBox3
      : Math.max(freeInvestingFutureValueGross, 0),
  );

  const netDifferencePensionMinusInvesting = roundMoney(
    pensionScenario.futureValueNetIndicative - freeInvestingFutureValueNetIndicative,
  );

  const warnings = [
    "Deze tool is indicatief en geen officiële pensioen- of aangifteberekening.",
    "De tool berekent je jaarruimte niet. Vul het bedrag in uit het officiële hulpmiddel van de Belastingdienst; jaarruimte 2026 is gebaseerd op je situatie in 2025.",
    "Het berekende box 1-voordeel gebruikt je marginale schijftarief en houdt geen rekening met heffingskortingen of alle persoonlijke aftrekposten.",
    "Pensioen/lijfrente kan fiscaal voordeel geven, maar geld staat meestal vast tot pensioendatum.",
  ];
  if (includeBox3Effect) {
    warnings.push(
      "Het box 3-effect gebruikt elk toekomstig jaar opnieuw de voorlopige forfaitaire regels van 2026. Dit is een scenario en geen voorspelling van toekomstige wetgeving.",
    );
  }
  for (const pensionWarning of pensionScenario.warnings) {
    if (!warnings.includes(pensionWarning)) {
      warnings.push(pensionWarning);
    }
  }

  const guidance = [
    "De vergelijking gebruikt voor beide routes hetzelfde netto budget en hetzelfde verwachte rendement.",
    "Pensioeninleg is doorgaans niet tussentijds vrij opneembaar; vrij belegd vermogen meestal wel.",
    "Een onbekend belastingtarief bij uitkering wordt niet automatisch geschat; vul dit in om die belasting mee te nemen.",
  ];

  return {
    year,
    usedTaxableIncome: roundMoney(usedTaxableIncome),
    contributionRequested,
    contributionEligibleForJaarruimte,
    contributionOutsideJaarruimte,
    expectedAnnualReturn,
    horizonYears,
    currentTaxRateUsed,
    expectedTaxRateAtPayoutUsed: expectedTaxRateAtPayout,
    scenarioPension: {
      contribution: contributionEligibleForJaarruimte,
      taxBenefitNow: pensionScenario.taxBenefitNow,
      netCostNow: pensionScenario.netCostNow,
      futureValueGross: pensionScenario.futureValueGross,
      estimatedTaxAtPayout: pensionScenario.estimatedTaxAtPayout,
      futureValueNetIndicative: pensionScenario.futureValueNetIndicative,
    },
    scenarioFreeInvesting: {
      contribution: freeInvestingContribution,
      futureValueGross: roundMoney(freeInvestingFutureValueGross),
      additionalBox3TaxIndicative,
      futureValueNetIndicative: freeInvestingFutureValueNetIndicative,
    },
    comparison: {
      netDifferencePensionMinusInvesting,
      headline: chooseHeadline(netDifferencePensionMinusInvesting),
    },
    assumptions: {
      sourceLabel: constants.box1.meta.sourceLabel,
      lastChecked: constants.box1.meta.lastChecked,
      status: constants.box1.meta.status,
      box3TaxRate: constants.box3.taxRate,
    },
    warnings,
    guidance,
    wealthPlanning,
  };
}
