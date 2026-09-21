import { describe, expect, it } from "vitest";
import { config } from "./logic";
import { euro, validateTaxForm } from "../_tax_shared/form";

describe("pensioenplafond-check publication scenarios", () => {
  it("has a valid example and an explicit source version", () => {
    expect(validateTaxForm(config.fields,config.example)).toEqual({});
    expect(config.calculate(config.example).version).toContain("proposed");
  });
  it("preserves the tool-specific golden result and safe exception path", () => {
    expect(config.calculate({...config.example,growth:"0",indexation:"0"}).rows[0].value).toBe(euro(1320000));
    expect(config.calculate({...config.example,growth:"0",bonus:"0"}).conclusion).toContain("onder het plafond");
  });
});
