import { requireCents, taxRate } from "./money";
export type CentTaxBracket = { limitCents: number | null; ratePpm: number };
export function calculateProgressiveTaxCents(incomeCents:number,brackets:readonly CentTaxBracket[]) {
  requireCents(incomeCents);
  let previous=0;
  const rows=brackets.map(bracket=>{
    if(!Number.isInteger(bracket.ratePpm)||bracket.ratePpm<0||bracket.ratePpm>1_000_000)throw new Error("Ongeldige schijf.");
    if(bracket.limitCents!==null&&bracket.limitCents<=previous)throw new Error("Schijfgrenzen moeten oplopen.");
    const amount=Math.max(0,Math.min(incomeCents,bracket.limitCents??incomeCents)-previous);
    previous=bracket.limitCents??incomeCents;
    return {amountCents:amount,taxCents:taxRate(amount,bracket.ratePpm),ratePpm:bracket.ratePpm};
  });
  return {rows,totalCents:rows.reduce((sum,row)=>sum+row.taxCents,0)};
}
