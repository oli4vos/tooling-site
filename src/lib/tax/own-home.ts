import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { INCOME_RULES } from "@/lib/financial-constants/income-comparison-rules";
import { calculateZvw } from "@/lib/tax/zvw";
import { calculateProgressiveTaxCents } from "./progressive-tax";
import { taxRate } from "./money";
import type { ZvwLine } from "./types";

export type OwnHomeAowStatus = "none" | "full" | "before1946" | "transition";

export type OwnHomeQualification = {
  qualifiesAsMainResidence?: boolean;
  loanStartYear?: number;
  repaymentCompliant?: boolean;
  loanReportedToTaxAuthority?: boolean;
  remainingDeductionYears?: number;
  hasHillenException?: boolean;
};

export type OwnHomeInput = {
  year?: number;
  wozValue: number;
  daysAsMainResidence?: number;
  propertyIncome?: number;
  mortgageInterestPaid?: number;
  otherDeductibleCosts?: number;
  qualification: OwnHomeQualification;
};

export type OwnHomeResult = {
  year: number;
  eigenwoningforfait: number;
  propertyIncome: number;
  eligibleMortgageInterest: number;
  eligibleOtherCosts: number;
  eligibleCosts: number;
  balanceBeforeHillen: number;
  hillenDeduction: number;
  balanceAfterHillen: number;
  qualifiesForDeduction: boolean;
  warnings: string[];
};

export type OwnHomeTaxpayerInput = {
  id: string;
  /** Box 1 income before the assigned own-home balance. */
  box1IncomeBeforeOwnHome: number;
  /** Wage/profit used solely for labour credit and IACK. */
  labourIncome?: number;
  /** Box 2/3 and other combined-income components relevant to credit phase-out. */
  combinedIncomeOutsideBox1?: number;
  aow?: OwnHomeAowStatus;
  iackEligible?: boolean;
  singleElderly?: boolean;
  disabled?: boolean;
  zvwLines?: ZvwLine[];
};

export type OwnHomeAllocationMode = "optimise" | "equal" | "manual";

export type OwnHomeTaxAssessmentInput = {
  year?: number;
  ownHome: OwnHomeInput;
  taxpayers: [OwnHomeTaxpayerInput] | [OwnHomeTaxpayerInput, OwnHomeTaxpayerInput];
  allocation?: {
    mode?: OwnHomeAllocationMode;
    firstTaxpayerShare?: number;
  };
};

export type OwnHomeTaxpayerAssessment = {
  id: string;
  allocatedOwnHomeBalance: number;
  taxableBox1Income: number;
  combinedIncomeForCredits: number;
  grossBox1Tax: number;
  ownHomeTariffAdjustment: number;
  generalCredit: number;
  labourCredit: number;
  iack: number;
  elderlyCredit: number;
  singleElderlyCredit: number;
  disabledCredit: number;
  totalCredits: number;
  finalBox1Tax: number;
  zvw: number;
  zvwIsAffectedByOwnHome: false;
  taxWithoutOwnHome: number;
  creditEffectOfOwnHome: number;
  ownHomeTaxBenefit: number;
};

export type OwnHomeTaxAssessmentResult = {
  year: number;
  ownHome: OwnHomeResult;
  allocationMode: OwnHomeAllocationMode;
  allocation: Array<{ id: string; share: number; assignedBalance: number }>;
  taxpayers: OwnHomeTaxpayerAssessment[];
  household: {
    taxWithoutOwnHome: number;
    taxWithOwnHome: number;
    ownHomeTaxBenefit: number;
    zvw: number;
    zvwEffect: 0;
    estimatedToetsingsinkomenChange: number;
  };
  warnings: string[];
};

function money(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(value as number, 0) : 0;
}

function signedMoney(value: number | undefined) {
  return Number.isFinite(value) ? (value as number) : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundCents(value: number) {
  return Math.round(value * 100);
}

function toEuro(value: number) {
  return roundMoney(value / 100);
}

function rateCents(amountCents: number, ratePercent: number) {
  return taxRate(Math.max(amountCents, 0), Math.round(ratePercent * 10_000));
}

function getOwnHomeForfait(input: { wozValue: number; days: number; year: number }) {
  const rules = getFinancialConstants(input.year).box1.ownHome;
  const wozValue = money(input.wozValue);
  const band = rules.forfaitBands.find((candidate) => candidate.upTo === null || wozValue <= candidate.upTo)
    ?? rules.forfaitBands[rules.forfaitBands.length - 1];
  if (!band) return 0;
  const annual = band.excessRate !== undefined && band.baseAmount !== undefined
    ? band.baseAmount + Math.max(wozValue - 1_330_000, 0) * (band.excessRate / 100)
    : wozValue * (band.rate / 100);
  return roundMoney(annual * (input.days / 365));
}

export function calculateOwnHomeResult(input: OwnHomeInput): OwnHomeResult {
  const year = input.year ?? getDefaultFinancialYear();
  const rules = getFinancialConstants(year).box1.ownHome;
  const days = Math.min(Math.max(Math.round(input.daysAsMainResidence ?? 365), 0), 365);
  const qualification = input.qualification ?? {};
  const loanStartYear = qualification.loanStartYear;
  const requiresRepaymentTest = loanStartYear === undefined || loanStartYear >= 2013;
  const hasRemainingYears = qualification.remainingDeductionYears === undefined || qualification.remainingDeductionYears > 0;
  const qualifiesForDeduction = qualification.qualifiesAsMainResidence === true
    && hasRemainingYears
    && (!requiresRepaymentTest || (
      qualification.repaymentCompliant === true
      && qualification.loanReportedToTaxAuthority === true
    ));
  const warnings: string[] = [];

  if (qualification.qualifiesAsMainResidence !== true) {
    warnings.push("Bevestig dat dit de eigen woning is; zonder die bevestiging is geen renteaftrek meegenomen.");
  }
  if (requiresRepaymentTest && qualification.repaymentCompliant !== true) {
    warnings.push("Voor een lening vanaf 2013 moet je de annuïtaire of lineaire aflossingsverplichting bevestigen.");
  }
  if (requiresRepaymentTest && qualification.loanReportedToTaxAuthority !== true) {
    warnings.push("Voor een lening vanaf 2013 moet de leninggegevensopgave aan de Belastingdienst zijn gedaan.");
  }
  if (!hasRemainingYears) {
    warnings.push(`De maximale aftrekduur van ${rules.maximumDeductionYears} jaar is volgens de invoer verstreken.`);
  }
  if (days === 0) {
    warnings.push("Geen dagen hoofdverblijf ingevoerd; eigenwoningforfait en renteaftrek zijn daarom nul.");
  }

  const eigenwoningforfait = getOwnHomeForfait({ wozValue: input.wozValue, days, year });
  const propertyIncome = signedMoney(input.propertyIncome);
  const eligibleMortgageInterest = qualifiesForDeduction && days > 0 ? money(input.mortgageInterestPaid) : 0;
  const eligibleOtherCosts = qualifiesForDeduction && days > 0 ? money(input.otherDeductibleCosts) : 0;
  const eligibleCosts = roundMoney(eligibleMortgageInterest + eligibleOtherCosts);
  const balanceBeforeHillen = roundMoney(eigenwoningforfait + propertyIncome - eligibleCosts);
  const hillenDeduction = balanceBeforeHillen > 0 && !qualification.hasHillenException
    ? roundMoney(balanceBeforeHillen * (rules.hillenDeductionShare / 100))
    : 0;

  if (balanceBeforeHillen > 0 && qualification.hasHillenException) {
    warnings.push("Wet Hillen is niet toegepast omdat een uitzonderingssituatie is aangevinkt; toets vooruit- of achteraf betaalde rente en werkgeversleningen handmatig.");
  }

  return {
    year,
    eigenwoningforfait,
    propertyIncome,
    eligibleMortgageInterest,
    eligibleOtherCosts,
    eligibleCosts,
    balanceBeforeHillen,
    hillenDeduction,
    balanceAfterHillen: roundMoney(balanceBeforeHillen - hillenDeduction),
    qualifiesForDeduction,
    warnings,
  };
}

function progressiveTax(incomeCents: number, aow: OwnHomeAowStatus) {
  const rules = INCOME_RULES[2026];
  const brackets = rules.brackets.map((bracket) => ({ ...bracket }));
  if (aow !== "none") {
    brackets[0].ratePpm = rules.aowRate.value;
    if (aow === "before1946") brackets[0].limitCents = rules.oldAowLimit.value;
  }
  return calculateProgressiveTaxCents(Math.max(incomeCents, 0), brackets).totalCents;
}

function calculateCredits(input: {
  year: number;
  taxableBox1IncomeCents: number;
  combinedIncomeForCreditsCents: number;
  labourIncomeCents: number;
  aow: OwnHomeAowStatus;
  iackEligible: boolean;
  singleElderly: boolean;
  disabled: boolean;
}) {
  const credits = getFinancialConstants(input.year).box1.credits;
  const income = Math.max(input.combinedIncomeForCreditsCents, 0);
  const labour = Math.max(input.labourIncomeCents, 0);
  const aow = input.aow !== "none";
  const generalRule = aow ? credits.generalAow : credits.general;
  const general = Math.max(0, generalRule.max - taxRate(
    Math.max(income - generalRule.start, 0),
    generalRule.reductionRate,
  ));
  const elderly = aow
    ? Math.max(0, credits.elderly.max - taxRate(Math.max(income - credits.elderly.start, 0), 150_000))
    : 0;
  const singleElderly = aow && input.singleElderly ? credits.singleElderly : 0;
  const iack = input.iackEligible && !aow
    ? Math.min(credits.iack.max, taxRate(Math.max(labour - credits.iack.start, 0), 114_500))
    : 0;
  const disabled = input.disabled && !aow ? credits.disabled : 0;
  const limits = credits.labour.limits;
  const rates = aow ? credits.labour.aowRates : credits.labour.rates;
  const bases = aow ? credits.labour.aowBases : credits.labour.bases;
  const segment = labour <= limits[0] ? 0 : labour <= limits[1] ? 1 : labour <= limits[2] ? 2 : 3;
  const labourCredit = Math.max(0, bases[segment] + taxRate(
    Math.max(labour - (segment === 0 ? 0 : limits[segment - 1]), 0),
    segment === 3 ? -rates[segment] : rates[segment],
 ));
  return { general, labourCredit, iack, elderly, singleElderly, disabled };
}

function calculateAssessment(input: {
  taxpayer: OwnHomeTaxpayerInput;
  year: number;
  homeBalance: number;
  deductibleCosts: number;
}) {
  const taxpayer = input.taxpayer;
  const aow = taxpayer.aow ?? "none";
  if (aow === "transition") {
    throw new Error("Een AOW-overgangsjaar vereist een maandberekening en wordt niet als jaartotaal geschat.");
  }
  const baseIncome = signedMoney(taxpayer.box1IncomeBeforeOwnHome);
  const homeBalance = signedMoney(input.homeBalance);
  const taxableBox1Income = Math.max(roundMoney(baseIncome + homeBalance), 0);
  const combinedIncomeForCredits = Math.max(roundMoney(
    taxableBox1Income + signedMoney(taxpayer.combinedIncomeOutsideBox1),
  ), 0);
  const labourIncome = money(taxpayer.labourIncome);
  const grossBox1TaxCents = progressiveTax(roundCents(taxableBox1Income), aow);
  const beforeOwnHomeCosts = taxableBox1Income + money(input.deductibleCosts);
  const highestBracketLimit = getFinancialConstants(input.year).box1.brackets[1]?.upTo ?? Number.POSITIVE_INFINITY;
  const maxDeductionRate = getFinancialConstants(input.year).box1.mortgageInterestDeductionMaxRate;
  const highestRate = getFinancialConstants(input.year).box1.brackets.at(-1)?.rate ?? 0;
  const adjustmentBase = maxDeductionRate === undefined
    ? 0
    : Math.min(
      money(input.deductibleCosts),
      Math.max(beforeOwnHomeCosts - highestBracketLimit, 0),
    );
  const ownHomeTariffAdjustment = maxDeductionRate === undefined
    ? 0
    : roundMoney(adjustmentBase * Math.max(highestRate - maxDeductionRate, 0) / 100);
  const credits = calculateCredits({
    year: input.year,
    taxableBox1IncomeCents: roundCents(taxableBox1Income),
    combinedIncomeForCreditsCents: roundCents(combinedIncomeForCredits),
    labourIncomeCents: roundCents(labourIncome),
    aow,
    iackEligible: Boolean(taxpayer.iackEligible),
    singleElderly: Boolean(taxpayer.singleElderly),
    disabled: Boolean(taxpayer.disabled),
  });
  const totalCreditsCents = credits.general + credits.labourCredit + credits.iack + credits.elderly + credits.singleElderly + credits.disabled;
  const taxBeforeCreditsCents = grossBox1TaxCents + roundCents(ownHomeTariffAdjustment);
  const finalBox1TaxCents = Math.max(taxBeforeCreditsCents - totalCreditsCents, 0);
  const zvwResult = calculateZvw({ year: input.year, lines: taxpayer.zvwLines ?? [] });
  const zvwCents = zvwResult.employeeCents + zvwResult.selfEmployedCents;
  return {
    taxableBox1Income,
    combinedIncomeForCredits,
    grossBox1Tax: toEuro(grossBox1TaxCents),
    ownHomeTariffAdjustment,
    generalCredit: toEuro(credits.general),
    labourCredit: toEuro(credits.labourCredit),
    iack: toEuro(credits.iack),
    elderlyCredit: toEuro(credits.elderly),
    singleElderlyCredit: toEuro(credits.singleElderly),
    disabledCredit: toEuro(credits.disabled),
    totalCredits: toEuro(totalCreditsCents),
    finalBox1Tax: toEuro(finalBox1TaxCents),
    zvw: toEuro(zvwCents),
  };
}

function candidateShares(input: { balance: number; taxpayers: OwnHomeTaxpayerInput[] }) {
  const candidates = new Set([0, 0.5, 1]);
  if (input.taxpayers.length !== 2 || input.balance === 0) return [...candidates];
  const thresholds = [0, 29_736, 38_883, 45_592, 46_002, 78_426, 132_920];
  const [first, second] = input.taxpayers;
  for (const threshold of thresholds) {
    candidates.add((threshold - first.box1IncomeBeforeOwnHome) / input.balance);
    candidates.add(1 - ((threshold - second.box1IncomeBeforeOwnHome) / input.balance));
  }
  return [...candidates]
    .filter((share) => Number.isFinite(share) && share >= 0 && share <= 1)
    .sort((left, right) => left - right);
}

export function calculateOwnHomeTaxAssessment(input: OwnHomeTaxAssessmentInput): OwnHomeTaxAssessmentResult {
  const year = input.year ?? input.ownHome.year ?? getDefaultFinancialYear();
  if (year !== 2026) {
    throw new Error("De volledige eigenwoningrekenlaag is nu alleen gevalideerd voor belastingjaar 2026.");
  }
  const ownHome = calculateOwnHomeResult({ ...input.ownHome, year });
  const taxpayers = input.taxpayers;
  const mode = input.allocation?.mode ?? (taxpayers.length === 2 ? "optimise" : "manual");
  const balance = ownHome.balanceAfterHillen;
  const cost = ownHome.eligibleCosts;
  const evaluate = (firstShare: number) => {
    const shares = taxpayers.length === 1 ? [1] : [firstShare, 1 - firstShare];
    const assessments = taxpayers.map((taxpayer, index) => {
      const share = shares[index] ?? 0;
      const withHome = calculateAssessment({
        taxpayer,
        year,
        homeBalance: balance * share,
        deductibleCosts: cost * share,
      });
      const withoutHome = calculateAssessment({ taxpayer, year, homeBalance: 0, deductibleCosts: 0 });
      return { taxpayer, share, withHome, withoutHome };
    });
    return {
      shares,
      assessments,
      totalTax: assessments.reduce((sum, item) => sum + item.withHome.finalBox1Tax, 0),
    };
  };
  const requestedShare = Math.min(Math.max(input.allocation?.firstTaxpayerShare ?? 0.5, 0), 1);
  const options = mode === "optimise" && taxpayers.length === 2
    ? candidateShares({ balance, taxpayers: [...taxpayers] }).map(evaluate)
    : [evaluate(taxpayers.length === 1 ? 1 : mode === "equal" ? 0.5 : requestedShare)];
  const selected = options.reduce((best, candidate) => candidate.totalTax < best.totalTax ? candidate : best);
  const taxpayerResults = selected.assessments.map((item) => ({
    id: item.taxpayer.id,
    allocatedOwnHomeBalance: roundMoney(balance * item.share),
    ...item.withHome,
    zvwIsAffectedByOwnHome: false as const,
    taxWithoutOwnHome: item.withoutHome.finalBox1Tax,
    creditEffectOfOwnHome: roundMoney(item.withHome.totalCredits - item.withoutHome.totalCredits),
    ownHomeTaxBenefit: roundMoney(item.withoutHome.finalBox1Tax - item.withHome.finalBox1Tax),
  }));
  const taxWithoutOwnHome = roundMoney(selected.assessments.reduce((sum, item) => sum + item.withoutHome.finalBox1Tax, 0));
  const taxWithOwnHome = roundMoney(selected.assessments.reduce((sum, item) => sum + item.withHome.finalBox1Tax, 0));
  const zvw = roundMoney(taxpayerResults.reduce((sum, taxpayer) => sum + taxpayer.zvw, 0));
  const warnings = [
    ...ownHome.warnings,
    "Zvw staat bewust los van de eigenwoningpost: loon, winst en resultaat bepalen de bijdragegrondslag; hypotheekrenteaftrek niet.",
    "Toeslagen zijn niet in het HRA-voordeel verwerkt. Een negatief saldo eigen woning verlaagt meestal het toetsingsinkomen en kan daardoor afzonderlijk effect hebben.",
    "De partneroptimalisatie verdeelt het gezamenlijke saldo eigen woning. Controleer de uiteindelijke verdeling altijd in de aangifte, zeker bij box 2/3, verliesverrekening of bijzondere woninghistorie.",
  ];
  return {
    year,
    ownHome,
    allocationMode: mode,
    allocation: taxpayerResults.map((taxpayer, index) => ({
      id: taxpayer.id,
      share: selected.shares[index] ?? 0,
      assignedBalance: taxpayer.allocatedOwnHomeBalance,
    })),
    taxpayers: taxpayerResults,
    household: {
      taxWithoutOwnHome,
      taxWithOwnHome,
      ownHomeTaxBenefit: roundMoney(taxWithoutOwnHome - taxWithOwnHome),
      zvw,
      zvwEffect: 0,
      estimatedToetsingsinkomenChange: roundMoney(balance),
    },
    warnings,
  };
}
