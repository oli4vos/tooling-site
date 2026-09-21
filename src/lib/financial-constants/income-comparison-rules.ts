import { FINANCIAL_CONSTANTS_BY_YEAR } from "./years";
import { TAX_PROPOSAL_SOURCE, type TaxParameter } from "./tax-proposals";
import { cents } from "@/lib/tax/money";
const labourSource="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/tabel-arbeidskorting-2026";
function p(value:number,unit:TaxParameter["unit"],year:number,locator:string,sourceUrl=TAX_PROPOSAL_SOURCE):TaxParameter{return {value,unit,effectiveFrom:`${year}-01-01`,effectiveUntil:`${year}-12-31`,status:year===2026?"enacted":"proposed",sourceUrl,sourceTitle:year===2026?"Jaarparameters inkomstenbelasting 2026":"Belastingplan 2027 — parametertabellen",sourceDate:year===2026?"2026-01-01":"2026-09-15",locator,lastVerifiedAt:"2026-09-18",explanation:locator,change:year===2026?"Vastgelegde referentie":"Voorstelversie september; WML-grenzen voorlopig"};}
export const INCOME_RULES={
  2026:{
    brackets:FINANCIAL_CONSTANTS_BY_YEAR[2026].box1.brackets.map(b=>({limitCents:b.upTo===null?null:cents(b.upTo),ratePpm:Math.round(b.rate*10000)})),
    aowRate:p(178500,"ppm",2026,"Tabel 2"),oldAowLimit:p(4112300,"cents",2026,"Tabel 2"),
    general:p(311500,"cents",2026,"Tabel 1"),generalAow:p(155600,"cents",2026,"Tabel 2"),generalStart:p(2973600,"cents",2026,"Tabel 1/2"),generalReduction:p(63980,"ppm",2026,"Tabel 1"),generalAowReduction:p(31950,"ppm",2026,"Tabel 2"),
    labourLimits:[p(1196500,"cents",2026,"Arbeidskorting eerste grens",labourSource),p(2584500,"cents",2026,"Arbeidskorting tweede grens",labourSource),p(4559200,"cents",2026,"Arbeidskorting derde grens",labourSource)],
    labourRates:[p(83240,"ppm",2026,"Eerste opbouw",labourSource),p(310090,"ppm",2026,"Tweede opbouw",labourSource),p(19500,"ppm",2026,"Derde opbouw",labourSource),p(65100,"ppm",2026,"Afbouw",labourSource)],
    labourBases:[p(0,"cents",2026,"Begin",labourSource),p(99600,"cents",2026,"Eerste maximum",labourSource),p(530000,"cents",2026,"Tweede maximum",labourSource),p(568500,"cents",2026,"Maximum",labourSource)],
    labourAowRates:[41560,154830,9740,32500].map(v=>p(v,"ppm",2026,"Arbeidskorting heel jaar AOW",labourSource)),
    labourAowBases:[0,49800,264700,284000].map(v=>p(v,"cents",2026,"Arbeidskorting heel jaar AOW",labourSource)),
    elderly:p(206700,"cents",2026,"Tabel 2 ouderenkorting"),elderlyStart:p(4600200,"cents",2026,"Tabel 2 ouderenkorting"),singleElderly:p(54000,"cents",2026,"Tabel 2 alleenstaande ouderenkorting"),iack:p(303200,"cents",2026,"Tabel 1 IACK"),iackStart:p(623900,"cents",2026,"Tabel 1 IACK"),disabled:p(92300,"cents",2026,"Tabel 1 jonggehandicaptenkorting"),
  },
  2027:{
    brackets:[{limitCents:3924700,ratePpm:362300},{limitCents:7842600,ratePpm:381600},{limitCents:null,ratePpm:495000}],
    aowRate:p(183300,"ppm",2027,"Tabel 2"),oldAowLimit:p(4163700,"cents",2027,"Tabel 2"),
    general:p(315400,"cents",2027,"Tabel 1"),generalAow:p(159600,"cents",2027,"Tabel 2"),generalStart:p(3091000,"cents",2027,"Tabel 1/2 — WML voorlopig"),generalReduction:p(66380,"ppm",2027,"Tabel 1"),generalAowReduction:p(33580,"ppm",2027,"Tabel 2"),
    labourMax:p(592900,"cents",2027,"Tabel 1"),labourStart:p(4783400,"cents",2027,"Tabel 1 — WML voorlopig"),labourReduction:p(65100,"ppm",2027,"Tabel 1"),
    elderly:p(199300,"cents",2027,"Tabel 2 ouderenkorting"),elderlyStart:p(4657700,"cents",2027,"Tabel 2 ouderenkorting"),singleElderly:p(54700,"cents",2027,"Tabel 2 alleenstaande ouderenkorting"),iack:p(291800,"cents",2027,"Tabel 1 IACK"),iackStart:p(631600,"cents",2027,"Tabel 1 IACK"),disabled:p(93500,"cents",2027,"Tabel 1 jonggehandicaptenkorting"),
  },
};
