import { TAX_REFERENCE_2026 } from "@/lib/financial-constants/tax-reference-2026";
import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import { addCalendarYears, toIsoDateKey } from "@/lib/calendar/date-utils";
import { fiscalDate } from "./vehicles";
import { ratio, requireCents, taxRate } from "./money";

export type PropertyBuyer = { sharePpm:number; naturalPerson:boolean; mainHome:boolean; birthDate:string; exemptionUsed:boolean; claimExemption:boolean };
export type PropertyTransferInput = { date:string; priceCents:number; marketCents:number; type:"home"|"non-home"|"mixed"; specialSituation:boolean; buyers:PropertyBuyer[] };
export function calculatePropertyTransfer(input:PropertyTransferInput, rules=TAX_PROPOSALS) {
  const date=fiscalDate(input.date); const year=date.getUTCFullYear();
  if(year!==2026&&year!==2027) throw new Error("Kies een verkrijgingsdatum in 2026 of 2027.");
  requireCents(input.priceCents);requireCents(input.marketCents);
  if(!input.buyers.length||input.buyers.reduce((sum,b)=>sum+b.sharePpm,0)!==1_000_000) throw new Error("De eigendomsaandelen moeten samen 100% zijn.");
  const base=Math.max(input.priceCents,input.marketCents);
  if(input.type==="mixed"||input.specialSituation) return {baseCents:base,blocked:true,reason:"Gemengd gebruik, erfpacht, doorverkoop of een bijzondere vrijstelling vereist afzonderlijke grondslag- en vrijstellingscontrole door de notaris.",buyers:[],minimumCents:null,maximumCents:null};
  const buyers=input.buyers.map(b=>{
    if(!Number.isInteger(b.sharePpm)||b.sharePpm<=0||b.sharePpm>1_000_000) throw new Error("Ongeldig eigendomsaandeel.");
    const needsAge = input.type === "home" && b.naturalPerson && b.mainHome && !b.exemptionUsed && b.claimExemption;
    const birth=needsAge ? fiscalDate(b.birthDate) : null;
    if(needsAge && b.birthDate>input.date) throw new Error("Geboortedatum ligt na verkrijging.");
    const eligibleAge=birth !== null && toIsoDateKey(addCalendarYears(birth,18))<=input.date&&toIsoDateKey(addCalendarYears(birth,35))>input.date;
    const potentialExemption=b.naturalPerson&&b.mainHome&&eligibleAge&&!b.exemptionUsed&&b.claimExemption;
    const unknown=year===2027&&potentialExemption;
    const exemption=year===2026&&potentialExemption&&base<=TAX_REFERENCE_2026.starterPropertyLimit.value;
    const rate=input.type==="non-home"?TAX_REFERENCE_2026.nonHousingRate.value:!b.naturalPerson||!b.mainHome?rules.parameters[`transfer${year}`].value:exemption?0:TAX_REFERENCE_2026.ownHomeRate.value;
    const shareBase=ratio(base,b.sharePpm,1_000_000);
    return {baseCents:shareBase,ratePpm:rate,exemption,unknown:unknown&&input.type==="home",taxCents:taxRate(shareBase,rate),minimumCents:unknown&&input.type==="home"?0:taxRate(shareBase,rate)};
  });
  return {baseCents:base,blocked:false,reason:buyers.some(b=>b.unknown)?"De starterswaardegrens 2027 is in deze bronversie nog niet geverifieerd. Daarom tonen we voor deze koper de bandbreedte tussen 0% en 2%.":"Tarief bepaald per koper; de woningwaardegrens wordt op de hele woning getoetst.",buyers,minimumCents:buyers.reduce((s,b)=>s+b.minimumCents,0),maximumCents:buyers.reduce((s,b)=>s+b.taxCents,0)};
}
