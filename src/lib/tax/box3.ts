import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import type { Box3Input, Box3Result } from "@/lib/tax/types";

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundRate(value: number) {
  return Math.round(value * 10000) / 10000;
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeSignedMoney(value: number | undefined) {
  return Number.isFinite(value) ? (value as number) : 0;
}

export function calculateBox3Tax(input: Box3Input): Box3Result {
  const year = input.year ?? getDefaultFinancialYear();
  const constants = getFinancialConstants(year);
  const box3 = constants.box3;
  const bankDeposits = sanitizeMoney(input.bankDeposits);
  const investmentsAndOtherAssets = sanitizeMoney(input.investmentsAndOtherAssets);
  const debts = sanitizeMoney(input.debts);
  const assetsTotal = roundMoney(bankDeposits + investmentsAndOtherAssets);
  const debtsTotal = roundMoney(debts);
  const debtThreshold = input.hasFiscalPartner
    ? box3.debtThresholdPartners
    : box3.debtThresholdSingle;
  const deductibleDebts = roundMoney(Math.max(debtsTotal - debtThreshold, 0));
  const netWorthAfterDebtThreshold = roundMoney(
    Math.max(assetsTotal - deductibleDebts, 0),
  );
  const taxFreeAllowance = input.hasFiscalPartner
    ? box3.taxFreeAllowancePartners
    : box3.taxFreeAllowanceSingle;
  const taxableBase = roundMoney(
    Math.max(netWorthAfterDebtThreshold - taxFreeAllowance, 0),
  );
  const method = input.method ?? "actual";
  const actualReturnComponentsProvided =
    input.actualIncome !== undefined ||
    input.actualValueChange !== undefined ||
    input.actualDebtInterest !== undefined;

  const deemedReturnBankDeposits =
    method === "forfaitary"
      ? roundMoney(bankDeposits * (box3.deemedReturns.bankDeposits / 100))
      : 0;
  const deemedReturnInvestments =
    method === "forfaitary"
      ? roundMoney(
          investmentsAndOtherAssets *
            (box3.deemedReturns.investmentsAndOtherAssets / 100),
        )
      : 0;
  const deemedReturnDebts =
    method === "forfaitary"
      ? roundMoney(deductibleDebts * (box3.deemedReturns.debts / 100))
      : 0;

  const actualReturn =
    actualReturnComponentsProvided
      ? roundMoney(
          sanitizeSignedMoney(input.actualIncome) +
            sanitizeSignedMoney(input.actualValueChange) -
            Math.max(sanitizeSignedMoney(input.actualDebtInterest), 0),
        )
      : roundMoney(
          assetsTotal * (sanitizePercent(input.actualAnnualReturnRate) / 100),
        );

  const taxableDeemedReturn =
    method === "forfaitary"
      ? (() => {
          const grossDeemedReturn = roundMoney(
            deemedReturnBankDeposits + deemedReturnInvestments - deemedReturnDebts,
          );
          const taxableShare =
            netWorthAfterDebtThreshold > 0
              ? taxableBase / netWorthAfterDebtThreshold
              : 0;
          return roundMoney(Math.max(grossDeemedReturn * taxableShare, 0));
        })()
      : Math.max(actualReturn, 0);

  const box3Tax = roundMoney(taxableDeemedReturn * (box3.taxRate / 100));
  const effectiveTaxRateOnNetWorth =
    netWorthAfterDebtThreshold > 0
      ? roundRate((box3Tax / netWorthAfterDebtThreshold) * 100)
      : 0;

  const warnings =
    method === "forfaitary"
      ? [
          "Dit is een indicatieve box 3-berekening volgens de voorlopige forfaitaire percentages voor 2026.",
          "Werkelijke box 3-systematiek kan wijzigen en persoonlijke fiscale regels kunnen afwijken.",
        ]
      : [
          actualReturnComponentsProvided
            ? "Werkelijk rendement gebruikt inkomsten + waardeverandering − betaalde rente op schulden. Bij deze route geldt geen heffingsvrij vermogen."
            : "Een ingevoerd rendementpercentage is alleen een vereenvoudigde projectie van werkelijk rendement; vul inkomsten, waardeverandering en betaalde rente op schulden in voor een inhoudelijker scenario.",
          "Bij werkelijk rendement wordt het rendement over het totale vermogen beoordeeld; de forfaitaire schuldendrempel en vrijstelling zijn daarom niet toegepast.",
          "Dit blijft een indicatie en geen volledige aangifteberekening: onder meer begin-/eindwaarden, specifieke vermogenscategorieën en uitzonderingen kunnen de officiële uitkomst beïnvloeden.",
        ];
  if (box3.meta.status === "voorlopig") {
    warnings.push(
      "De gebruikte box 3-percentages zijn voorlopig en kunnen later definitief worden aangepast.",
    );
  }

  return {
    year,
    assetsTotal,
    debtsTotal,
    debtThreshold,
    deductibleDebts,
    netWorthAfterDebtThreshold,
    taxFreeAllowance,
    taxableBase,
    deemedReturnBankDeposits,
    deemedReturnInvestments,
    deemedReturnDebts,
    taxableDeemedReturn,
    actualReturn,
    actualReturnComponentsProvided,
    box3Tax,
    effectiveTaxRateOnNetWorth,
    method,
    warnings,
  };
}
