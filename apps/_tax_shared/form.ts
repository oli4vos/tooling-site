import { parseIsoDateInput } from "@/lib/calendar/date-utils";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { cents } from "@/lib/tax/money";
import type { TaxField, TaxForm } from "./types";

export const yesNo = [{value:"yes",label:"Ja"},{value:"no",label:"Nee"}] as const;
export function validateTaxForm(fields: TaxField[], form: TaxForm): Record<string,string> {
  const errors: Record<string,string> = {};
  for (const field of fields.filter(field => !field.visible || field.visible(form))) {
    const raw = (form[field.id] ?? "").trim();
    if (!raw) { if (!field.optional) errors[field.id] = "Vul dit veld in."; continue; }
    if (field.type === "date") { if (!parseIsoDateInput(raw)) errors[field.id] = "Vul een volledige geldige datum in."; continue; }
    if (field.type === "select") { if (!field.options?.some(option => option.value === raw)) errors[field.id] = "Kies een geldige optie."; continue; }
    const number = parseOptionalDecimalInput(raw);
    if (number === undefined || number < (field.min ?? 0) || number > (field.max ?? 1_000_000_000)) { errors[field.id] = "Vul een getal binnen het aangegeven bereik in."; continue; }
    if (field.type === "money") { try { cents(raw); } catch { errors[field.id] = "Gebruik maximaal twee decimalen, zonder duizendtallenpunten."; } }
  }
  return errors;
}
export const euro = (amount: number) => new Intl.NumberFormat("nl-NL", {style:"currency",currency:"EUR"}).format(amount / 100);
export function number(form: TaxForm, key: string): number {
  const parsed = parseOptionalDecimalInput(form[key]);
  if (parsed === undefined) throw new Error(`Vul ${key} in.`);
  return parsed;
}
export function percent(form: TaxForm, key: string): number { return cents(form[key]) * 100; }
export function optionalPercent(form: TaxForm, key: string) { return form[key]?.trim() ? percent(form,key) : undefined; }
