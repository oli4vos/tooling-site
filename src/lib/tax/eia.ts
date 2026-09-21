import { addCalendarMonths, toIsoDateKey } from "@/lib/calendar/date-utils";
import { TAX_REFERENCE_2026 } from "@/lib/financial-constants/tax-reference-2026";
import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import { fiscalDate } from "./vehicles";
import { requireCents, taxRate } from "./money";
export type EiaInput={investmentCents:number;subsidyCents:number;privatePpm:number;profitCents:number;taxPpm:number;otherInvestmentsCents:number;obligationDate:string;notificationDate:string;newAsset:boolean;listConfirmed:boolean;mia:boolean;route:"purchase"|"production"};
export function calculateEia(input:EiaInput,rules=TAX_PROPOSALS){
  for(const value of [input.investmentCents,input.subsidyCents,input.profitCents,input.otherInvestmentsCents]) requireCents(value);
  for(const rate of [input.privatePpm,input.taxPpm]) if(!Number.isInteger(rate)||rate<0||rate>1_000_000)throw new Error("Ongeldig percentage.");
  if(input.subsidyCents>input.investmentCents)throw new Error("De subsidie is hoger dan de investering.");
  const obligation=fiscalDate(input.obligationDate);fiscalDate(input.notificationDate);
  if (obligation.getUTCFullYear() !== 2026) throw new Error("Deze vergelijking gebruikt de Energielijst en jaargrenzen van 2026. Vul een verplichtingsdatum in 2026 in; de 2027-kolom vergelijkt alleen het voorgestelde aftrekpercentage.");
  if(input.notificationDate<input.obligationDate)throw new Error("De melding ligt vóór de verplichting.");
  const deadline=toIsoDateKey(addCalendarMonths(obligation,3));
  const late=input.notificationDate>deadline;
  const net=taxRate(input.investmentCents-input.subsidyCents,1_000_000-input.privatePpm);
  const reasons:string[]=[];
  if(!input.newAsset)reasons.push("EIA is niet beschikbaar voor een eerder gebruikt bedrijfsmiddel.");
  if(input.mia)reasons.push("EIA en MIA mogen niet op hetzelfde bedrijfsmiddel worden gecombineerd.");
  if(net<TAX_REFERENCE_2026.eiaMinimum.value)reasons.push("De grondslag ligt onder het minimum per bedrijfsmiddel.");
  if(!input.listConfirmed)reasons.push("De match met de Energielijst is niet bevestigd; dit blijft een voorwaardelijk scenario.");
  if(input.route==="production")reasons.push("Voor voortbrengingskosten geldt een andere meldroute. Deze datum is alleen de vergelijking voor aanschafkosten.");
  if(late)reasons.push("De ingevulde melding ligt na drie kalendermaanden; tijdige melding is niet aangetoond.");
  const ineligible=!input.newAsset||input.mia||net<TAX_REFERENCE_2026.eiaMinimum.value;
  const base=ineligible?0:Math.min(net,Math.max(0,TAX_REFERENCE_2026.eiaMaximum.value-input.otherInvestmentsCents));
  const rows=([2026,2027] as const).map(year=>{const deduction=taxRate(base,rules.parameters[`eia${year}`].value);return {year,baseCents:base,deductionCents:deduction,currentBenefitCents:taxRate(Math.min(deduction,input.profitCents),input.taxPpm),unrelievedDeductionCents:Math.max(0,deduction-input.profitCents)};});
  return {deadline,late,reasons,rows,conditional:!input.listConfirmed||late||input.route==="production",extraBenefitCents:rows[1].currentBenefitCents-rows[0].currentBenefitCents};
}
