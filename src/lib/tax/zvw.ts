import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { requireCents, taxRate } from "./money";
import type { ZvwInput, ZvwMode, ZvwResult } from "./types";

function ratePpm(rate: number) {
  return Math.round(rate * 10_000);
}

function modeRate(mode: ZvwMode, rules: ReturnType<typeof getFinancialConstants>["zvw"]) {
  switch (mode) {
    case "employer":
      return rules.employerRate;
    case "employee":
      return rules.employeeRate;
    case "self-employed":
      return rules.selfEmployedRate;
    case "none":
      return 0;
  }
}

/**
 * Calculates the income-dependent Zvw part without mixing it into box 1.
 * The cap is shared by all lines, as it is on the official Zvw contribution base.
 */
export function calculateZvw(input: ZvwInput): ZvwResult {
  const year = input.year ?? getDefaultFinancialYear();
  const rules = getFinancialConstants(year).zvw;
  let remainingCap = rules.maxContributionIncome * 100;
  let contributionIncomeCents = 0;
  let employerCents = 0;
  let employeeCents = 0;
  let selfEmployedCents = 0;
  const rows: ZvwResult["rows"] = [];

  for (const [index, line] of input.lines.entries()) {
    requireCents(line.incomeCents);
    const incomeCents = line.incomeCents;
    const cappedIncomeCents = Math.min(incomeCents, Math.max(remainingCap, 0));
    const rate = modeRate(line.mode, rules);
    const amountCents = taxRate(cappedIncomeCents, ratePpm(rate));
    remainingCap -= cappedIncomeCents;
    contributionIncomeCents += cappedIncomeCents;
    if (line.mode === "employer") employerCents += amountCents;
    if (line.mode === "employee") employeeCents += amountCents;
    if (line.mode === "self-employed") selfEmployedCents += amountCents;
    rows.push({
      label: line.label ?? `Inkomensregel ${index + 1}`,
      mode: line.mode,
      inputCents: incomeCents,
      cappedIncomeCents,
      rate,
      amountCents,
    });
  }

  return {
    year,
    contributionIncomeCents,
    employerCents,
    employeeCents,
    selfEmployedCents,
    rows,
    warnings: [
      "De Zvw-premie voor de zorgverzekeraar zelf zit niet in deze inkomensafhankelijke bijdrage.",
      "Bij meerdere inkomensregels wordt het officiële maximumbijdrage-inkomen één keer gedeeld over de opgegeven regels.",
    ],
  };
}
