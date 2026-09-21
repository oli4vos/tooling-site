import { parseIsoDateInput } from "@/lib/calendar/date-utils";

export const TAX_PROPOSAL_SOURCE = "https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-belastingplan-2027/wetsvoorstel-belastingplan-2027.pdf";
export type LegislativeStatus = "proposed" | "amended" | "enacted" | "expired";
export type TaxParameter = {
  value: number;
  unit: "cents" | "ppm" | "years" | "days";
  effectiveFrom: string;
  effectiveUntil?: string;
  status: LegislativeStatus;
  sourceUrl: string;
  sourceTitle: string;
  sourceDate: string;
  locator: string;
  lastVerifiedAt: string;
  explanation: string;
  change: string;
};

function proposal(value: number, unit: TaxParameter["unit"], effectiveFrom: string, locator: string, explanation: string, change: string): TaxParameter {
  return { value, unit, effectiveFrom, status: "proposed", sourceUrl: TAX_PROPOSAL_SOURCE,
    sourceTitle: "Wetsvoorstel Belastingplan 2027", sourceDate: "2026-09-15", lastVerifiedAt: "2026-09-18", locator, explanation, change };
}

export const TAX_PROPOSALS = {
  version: "2027.proposed.2026-09-18.1",
  release: "proposal-preview" as const,
  fiscalReview: "pending" as const,
  verifiedAt: "2026-09-18",
  nextReviewAt: "2026-10-01",
  parameters: {
    youngtimer2026: proposal(16, "years", "2026-01-01", "artikel I E; toelichting §5.2", "In 2026 geldt meer dan 16 jaar; overgangsrecht is een afzonderlijk pad.", "Referentie: leeftijdsgrens 2026."),
    youngtimer2027: proposal(17, "years", "2027-01-01", "artikel I E en XLVII", "Voorgestelde leeftijdsgrens: meer dan 17 jaar.", "Geleidelijker pad in plaats van de eerder geplande 25 jaar."),
    youngtimer2028: proposal(20, "years", "2028-01-01", "artikel II B", "Voorgestelde leeftijdsgrens: meer dan 20 jaar.", "Van 17 naar 20 jaar."),
    youngtimerRate: proposal(350_000, "ppm", "2026-01-01", "toelichting §5.2", "35% van de aantoonbare waarde in het economische verkeer.", "Ongewijzigd percentage; wijziging betreft leeftijd en grondslag."),
    travelReference: proposal(23, "cents", "2026-01-01", "artikel I C/D; §5.1", "Oude referentie voor de vergelijking: 23 cent per kilometer.", "Referentiescenario vóór verhoging."),
    travel: proposal(25, "cents", "2026-01-01", "artikel I C/D; artikel LVII; §5.1", "25 cent per kilometer; codificatie met terugwerkende kracht.", "2 cent meer fiscale ruimte, geen betalingsrecht."),
    starter2026: proposal(212300, "cents", "2026-01-01", "artikel I G; §5.5", "Referentie: startersaftrek 2026.", "2026 blijft referentie."),
    starter2027: proposal(1000, "cents", "2027-01-01", "artikel I G", "Voorgestelde startersaftrek van 10 euro.", "Verlaagd van 2.123 naar 10 euro."),
    starter2028: proposal(0, "cents", "2028-01-01", "artikel II C", "Voorgestelde afschaffing van de gewone startersaftrek.", "10 euro naar nul."),
    transfer2026: proposal(80000, "ppm", "2026-01-01", "artikel XIX; §5.12", "Referentie: 8% voor niet-hoofdverblijfwoningen.", "2026 als referentie."),
    transfer2027: proposal(70000, "ppm", "2027-01-01", "artikel XIX; §5.12", "Voorgesteld 7% voor niet-hoofdverblijfwoningen.", "Een procentpunt lager."),
    eia2026: proposal(400000, "ppm", "2026-01-01", "artikel I F; §5.4", "Referentie: 40% extra winstaftrek.", "2026 als referentie."),
    eia2027: proposal(455000, "ppm", "2027-01-01", "artikel I F", "Voorgesteld 45,5% extra winstaftrek, geen factuurkorting.", "5,5 procentpunt meer aftrek."),
    pensionCap: { ...proposal(13780000, "cents", "2027-01-01", "§5.8; artikelen XXXII–XXXVII", "Voorgestelde bevriezing van de aftoppingsgrens tot en met 2032.", "Zes jaar geen indexatie."), effectiveUntil: "2032-12-31" },
    flightLow: proposal(3104, "cents", "2027-01-01", "§5.23; bijlage A Wbm", "Lage categorie volgens wettelijke landenlijst, inclusief Caribisch Koninkrijk.", "Afstand alleen is niet bepalend."),
    flightMiddle: proposal(4987, "cents", "2027-01-01", "§5.23; bijlage B Wbm", "Middencategorie volgens wettelijke landenlijst.", "Afstand alleen is niet bepalend."),
    flightHigh: proposal(5943, "cents", "2027-01-01", "§5.23", "Voorgesteld hoog tarief.", "Lager dan eerder voorzien."),
  },
};

/** Runtime schema validation without introducing a second schema dependency. */
export function validateTaxParameter(parameter: TaxParameter): string[] {
  const errors: string[] = [];
  if (!Number.isSafeInteger(parameter.value) || parameter.value < 0) errors.push("value");
  if (!["cents", "ppm", "years", "days"].includes(parameter.unit)) errors.push("unit");
  if (!["proposed", "amended", "enacted", "expired"].includes(parameter.status)) errors.push("status");
  for (const key of ["effectiveFrom", "sourceDate", "lastVerifiedAt"] as const) if (!parseIsoDateInput(parameter[key])) errors.push(key);
  if (parameter.effectiveUntil && (!parseIsoDateInput(parameter.effectiveUntil) || parameter.effectiveUntil < parameter.effectiveFrom)) errors.push("effectiveUntil");
  try { if (new URL(parameter.sourceUrl).protocol !== "https:") errors.push("sourceUrl"); } catch { errors.push("sourceUrl"); }
  for (const key of ["sourceTitle", "locator", "explanation", "change"] as const) if (!parameter[key]?.trim()) errors.push(key);
  if (parameter.unit === "ppm" && parameter.value > 1_000_000) errors.push("value");
  return errors;
}
