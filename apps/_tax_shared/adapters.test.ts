import { describe, expect, it } from "vitest";
import { config as youngtimer } from "../youngtimer-check/logic";
import { config as travel } from "../reiskostenvergoeding-check/logic";
import { config as pension } from "../pensioenplafond-check/logic";
import { config as transfer } from "../overdrachtsbelasting-check/logic";
import { config as eia } from "../eia-investeringsvoordeel/logic";
import { config as income } from "../netto-inkomen-vergelijking/logic";
import { validateTaxForm } from "./form";

describe.each([youngtimer, travel, pension, transfer, eia, income])("$title adapter", config => {
  it("validates and calculates its own example without mutating input", () => {
    const input = Object.freeze({...config.example});
    expect(validateTaxForm(config.fields, input)).toEqual({});
    const result = config.calculate(input);
    expect(result.conclusion.trim()).not.toBe("");
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.version).toContain("proposed");
    expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity|undefined/);
    expect(config.calculate({...input})).toEqual(result);
  });

  it("does not accept empty essential input", () => {
    expect(Object.keys(validateTaxForm(config.fields, config.empty)).length).toBeGreaterThan(0);
    expect(() => config.calculate(config.empty)).toThrow();
  });

  it("rejects invalid visible choices and financial inputs", () => {
    for (const field of config.fields.filter(field => !field.visible || field.visible(config.example))) {
      const invalid = field.type === "select" ? "not-a-choice" : field.type === "date" ? "2027-02-30" : "not-a-number";
      expect(validateTaxForm(config.fields, {...config.example, [field.id]: invalid})[field.id]).toBeDefined();
    }
  });
});

describe("conditional tax form validation", () => {
  it("does not require hidden second-buyer fields", () => {
    expect(validateTaxForm(transfer.fields, transfer.example)).toEqual({});
    expect(validateTaxForm(transfer.fields, {...transfer.example, two: "yes"})).toHaveProperty("natural2");
    expect(validateTaxForm(transfer.fields, {...transfer.example, two: "yes", natural2:"yes", main2:"yes", used2:"no", claim2:"yes"})).toHaveProperty("birth2");
  });
  it("rejects fractional cents instead of silently rounding user input", () => {
    expect(validateTaxForm(pension.fields, {...pension.example, salary: "1000.001"})).toHaveProperty("salary");
  });
});
