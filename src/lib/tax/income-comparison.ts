import { INCOME_RULES } from "@/lib/financial-constants/income-comparison-rules";
import { calculateProgressiveTaxCents } from "./progressive-tax";
import { requireCents, taxRate } from "./money";
export type IncomeComparisonInput={salaryCents:number;pensionCents:number;otherCents:number;pensionContributionCents:number;aow:"none"|"full"|"before1946"|"transition";singleElderly:boolean;iack:boolean;disabled:boolean};
export function calculateIncomeYear(input:IncomeComparisonInput,year:2026|2027){
  [input.salaryCents,input.pensionCents,input.otherCents,input.pensionContributionCents].forEach(v=>requireCents(v));
  if(input.pensionContributionCents>input.salaryCents)throw new Error("De pensioeninhouding is hoger dan het loon.");
  if(input.aow==="transition")throw new Error("In het jaar waarin je AOW bereikt veranderen premies per maand. Deze jaarvergelijking kan daarvoor nog geen betrouwbare uitkomst geven.");
  const aow=input.aow!=="none";const rules=INCOME_RULES[year];
  const income=input.salaryCents-input.pensionContributionCents+input.pensionCents+input.otherCents;
  const labour=input.salaryCents-input.pensionContributionCents;
  const brackets=rules.brackets.map(b=>({...b}));
  if(aow){brackets[0].ratePpm=rules.aowRate.value;if(input.aow==="before1946")brackets[0].limitCents=rules.oldAowLimit.value;}
  const gross=calculateProgressiveTaxCents(income,brackets);
  const general=Math.max(0,(aow?rules.generalAow:rules.general).value-taxRate(Math.max(0,income-rules.generalStart.value),(aow?rules.generalAowReduction:rules.generalReduction).value));
  const elderly=aow?Math.max(0,rules.elderly.value-taxRate(Math.max(0,income-rules.elderlyStart.value),150000)):0;
  const single=aow&&input.singleElderly?rules.singleElderly.value:0;
  const iack=input.iack&&!aow?Math.min(rules.iack.value,taxRate(Math.max(0,labour-rules.iackStart.value),114500)):0;
  const disabled=input.disabled&&!aow?rules.disabled.value:0;
  let workMin=0,workMax=0;let uncertain=false;
  if(year===2026){const r=INCOME_RULES[2026];const limits=r.labourLimits.map(p=>p.value);const bases=(aow?r.labourAowBases:r.labourBases).map(p=>p.value);const rates=(aow?r.labourAowRates:r.labourRates).map(p=>p.value);const segment=labour<=limits[0]?0:labour<=limits[1]?1:labour<=limits[2]?2:3;const amount=Math.max(0,bases[segment]+taxRate(labour-(segment===0?0:limits[segment-1]),segment===3?-rates[segment]:rates[segment]));workMin=amount;workMax=amount;}
  else if(labour>0){const r=INCOME_RULES[2027];if(!aow&&labour>=r.labourStart.value){workMin=workMax=Math.max(0,r.labourMax.value-taxRate(labour-r.labourStart.value,r.labourReduction.value));}else{workMax=r.labourMax.value;uncertain=true;}}
  const fixedCredits=general+elderly+single+iack+disabled;
  const taxMin=Math.max(0,gross.totalCents-fixedCredits-workMax);
  const taxMax=Math.max(0,gross.totalCents-fixedCredits-workMin);
  return {year,incomeCents:income,grossTaxCents:gross.totalCents,generalCents:general,elderlyCents:elderly,singleCents:single,iackCents:iack,disabledCents:disabled,workMinCents:workMin,workMaxCents:workMax,taxMinCents:taxMin,taxMaxCents:taxMax,netMinCents:income-taxMax,netMaxCents:income-taxMin,uncertain};
}
