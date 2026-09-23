import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox1Tax } from "@/lib/tax";
import { calculateIncomeYear } from "@/lib/tax/income-comparison";
import { cents } from "@/lib/tax/money";

export type ZzpUurtariefInput = {
  taxYear?: number;
  targetNetMonthlyIncome?: number;
  monthlyBufferReserve?: number;
  monthlyPensionReserve?: number;
  pensionReservePercent?: number;
  monthlyAovPremium?: number;
  monthlyBusinessCosts?: number;
  billableHoursPerWeek?: number;
  workingWeeksPerYear?: number;
  vacationWeeksPerYear?: number;
  taxReservePercent?: number;
  grossAnnualSalaryComparison?: number;
};

export type ZzpUurtariefResult = {
  taxYear: number;
  activeWeeksPerYear: number;
  billableHoursPerYear: number;
  annualNetTarget: number;
  annualBufferReserve: number;
  annualPensionReserve: number;
  annualAovPremium: number;
  annualBusinessCosts: number;
  subtotalBeforeTaxReserve: number;
  annualTaxReserve: number;
  requiredAnnualRevenue: number;
  requiredHourlyRate: number;
  pensionReserveSource: "monthlyAmount" | "percentageOfNetTarget" | "none";
  grossSalaryComparison: null | {
    grossAnnualSalary: number;
    annualRevenueGap: number;
    requiredRevenueAsPercentOfSalary: number;
  };
  box1Reference: {
    taxableProfit: number;
    indicativeTaxOnRequiredRevenue: number;
    effectiveRate: number;
    marginalRate: number;
    heffingskortingen: number;
    zvwContribution: number;
  };
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeHours(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, 0), 80);
}

function sanitizeWeeks(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(value as number), 0), 52);
}

function sanitizeTaxYear(value: number | undefined) {
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
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(Math.max(value, 0) * 100) / 100;
}

export function calculateZzpUurtarief(
  input: ZzpUurtariefInput,
): ZzpUurtariefResult {
  const taxYear = sanitizeTaxYear(input.taxYear);
  const targetNetMonthlyIncome = sanitizeMoney(input.targetNetMonthlyIncome);
  const monthlyBufferReserve = sanitizeMoney(input.monthlyBufferReserve);
  const monthlyPensionReserve = sanitizeMoney(input.monthlyPensionReserve);
  const pensionReservePercent = sanitizePercent(input.pensionReservePercent, 0);
  const monthlyAovPremium = sanitizeMoney(input.monthlyAovPremium);
  const monthlyBusinessCosts = sanitizeMoney(input.monthlyBusinessCosts);
  const billableHoursPerWeek = sanitizeHours(input.billableHoursPerWeek, 24);
  const workingWeeksPerYear = sanitizeWeeks(input.workingWeeksPerYear, 48);
  const vacationWeeksPerYear = sanitizeWeeks(input.vacationWeeksPerYear, 6);
  const taxReservePercent = sanitizePercent(input.taxReservePercent, 37);
  const grossAnnualSalaryComparison = sanitizeMoney(input.grossAnnualSalaryComparison);

  const activeWeeksPerYear = Math.max(workingWeeksPerYear - vacationWeeksPerYear, 0);
  const billableHoursPerYear = roundMoney(billableHoursPerWeek * activeWeeksPerYear);

  const annualNetTarget = roundMoney(targetNetMonthlyIncome * 12);
  const annualBufferReserve = roundMoney(monthlyBufferReserve * 12);
  const annualAovPremium = roundMoney(monthlyAovPremium * 12);
  const annualBusinessCosts = roundMoney(monthlyBusinessCosts * 12);

  let annualPensionReserve = 0;
  let pensionReserveSource: ZzpUurtariefResult["pensionReserveSource"] = "none";
  if (monthlyPensionReserve > 0) {
    annualPensionReserve = roundMoney(monthlyPensionReserve * 12);
    pensionReserveSource = "monthlyAmount";
  } else if (pensionReservePercent > 0) {
    annualPensionReserve = roundMoney(annualNetTarget * (pensionReservePercent / 100));
    pensionReserveSource = "percentageOfNetTarget";
  }

  const subtotalBeforeTaxReserve = roundMoney(
    annualNetTarget +
      annualBufferReserve +
      annualPensionReserve +
      annualAovPremium +
      annualBusinessCosts,
  );
  const taxReserveFactor = Math.min(taxReservePercent / 100, 0.95);
  const requiredAnnualRevenue = roundMoney(
    subtotalBeforeTaxReserve / (1 - taxReserveFactor),
  );
  const annualTaxReserve = roundMoney(
    requiredAnnualRevenue - subtotalBeforeTaxReserve,
  );
  const requiredHourlyRate =
    billableHoursPerYear > 0
      ? roundMoney(requiredAnnualRevenue / billableHoursPerYear)
      : 0;

  const taxableProfit = roundMoney(Math.max(requiredAnnualRevenue - annualBusinessCosts, 0));
  const box1Reference = calculateBox1Tax({
    taxableIncome: taxableProfit,
    year: taxYear,
  });
  let indicativeTax = box1Reference.totalTax;
  let heffingskortingen = 0;
  let zvwContribution = 0;
  if (taxYear === 2026 || taxYear === 2027) {
    const income = calculateIncomeYear(
      {
        salaryCents: cents(taxableProfit),
        pensionCents: 0,
        otherCents: 0,
        pensionContributionCents: 0,
        aow: "none",
        singleElderly: false,
        iack: false,
        disabled: false,
        zvwLines: [{ incomeCents: cents(taxableProfit), mode: "self-employed", label: "Winst uit onderneming" }],
      },
      taxYear,
    );
    indicativeTax = income.taxMaxCents / 100;
    heffingskortingen = (income.generalCents + income.workMaxCents + income.iackCents + income.disabledCents) / 100;
    zvwContribution = income.zvwSelfEmployedCents / 100;
  }

  const salaryComparison =
    grossAnnualSalaryComparison > 0
      ? {
          grossAnnualSalary: roundMoney(grossAnnualSalaryComparison),
          annualRevenueGap: roundMoney(requiredAnnualRevenue - grossAnnualSalaryComparison),
          requiredRevenueAsPercentOfSalary: roundMoney(
            (requiredAnnualRevenue / grossAnnualSalaryComparison) * 100,
          ),
        }
      : null;

  const warnings = [
    "Dit is een indicatieve rekentool en geen volledige ZZP- of inkomstenbelastingaangifte.",
    "Het uurtarief is exclusief btw. De belastingreservering is jouw eigen planningspercentage van de benodigde omzet, niet een berekende belastingaanslag.",
    "De fiscale referentie trekt ingevoerde zakelijke kosten af en gebruikt voor 2026/2027 de centrale heffingskortingen en Zvw voor winst uit onderneming. Ondernemersaftrek, MKB-winstvrijstelling, investeringsaftrek, startersaftrek en persoonlijke aftrekposten zijn nog niet geactiveerd omdat daarvoor aanvullende invoer nodig is.",
    "Gebruik de uitkomst als planningsbedrag en controleer je belastingreservering met je boekhouder of adviseur.",
  ];

  if (billableHoursPerYear <= 0) {
    warnings.push(
      "Declarabele uren per jaar zijn 0. Vul declarabele uren en actieve werkweken in voor een bruikbaar uurtarief.",
    );
  }

  if (activeWeeksPerYear < 40) {
    warnings.push(
      "Je actieve werkweken zijn relatief laag; het benodigde uurtarief stijgt hierdoor snel.",
    );
  }

  if (taxReservePercent < 25) {
    warnings.push(
      "Je belastingreservering is laag. Controleer of dit realistisch is voor jouw situatie.",
    );
  }

  return {
    taxYear,
    activeWeeksPerYear,
    billableHoursPerYear,
    annualNetTarget,
    annualBufferReserve,
    annualPensionReserve,
    annualAovPremium,
    annualBusinessCosts,
    subtotalBeforeTaxReserve,
    annualTaxReserve,
    requiredAnnualRevenue,
    requiredHourlyRate,
    pensionReserveSource,
    grossSalaryComparison: salaryComparison,
    box1Reference: {
      taxableProfit,
      indicativeTaxOnRequiredRevenue: roundMoney(indicativeTax),
      effectiveRate: taxableProfit > 0 ? roundMoney((indicativeTax / taxableProfit) * 100) : 0,
      marginalRate: roundMoney(box1Reference.marginalRate),
      heffingskortingen: roundMoney(heffingskortingen),
      zvwContribution: roundMoney(zvwContribution),
    },
    warnings,
  };
}
