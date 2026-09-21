import { describe, expect, it } from "vitest";
import { TAX_PROPOSALS, validateTaxParameter } from "@/lib/financial-constants/tax-proposals";
import { cents, ratio, taxRate } from "./money";
import { calculateYoungtimer, youngtimerEligibleFrom, type YoungtimerInput } from "./vehicles";
import { calculatePensionCap, calculateTravel } from "./proposal-planning";
import { SOURCE_DATASET_REGISTRY, validateDatasetRegistry } from "@/lib/financial-constants/source-datasets";

const car: YoungtimerInput = { year: 2026, firstUse: "2010-06-15", availableFrom: "2026-01-01", availableUntil: "2026-12-31", sameUserAt2025End: false, useTransition2026: false, role: "employee", catalogueCents: 4000000, marketCents: 1000000, regularRatePpm: 250000, privateOver500: true, proofOfLimitedPrivateUse: false };
describe("exact tax primitives", () => {
  it("checks proposal parameters through the central source validation gate", () => {
    const dataset = SOURCE_DATASET_REGISTRY.find(item => item.family === "tax-proposal-rules")!;
    const data = structuredClone(TAX_PROPOSALS);
    data.parameters.travel.value = -1;
    const result = validateDatasetRegistry([{...dataset, data}], "2026-09-20");
    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.message.includes("travel"))).toBe(true);
  });
  it("parses money without floating point rounding", () => { expect(cents("1,01")).toBe(101); expect(() => cents("1.005")).toThrow(); expect(taxRate(101, 500000)).toBe(51); expect(ratio(-101, 1, 2)).toBe(-51); });
  it("validates every parameter and rejects corrupt versions", () => { for (const p of Object.values(TAX_PROPOSALS.parameters)) expect(validateTaxParameter(p)).toEqual([]); expect(validateTaxParameter({...TAX_PROPOSALS.parameters.travel, value: NaN})).toContain("value"); });
});
describe("youngtimer civil dates", () => {
  it("requires more than N years: before, on and after anniversary", () => {
    for (const [date, days] of [["2026-06-14",0],["2026-06-15",0],["2026-06-16",1]] as const) expect(calculateYoungtimer({...car,availableFrom:date,availableUntil:date}).youngDays).toBe(days);
  });
  it("handles leap days and January boundary", () => { expect(youngtimerEligibleFrom("2008-02-29",17)).toBe("2025-03-01"); expect(youngtimerEligibleFrom("2010-12-31",16)).toBe("2027-01-01"); });
  it("golden: whole-year transition is 35% of market value", () => { const r = calculateYoungtimer({...car,availableFrom:"2025-01-01",sameUserAt2025End:true,useTransition2026:true}); expect(r.grossCents).toBe(350000); expect(r.youngDays).toBe(365); });
  it("does not grant transition to a new user", () => { expect(calculateYoungtimer(car).transition).toBe(false); expect(() => calculateYoungtimer({...car,sameUserAt2025End:true})).toThrow(); });
  it("2027 transition follows the bill and flags commentary discrepancy", () => { const r = calculateYoungtimer({...car,year:2027,availableFrom:"2025-01-01",availableUntil:"2027-12-31",sameUserAt2025End:true}); expect(r.transition).toBe(true); expect(r.warnings.join(" ")).toContain("artikel XLVII"); });
  it("2028 has no transition and uses 366 days", () => { const r = calculateYoungtimer({...car,year:2028,firstUse:"2000-01-01",availableUntil:"2028-12-31"}); expect(r.transition).toBe(false); expect(r.usedDays).toBe(366); expect(r.grossCents).toBe(350000); });
  it("limits IB addition to actual car costs", () => { expect(calculateYoungtimer({...car,firstUse:"2000-01-01",role:"entrepreneur",annualCarCostsCents:200000}).grossCents).toBe(200000); });
  it("applies the same IB cost cap to both comparison scenarios", () => {
    const result = calculateYoungtimer({...car,firstUse:"2000-01-01",role:"entrepreneur",annualCarCostsCents:200000});
    expect(result.differenceCents).toBe(0);
  });
  it("never silently assumes proof", () => { expect(() => calculateYoungtimer({...car,privateOver500:false})).toThrow(); expect(calculateYoungtimer({...car,privateOver500:false,proofOfLimitedPrivateUse:true}).grossCents).toBe(0); });
  it("updates a rule without UI changes", () => { const changed = structuredClone(TAX_PROPOSALS); changed.parameters.youngtimer2026.value = 20; expect(calculateYoungtimer(car, changed).youngDays).toBe(0); });
});
describe("planning comparisons", () => {
  const pension = { salaryCents:13780000,bonusCents:0,pensionableBonus:false,growthPpm:0,indexationPpm:0,franchiseCents:0 };
  it("pension cap below, at and above", () => { for(const delta of [-1,0,1]) expect(calculatePensionCap({...pension,salaryCents:pension.salaryCents+delta}).rows[0].excessCents).toBe(Math.max(0,delta)); });
  it("bonus only counts when pensionable", () => { expect(calculatePensionCap({...pension,bonusCents:100000}).cumulativeExcessCents).toBe(0); expect(calculatePensionCap({...pension,bonusCents:100000,pensionableBonus:true}).cumulativeExcessCents).toBe(600000); });
  it("negative growth does not create negative excess", () => { expect(calculatePensionCap({...pension,growthPpm:-100000}).firstExcessYear).toBe(null); });
  const travel = {distanceHundredthsKm:2000,scheduledDays:220,homeDays:20,absentDays:0,businessHundredthsKm:0,paidCents:184000,mode:"private" as const,publicCostsCents:0};
  it("golden: 200 returns of 20km yield 2000 euro", () => { expect(calculateTravel(travel)).toMatchObject({maximumCents:200000,differenceCents:16000,unusedCents:16000}); });
  it("employer transport is not reimbursed twice", () => { expect(calculateTravel({...travel,mode:"employer"}).maximumCents).toBe(0); });
  it("public actual costs replace distance allowance", () => { expect(calculateTravel({...travel,mode:"public-actual",publicCostsCents:50000}).maximumCents).toBe(50000); });
  it("rejects impossible day totals", () => { expect(() => calculateTravel({...travel,homeDays:221})).toThrow(); });
  it("property: additional home days never increase allowance", () => { let previous=Infinity; for(let days=0;days<=220;days++){ const now=calculateTravel({...travel,homeDays:days}).maximumCents; expect(now).toBeLessThanOrEqual(previous); previous=now; } });
});
