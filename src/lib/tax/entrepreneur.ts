import { ENTREPRENEUR_RULES } from "@/lib/financial-constants/entrepreneur-rules";
import { TAX_PROPOSALS } from "@/lib/financial-constants/tax-proposals";
import { ratio, requireCents, taxRate } from "./money";
export type EntrepreneurHistory={year:number;entrepreneur:boolean;selfDeduction:boolean;disabilityDeduction:boolean};
export type EntrepreneurYear={year:2026|2027|2028|2029;profitCents:number;hours:number;otherWorkHours:number;entrepreneur:boolean;aowAtStart:boolean;disabilityBenefit:boolean};
export function calculateEntrepreneurPlan(history:EntrepreneurHistory[],years:EntrepreneurYear[],reference=false){
  if(new Set(history.map(row=>row.year)).size!==history.length)throw new Error("Ieder historiejaar mag maar één keer voorkomen.");
  if(history.some(h=>(h.selfDeduction||h.disabilityDeduction)&&!h.entrepreneur))throw new Error("Aftrekhistorie vereist ondernemerschap.");
  const ledger=[...history];const rows=[];
  for(const input of years){
    requireCents(input.profitCents,true);
    if(!Number.isInteger(input.hours)||input.hours<0||input.hours>8784||!Number.isInteger(input.otherWorkHours)||input.otherWorkHours<0||input.hours+input.otherWorkHours>8784)throw new Error("Vul geldige jaaruren in.");
    const prior=ledger.filter(row=>row.year<input.year&&row.year>=input.year-ENTREPRENEUR_RULES.historyYears);
    if(prior.length!==ENTREPRENEUR_RULES.historyYears)throw new Error(`Vul de vijf afzonderlijke historiejaren vóór ${input.year} in.`);
    if(ledger.some(row=>row.year===input.year))throw new Error("Jaar staat al in de historie; gebruik een oplopende planning.");
    const starter=prior.some(row=>!row.entrepreneur);
    const hoursMet=input.hours>=ENTREPRENEUR_RULES.hours&&(starter||input.hours>input.otherWorkHours);
    const selfEligible=input.entrepreneur&&hoursMet;
    const priorUses=prior.filter(row=>row.selfDeduction).length;
    const starterEligible=selfEligible&&starter&&priorUses<=ENTREPRENEUR_RULES.maximumPriorUses;
    const starterAmount=reference?TAX_PROPOSALS.parameters.starter2026.value:input.year===2026?TAX_PROPOSALS.parameters.starter2026.value:input.year===2027?TAX_PROPOSALS.parameters.starter2027.value:0;
    const startup=starterEligible?ratio(starterAmount,1,input.aowAtStart?2:1):0;
    const availableSelf=selfEligible?ratio(ENTREPRENEUR_RULES.selfDeductionCents[reference?2026:input.year],1,input.aowAtStart?2:1):0;
    const self=startup>0?availableSelf:Math.min(Math.max(0,input.profitCents),availableSelf);
    const disabilityUses=prior.filter(row=>row.disabilityDeduction).length;
    const disabilityEligible=input.entrepreneur&&starter&&!hoursMet&&input.hours>=ENTREPRENEUR_RULES.disabilityHours&&input.disabilityBenefit&&!input.aowAtStart&&disabilityUses<3&&(reference||input.year<2029);
    const disability=disabilityEligible?Math.min(Math.max(0,input.profitCents),ENTREPRENEUR_RULES.disabilityCents[disabilityUses]):0;
    const afterDeduction=input.profitCents-self-startup-disability;
    const mkb=input.entrepreneur?taxRate(afterDeduction,ENTREPRENEUR_RULES.mkbPpm):0;
    const taxable=afterDeduction-mkb;
    rows.push({year:input.year,profitCents:input.profitCents,selfCents:self,starterCents:startup,disabilityCents:disability,mkbCents:mkb,taxableProfitCents:taxable,unusedSelfCents:availableSelf-self,priorUses,hoursMet,history:prior});
    ledger.push({year:input.year,entrepreneur:input.entrepreneur,selfDeduction:selfEligible,disabilityDeduction:disabilityEligible});
  }
  return rows;
}
