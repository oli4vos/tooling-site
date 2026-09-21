import { TAX_PROPOSALS, TAX_PROPOSAL_SOURCE } from "@/lib/financial-constants/tax-proposals";
import { TRANSFER_SOURCE } from "@/lib/financial-constants/tax-reference-2026";
import { calculatePropertyTransfer, type PropertyBuyer, type PropertyTransferInput } from "@/lib/tax/property-transfer";
import { cents } from "@/lib/tax/money";
import { euro, percent, yesNo } from "../_tax_shared/form";
import type { TaxField, TaxToolConfig } from "../_tax_shared/types";
const buyerFields=(suffix:string):TaxField[]=> ([
  {id:`natural${suffix}`,label:`Koper ${suffix}: natuurlijk persoon?`,type:"select",options:yesNo},
  {id:`main${suffix}`,label:`Koper ${suffix}: duurzaam eigen hoofdverblijf?`,type:"select",options:yesNo},
  {id:`birth${suffix}`,label:`Koper ${suffix}: geboortedatum`,type:"date"},
  {id:`used${suffix}`,label:`Koper ${suffix}: startersvrijstelling eerder gebruikt?`,type:"select",options:yesNo},
  {id:`claim${suffix}`,label:`Koper ${suffix}: vrijstelling toepassen als je voldoet?`,type:"select",options:yesNo},
] satisfies TaxField[]).map(field=>({...field,visible: f => {
  if (suffix === "2" && f.two !== "yes") return false;
  if (field.id.startsWith("natural")) return true;
  if (f.type !== "home" || f[`natural${suffix}`] !== "yes") return false;
  if (field.id.startsWith("main")) return true;
  if (f[`main${suffix}`] !== "yes") return false;
  if (!field.id.startsWith("birth")) return true;
  return f[`used${suffix}`] === "no" && f[`claim${suffix}`] === "yes";
}}));
export const config:TaxToolConfig={title:"Overdrachtsbelasting-check",intro:"Bepaal het tarief per koper en vergelijk de voorgestelde wijziging voor een niet-zelfbewoonde woning.",scope:"Voor volledige eigendom van een woning of niet-woning. Erfpacht, gemengd gebruik, bijzondere vrijstellingen en doorverkoop krijgen een afzonderlijke notarischeck.",empty:{},example:{date:"2027-06-01",price:"400000",market:"400000",type:"home",special:"no",two:"no",share:"100",natural1:"yes",main1:"no",birth1:"1995-01-01",used1:"no",claim1:"yes"},fields:[
{id:"date",label:"Datum juridische verkrijging",type:"date",help:"De datum van de notariële leveringsakte in 2026 of 2027."},{id:"price",label:"Koopsom (€)",type:"money"},{id:"market",label:"Waarde in het economische verkeer (€)",type:"money"},{id:"type",label:"Type vastgoed",type:"select",options:[{value:"home",label:"Woning"},{value:"non-home",label:"Bedrijfspand of bouwgrond"},{value:"mixed",label:"Gemengd object"}]},{id:"special",label:"Erfpacht, doorverkoop of mogelijke bijzondere vrijstelling?",type:"select",options:yesNo},{id:"two",label:"Zijn er twee kopers?",type:"select",options:yesNo},{id:"share",label:"Eigendomsaandeel koper 1 (%)",type:"number",min:0.01,max:99.99,visible:f=>f.two==="yes"},...buyerFields("1"),...buyerFields("2")],calculate(f){
const buyer=(suffix:string,sharePpm:number):PropertyBuyer=>({sharePpm,naturalPerson:f[`natural${suffix}`]==="yes",mainHome:f[`main${suffix}`]==="yes",birthDate:f[`birth${suffix}`],exemptionUsed:f[`used${suffix}`]==="yes",claimExemption:f[`claim${suffix}`]==="yes"});const share=f.two==="yes"?percent(f,"share"):1000000;
const input:PropertyTransferInput={date:f.date,priceCents:cents(f.price),marketCents:cents(f.market),type:f.type as PropertyTransferInput["type"],specialSituation:f.special==="yes",buyers:[buyer("1",share),...(f.two==="yes"?[buyer("2",1000000-share)]:[])]};const r=calculatePropertyTransfer(input);
return {conclusion:r.blocked?"Eerst de verkrijging en grondslag laten vaststellen":"Je indicatieve overdrachtsbelasting",rows:[{label:"Grondslag vóór eventuele bijzondere correcties",value:euro(r.baseCents)},...(r.minimumCents===null?[]:[{label:"Belasting",value:r.minimumCents===r.maximumCents?euro(r.minimumCents):`${euro(r.minimumCents)} – ${euro(r.maximumCents!)}`}])],warnings:[r.reason,"Bij meerdere kopers kan per aandeel een ander tarief gelden. Verklaring hoofdverblijf, leeftijd, eerdere vrijstelling en gehele woningwaarde moeten bij de notaris kloppen."],steps:r.buyers.map((b,i)=>`Koper ${i+1}: grondslag ${euro(b.baseCents)}, ${b.unknown?"0–2% afhankelijk van de nog te verifiëren jaargrens":`${b.ratePpm/10000}%`}.`),sources:[{title:"Belastingdienst — startersvrijstelling",url:TRANSFER_SOURCE},{title:"Belastingplan 2027 — tariefverlaging",url:TAX_PROPOSAL_SOURCE}],version:TAX_PROPOSALS.version,verifiedAt:TAX_PROPOSALS.verifiedAt};}};
