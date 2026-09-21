import { describe, expect, it } from "vitest";
import { config } from "./logic";
import { euro, validateTaxForm } from "../_tax_shared/form";

describe("netto-inkomen-vergelijking publication scenarios", () => {
  it("has a valid example and an explicit source version", () => {
    expect(validateTaxForm(config.fields,config.example)).toEqual({});
    expect(config.calculate(config.example).version).toContain("proposed");
  });
  it("preserves the tool-specific golden result and safe exception path", () => {
    expect(config.calculate({...config.example,salary:"0"}).rows.every(row=>row.value===euro(0))).toBe(true);
    expect(config.calculate({...config.example,salary:"30000"}).conclusion).toContain("bandbreedte");
    expect(() => config.calculate({...config.example,aow:"transition"})).toThrow();
  });
});
