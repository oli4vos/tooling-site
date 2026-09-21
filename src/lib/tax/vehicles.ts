import { addCalendarDays, addCalendarYears, differenceInCalendarDays, parseIsoDateInput, toIsoDateKey } from "@/lib/calendar/date-utils";
import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import { ratio, requireCents, taxRate } from "@/lib/tax/money";

export type YoungtimerInput = {
  year: 2026 | 2027 | 2028;
  firstUse: string;
  availableFrom: string;
  availableUntil: string;
  sameUserAt2025End: boolean;
  useTransition2026: boolean;
  role: "entrepreneur" | "employee" | "director";
  catalogueCents: number;
  marketCents: number;
  regularRatePpm: number;
  privateOver500: boolean;
  proofOfLimitedPrivateUse: boolean;
  marginalRatePpm?: number;
  annualCarCostsCents?: number;
};

export function fiscalDate(value: string): Date {
  const parsed = parseIsoDateInput(value);
  if (!parsed) throw new Error("Vul een volledige, geldige datum in.");
  return parsed;
}

/** Date-only values represent Dutch civil dates; UTC is arithmetic, not an instant conversion. */
export function youngtimerEligibleFrom(firstUse: string, years: number): string {
  return toIsoDateKey(addCalendarDays(addCalendarYears(fiscalDate(firstUse), years), 1));
}

export function calculateYoungtimer(input: YoungtimerInput, rules = TAX_PROPOSALS) {
  if (![2026, 2027, 2028].includes(input.year)) throw new Error("Kies 2026, 2027 of 2028.");
  fiscalDate(input.firstUse); fiscalDate(input.availableFrom); fiscalDate(input.availableUntil);
  requireCents(input.catalogueCents); requireCents(input.marketCents);
  if (input.firstUse > input.availableFrom || input.availableFrom > input.availableUntil) throw new Error("Controleer de volgorde van de datums van de auto.");
  if (input.sameUserAt2025End && input.availableFrom > "2025-12-31") throw new Error("De terbeschikkingstelling begint na 31 december 2025.");
  if (!Number.isInteger(input.regularRatePpm) || input.regularRatePpm < 0 || input.regularRatePpm > 1_000_000) throw new Error("Ongeldig bijtellingspercentage.");
  if (input.marginalRatePpm !== undefined && (!Number.isInteger(input.marginalRatePpm) || input.marginalRatePpm < 0 || input.marginalRatePpm > 1_000_000)) throw new Error("Ongeldig marginaal tarief.");
  if (!input.privateOver500 && !input.proofOfLimitedPrivateUse) throw new Error("Zonder bewijs van maximaal 500 privékilometers kan geen nulbijtelling worden vastgesteld.");
  if (input.role === "entrepreneur" && input.annualCarCostsCents === undefined) throw new Error("Vul de jaarlijkse autokosten in voor de IB-kostenbegrenzing.");
  if (input.annualCarCostsCents !== undefined) requireCents(input.annualCarCostsCents);
  const age = rules.parameters[`youngtimer${input.year}`].value;
  const eligibleFrom = youngtimerEligibleFrom(input.firstUse, age);
  const start = [input.availableFrom, `${input.year}-01-01`].sort().at(-1)!;
  const end = [input.availableUntil, `${input.year}-12-31`].sort()[0];
  const yearDays = differenceInCalendarDays(fiscalDate(`${input.year}-01-01`), fiscalDate(`${input.year + 1}-01-01`));
  const usedDays = start > end ? 0 : differenceInCalendarDays(fiscalDate(start), fiscalDate(end)) + 1;
  // Article XLVII(3/4) names 2026; the commentary on p180 differs.
  // Apply the bill text, and disclose the inconsistency in the result.
  const transitionYear = input.year === 2026 ? 2025 : 2026;
  const transitionAge = input.year === 2026 ? 15 : 16;
  const transitionDate = youngtimerEligibleFrom(input.firstUse, transitionAge);
  const transitionEligible = input.year !== 2028 && input.sameUserAt2025End && transitionDate >= `${transitionYear}-01-01` && transitionDate <= `${transitionYear}-12-31`;
  const transition = transitionEligible && (input.year === 2027 || input.useTransition2026);
  const youngStart = transition ? start : [start, eligibleFrom].sort().at(-1)!;
  const youngDays = usedDays === 0 || youngStart > end ? 0 : differenceInCalendarDays(fiscalDate(youngStart), fiscalDate(end)) + 1;
  const regularDays = usedDays - youngDays;
  const annualYoung = taxRate(input.marketCents, rules.parameters.youngtimerRate.value);
  const annualRegular = taxRate(input.catalogueCents, input.regularRatePpm);
  const beforeCap = input.privateOver500 ? ratio(annualYoung, youngDays, yearDays) + ratio(annualRegular, regularDays, yearDays) : 0;
  const applied = input.role === "entrepreneur" ? Math.min(beforeCap, input.annualCarCostsCents!) : beforeCap;
  const regularBeforeCap = input.privateOver500 ? ratio(annualRegular, usedDays, yearDays) : 0;
  const regularComparison = input.role === "entrepreneur" ? Math.min(regularBeforeCap, input.annualCarCostsCents!) : regularBeforeCap;
  return {
    year: input.year, age, eligibleFrom, start, end, usedDays, youngDays, regularDays, transitionEligible, transition,
    conclusion: !usedDays ? "Geen terbeschikkingstelling in dit jaar" : !input.privateOver500 ? "Geen bijtelling bij aantoonbaar beperkt privégebruik" : transition ? "Youngtimer via overgangsrecht" : youngDays === usedDays ? "Youngtimer gedurende de hele gebruiksperiode" : youngDays ? "Youngtimer voor een deel van het jaar" : "Nog geen youngtimer",
    annualYoungCents: annualYoung, annualRegularCents: annualRegular, grossCents: applied,
    monthlyCents: ratio(applied, 1, 12), differenceCents: applied - regularComparison,
    netCents: input.marginalRatePpm === undefined ? null : taxRate(applied, input.marginalRatePpm),
    warnings: ["De marktwaarde moet aantoonbaar zijn; een advertentieprijs is niet automatisch de fiscale waarde.", "Bijtelling voor elektrische auto's met meerdere percentages vraagt een afzonderlijke berekening; gebruik deze vergelijking alleen met één bevestigd percentage.", ...(input.year === 2027 && transitionEligible ? ["Het voorstel bevat een verschil tussen artikel XLVII (referentiejaar 2026) en de toelichting op pagina 180 (2027). Deze indicatie volgt de artikeltekst; het overgangspad moet vóór definitief gebruik fiscaal worden gereviewd."] : [])],
  };
}
