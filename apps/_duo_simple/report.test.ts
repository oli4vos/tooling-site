import { describe, expect, it } from "vitest";
import { createSimpleDuoView, defaultSimpleDuoValues } from "./focused-logic";
import { buildFocusedDuoPdfReport, focusedDuoReportFileName } from "./report";

describe("focused DUO pdf report", () => {
  it.each([
    ["start-borrowing", "Verwachte studieschuld"],
    ["stop-cost", "Kosten van stoppen"],
    ["monthly-impact", "Impact van je maandelijkse leenbedrag"],
  ] as const)("keeps the %s PDF aligned with the focused web result", (mode, title) => {
    const values = defaultSimpleDuoValues(mode);
    const view = createSimpleDuoView(mode, values);
    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected a valid focused DUO view");

    const report = buildFocusedDuoPdfReport(
      mode,
      values,
      view,
      new Date("2026-08-11T10:00:00.000Z"),
    );

    expect(report.title).toContain(title);
    expect(report.summaryLines.map((line) => line.value)).toContain(
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(view.focusScenario.totalPaid),
    );
    expect(report.inputLines.some((line) => line.label === "Gekozen DUO-rentejaar")).toBe(true);
    expect(report.sources.length).toBeGreaterThan(0);
    expect(focusedDuoReportFileName(mode, view)).toContain(view.result.calculationMonth);
  });

  it("names the monthly-impact PDF after the user question", () => {
    const values = defaultSimpleDuoValues("monthly-impact");
    const view = createSimpleDuoView("monthly-impact", values);
    if (!view.isValid) throw new Error("expected a valid focused DUO view");

    expect(focusedDuoReportFileName("monthly-impact", view)).toBe(
      `impact-maandelijks-leenbedrag-${view.result.calculationMonth}.pdf`,
    );
  });
});
