/** Integer cents at the boundary, exact rational arithmetic inside the tax core.
 * Never use this rounding policy for statutory whole-euro rounding implicitly.
 */
export function cents(value: string | number): number {
  const text = String(value).trim().replace(",", ".");
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) throw new Error("Vul een bedrag in met maximaal twee decimalen.");
  const amount = Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(amount)) throw new Error("Het bedrag is te groot.");
  return match[1] ? -amount : amount;
}

export function ratio(amount: number, numerator: number, denominator: number): number {
  if (![amount, numerator, denominator].every(Number.isSafeInteger) || denominator <= 0) {
    throw new Error("Ongeldige geldberekening.");
  }
  const product = BigInt(amount) * BigInt(numerator);
  const sign = product < BigInt(0) ? -BigInt(1) : BigInt(1);
  const absolute = product * sign;
  const rounded = sign * ((absolute + BigInt(Math.floor(denominator / 2))) / BigInt(denominator));
  const result = Number(rounded);
  if (!Number.isSafeInteger(result)) throw new Error("Het berekende bedrag is te groot.");
  return result;
}

/** Parts per million support percentages to four decimal places. */
export function taxRate(amount: number, partsPerMillion: number): number {
  return ratio(amount, partsPerMillion, 1_000_000);
}

export function requireCents(value: number, allowNegative = false): number {
  if (!Number.isSafeInteger(value) || (!allowNegative && value < 0)) throw new Error("Ongeldig bedrag in eurocenten.");
  return value;
}
