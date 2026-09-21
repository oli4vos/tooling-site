import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import { requireCents, ratio, taxRate } from "./money";

export type PensionCapInput = { salaryCents: number; bonusCents: number; pensionableBonus: boolean; growthPpm: number; indexationPpm: number; franchiseCents: number; employeePpm?: number; employerPpm?: number };
export function calculatePensionCap(input: PensionCapInput, rules = TAX_PROPOSALS) {
  [input.salaryCents, input.bonusCents, input.franchiseCents].forEach(v => requireCents(v));
  for (const rate of [input.growthPpm, input.indexationPpm]) if (!Number.isInteger(rate) || rate <= -1_000_000 || rate > 1_000_000) throw new Error("Kies een groei boven -100% en maximaal 100%.");
  for (const rate of [input.employeePpm, input.employerPpm]) if (rate !== undefined && (!Number.isInteger(rate) || rate < 0 || rate > 1_000_000)) throw new Error("Ongeldig premiepercentage.");
  let salary = input.salaryCents;
  let indexedCap = rules.parameters.pensionCap.value;
  const rows = [];
  for (let year = 2027; year <= 2032; year++) {
    salary = ratio(salary, 1_000_000 + input.growthPpm, 1_000_000);
    indexedCap = ratio(indexedCap, 1_000_000 + input.indexationPpm, 1_000_000);
    const pensionable = salary + (input.pensionableBonus ? input.bonusCents : 0);
    const cap = rules.parameters.pensionCap.value;
    const excess = Math.max(0, pensionable - cap);
    const base = Math.max(0, Math.min(pensionable, cap) - input.franchiseCents);
    const indexedBase = Math.max(0, Math.min(pensionable, indexedCap) - input.franchiseCents);
    const gap = indexedBase - base;
    rows.push({ year, salaryCents: pensionable, capCents: cap, excessCents: excess, indexedCapCents: indexedCap,
      employeeImpactCents: input.employeePpm === undefined ? null : taxRate(gap, input.employeePpm),
      employerImpactCents: input.employerPpm === undefined ? null : taxRate(gap, input.employerPpm) });
  }
  return { rows, cumulativeExcessCents: rows.reduce((sum, row) => sum + row.excessCents, 0), firstExcessYear: rows.find(row => row.excessCents > 0)?.year ?? null };
}

export type TravelInput = { distanceHundredthsKm: number; scheduledDays: number; homeDays: number; absentDays: number; businessHundredthsKm: number; paidCents: number; mode: "private" | "employer" | "public-actual"; publicCostsCents: number };
export function calculateTravel(input: TravelInput, rules = TAX_PROPOSALS) {
  for (const value of Object.values(input)) if (typeof value === "number") requireCents(value);
  if (input.scheduledDays > 366 || input.homeDays + input.absentDays > input.scheduledDays) throw new Error("Thuiswerk en afwezigheid mogen samen niet hoger zijn dan de geplande werkdagen.");
  const travelDays = input.scheduledDays - input.homeDays - input.absentDays;
  const distance = input.distanceHundredthsKm * 2 * travelDays + input.businessHundredthsKm;
  const reference = input.mode === "employer" ? 0 : input.mode === "public-actual" ? input.publicCostsCents : ratio(distance, rules.parameters.travelReference.value, 100);
  const maximum = input.mode === "employer" ? 0 : input.mode === "public-actual" ? input.publicCostsCents : ratio(distance, rules.parameters.travel.value, 100);
  return { travelDays, distanceHundredthsKm: distance, referenceCents: reference, maximumCents: maximum,
    differenceCents: maximum - reference, paidCents: input.paidCents, unusedCents: Math.max(0, maximum - input.paidCents), aboveExemptionCents: Math.max(0, input.paidCents - maximum) };
}
