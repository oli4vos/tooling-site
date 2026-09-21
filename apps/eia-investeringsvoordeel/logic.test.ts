import { describe, expect, it } from "vitest";
import { config } from "./logic";
import { euro, validateTaxForm } from "../_tax_shared/form";

describe("eia-investeringsvoordeel publication scenarios", () => {
  it("has a valid example and an explicit source version", () => {
    expect(validateTaxForm(config.fields,config.example)).toEqual({});
    expect(config.calculate(config.example).version).toContain("proposed");
  });
  it("preserves the tool-specific golden result and safe exception path", () => {
    expect(config.calculate(config.example).rows[0].value).toBe(euro(141900));
    expect(config.calculate({...config.example,new:"no"}).rows[0].value).toBe(euro(0));
    expect(() => config.calculate({...config.example,obligation:"2027-01-01",notification:"2027-02-01"})).toThrow(/2026/);
  });
});
