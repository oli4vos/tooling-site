import { describe, expect, it } from "vitest";
import { config } from "./logic";
import { euro, validateTaxForm } from "../_tax_shared/form";

describe("reiskostenvergoeding-check publication scenarios", () => {
  it("has a valid example and an explicit source version", () => {
    expect(validateTaxForm(config.fields,config.example)).toEqual({});
    expect(config.calculate(config.example).version).toContain("proposed");
  });
  it("preserves the tool-specific golden result and safe exception path", () => {
    expect(config.calculate(config.example).rows[0].value).toBe(euro(200000));
    expect(() => config.calculate({...config.example, home:"221"})).toThrow();
  });
});
