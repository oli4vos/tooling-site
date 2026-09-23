import { FINANCIAL_CONSTANTS_BY_YEAR } from "./years";
import { TAX_PROPOSAL_SOURCE, type TaxParameter } from "./tax-proposals";
import { cents } from "@/lib/tax/money";
const labourSource="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/tabel-arbeidskorting-2026";
const credits2026=FINANCIAL_CONSTANTS_BY_YEAR[2026].box1.credits;
function p(value:number,unit:TaxParameter["unit"],year:number,locator:string,sourceUrl=TAX_PROPOSAL_SOURCE):TaxParameter{return {value,unit,effectiveFrom:`${year}-01-01`,effectiveUntil:`${year}-12-31`,status:year===2026?"enacted":"proposed",sourceUrl,sourceTitle:year===2026?"Jaarparameters inkomstenbelasting 2026":"Belastingplan 2027 — parametertabellen",sourceDate:year===2026?"2026-01-01":"2026-09-15",locator,lastVerifiedAt:"2026-09-18",explanation:locator,change:year===2026?"Vastgelegde referentie":"Voorstelversie september; WML-grenzen voorlopig"};}
export const INCOME_RULES={
  2026:{
    brackets:FINANCIAL_CONSTANTS_BY_YEAR[2026].box1.brackets.map(b=>({limitCents:b.upTo===null?null:cents(b.upTo),ratePpm:Math.round(b.rate*10000)})),
    aowRate:p(178500,"ppm",2026,"Tabel 2"),oldAowLimit:p(4112300,"cents",2026,"Tabel 2"),
    general:p(credits2026.general.max,"cents",2026,"Tabel algemene heffingskorting",credits2026.meta.sourceUrl!),generalAow:p(credits2026.generalAow.max,"cents",2026,"Tabel algemene heffingskorting AOW",credits2026.meta.sourceUrl!),generalStart:p(credits2026.general.start,"cents",2026,"Tabel algemene heffingskorting",credits2026.meta.sourceUrl!),generalReduction:p(credits2026.general.reductionRate,"ppm",2026,"Tabel algemene heffingskorting",credits2026.meta.sourceUrl!),generalAowReduction:p(credits2026.generalAow.reductionRate,"ppm",2026,"Tabel algemene heffingskorting AOW",credits2026.meta.sourceUrl!),
    labourLimits:credits2026.labour.limits.map((v,i)=>p(v,"cents",2026,`Arbeidskorting grens ${i+1}`,labourSource)),
    labourRates:credits2026.labour.rates.map((v,i)=>p(v,"ppm",2026,`Arbeidskorting tarief ${i+1}`,labourSource)),
    labourBases:credits2026.labour.bases.map((v,i)=>p(v,"cents",2026,`Arbeidskorting basis ${i+1}`,labourSource)),
    labourAowRates:credits2026.labour.aowRates.map(v=>p(v,"ppm",2026,"Arbeidskorting heel jaar AOW",labourSource)),
    labourAowBases:credits2026.labour.aowBases.map(v=>p(v,"cents",2026,"Arbeidskorting heel jaar AOW",labourSource)),
    elderly:p(credits2026.elderly.max,"cents",2026,"Tabel ouderenkorting",credits2026.meta.sourceUrl!),elderlyStart:p(credits2026.elderly.start,"cents",2026,"Tabel ouderenkorting",credits2026.meta.sourceUrl!),singleElderly:p(credits2026.singleElderly,"cents",2026,"Tabel alleenstaande ouderenkorting",credits2026.meta.sourceUrl!),iack:p(credits2026.iack.max,"cents",2026,"Tabel IACK",credits2026.meta.sourceUrl!),iackStart:p(credits2026.iack.start,"cents",2026,"Tabel IACK",credits2026.meta.sourceUrl!),disabled:p(credits2026.disabled,"cents",2026,"Tabel jonggehandicaptenkorting",credits2026.meta.sourceUrl!),
  },
  2027:{
    brackets:[{limitCents:3924700,ratePpm:362300},{limitCents:7842600,ratePpm:381600},{limitCents:null,ratePpm:495000}],
    aowRate:p(183300,"ppm",2027,"Tabel 2"),oldAowLimit:p(4163700,"cents",2027,"Tabel 2"),
    general:p(315400,"cents",2027,"Tabel 1"),generalAow:p(159600,"cents",2027,"Tabel 2"),generalStart:p(3091000,"cents",2027,"Tabel 1/2 — WML voorlopig"),generalReduction:p(66380,"ppm",2027,"Tabel 1"),generalAowReduction:p(33580,"ppm",2027,"Tabel 2"),
    labourMax:p(592900,"cents",2027,"Tabel 1"),labourStart:p(4783400,"cents",2027,"Tabel 1 — WML voorlopig"),labourReduction:p(65100,"ppm",2027,"Tabel 1"),
    elderly:p(199300,"cents",2027,"Tabel 2 ouderenkorting"),elderlyStart:p(4657700,"cents",2027,"Tabel 2 ouderenkorting"),singleElderly:p(54700,"cents",2027,"Tabel 2 alleenstaande ouderenkorting"),iack:p(291800,"cents",2027,"Tabel 1 IACK"),iackStart:p(631600,"cents",2027,"Tabel 1 IACK"),disabled:p(93500,"cents",2027,"Tabel 1 jonggehandicaptenkorting"),
  },
};
