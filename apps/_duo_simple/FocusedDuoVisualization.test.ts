import { describe, expect, it } from "vitest";
import type { StudyDebtTimelinePoint } from "@/lib/duo/studeren-stoppen";
import { buildYearlyDebtRows } from "./FocusedDuoVisualization";

function point(
  date: string,
  closingDebt: number,
  phase: StudyDebtTimelinePoint["phase"],
): StudyDebtTimelinePoint {
  return {
    month: 0,
    date,
    phase,
    openingDebt: closingDebt,
    interest: 0,
    studyAdditions: 0,
    giftConversion: 0,
    payment: 0,
    closingDebt,
  };
}

describe("focused DUO visualisation", () => {
  it("uses the last central timeline point of every calendar year", () => {
    expect(
      buildYearlyDebtRows([
        point("2026-01", 1_000, "study"),
        point("2026-12", 4_500, "study"),
        point("2027-12", 4_200, "aanloop"),
        point("2028-12", 3_700, "repayment"),
      ]),
    ).toEqual([
      { year: "2026", phase: "Studie", closingDebt: 4_500 },
      { year: "2027", phase: "Aanloopfase", closingDebt: 4_200 },
      { year: "2028", phase: "Terugbetalen", closingDebt: 3_700 },
    ]);
  });
});
