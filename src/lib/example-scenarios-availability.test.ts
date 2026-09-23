import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appRegistry } from "@/lib/app-registry";

const workspace = process.cwd();
const sharedTaxCalculator = readFileSync(join(workspace, "apps/_tax_shared/TaxCalculator.tsx"), "utf8");
const sharedDuoCalculator = readFileSync(join(workspace, "apps/_duo_simple/FocusedDuoTool.tsx"), "utf8");

describe("voorbeeldscenario's voor openbare tools", () => {
  it("geeft elke openbare tool een zichtbare actie om realistische testwaarden te laden", () => {
    const publicTools = appRegistry.filter((app) => app.enabled && app.visibility === "public");
    expect(publicTools).toHaveLength(24);
    expect(sharedTaxCalculator).toContain("Voorbeeld invullen");
    expect(sharedDuoCalculator).toContain("Voorbeeld invullen");

    publicTools.forEach((app) => {
      const source = readFileSync(join(workspace, "apps", app.slug, "Calculator.tsx"), "utf8");
      const hasDirectExample = source.includes("Voorbeeld invullen");
      const usesSharedTaxExample = source.includes("TaxCalculator");
      const usesSharedDuoExample = source.includes("FocusedDuoTool");
      expect(
        hasDirectExample || usesSharedTaxExample || usesSharedDuoExample,
        `${app.slug} mist een voorbeeldactie`,
      ).toBe(true);
    });
  });
});
