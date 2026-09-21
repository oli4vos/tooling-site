import { describe,expect,it } from "vitest";
import { calculatePropertyTransfer, type PropertyTransferInput } from "./property-transfer";
import { calculateEia } from "./eia";
import { calculateEntrepreneurPlan } from "./entrepreneur";
import { calculateIncomeYear } from "./income-comparison";
describe("property transfer",()=>{
  const base:PropertyTransferInput={date:"2026-06-01",priceCents:40000000,marketCents:40000000,type:"home",specialSituation:false,buyers:[{sharePpm:1000000,naturalPerson:true,mainHome:false,birthDate:"1995-06-01",exemptionUsed:false,claimExemption:true}]};
  it("golden: 400000 home gives 32000 and proposed 28000",()=>{expect(calculatePropertyTransfer(base).maximumCents).toBe(3200000);expect(calculatePropertyTransfer({...base,date:"2027-06-01"}).maximumCents).toBe(2800000);});
  it("non-home stays 10.4 percent",()=>{expect(calculatePropertyTransfer({...base,type:"non-home",date:"2027-06-01"}).maximumCents).toBe(4160000);});
  it("age 35 boundary and whole-home limit",()=>{const b={...base.buyers[0],mainHome:true,birthDate:"1991-06-01"};expect(calculatePropertyTransfer({...base,buyers:[b],date:"2026-05-31"}).maximumCents).toBe(0);expect(calculatePropertyTransfer({...base,buyers:[b]}).maximumCents).toBe(800000);for(const delta of [-1,0,1])expect(calculatePropertyTransfer({...base,priceCents:55500000+delta,marketCents:0,buyers:[{...base.buyers[0],mainHome:true}]}).maximumCents).toBe(delta<=0?0:1110000);});
  it("split buyers and mixed objects",()=>{expect(calculatePropertyTransfer({...base,buyers:[{...base.buyers[0],sharePpm:500000,mainHome:true},{...base.buyers[0],sharePpm:500000,mainHome:true,exemptionUsed:true}]}).maximumCents).toBe(400000);expect(calculatePropertyTransfer({...base,type:"mixed"}).blocked).toBe(true);});
  it("does not invent a 2027 starter threshold",()=>{expect(calculatePropertyTransfer({...base,date:"2027-06-01",buyers:[{...base.buyers[0],mainHome:true}]})).toMatchObject({minimumCents:0,maximumCents:800000});});
});
describe("EIA",()=>{
  const input={investmentCents:10000000,subsidyCents:0,privatePpm:0,profitCents:100000000,taxPpm:250000,otherInvestmentsCents:0,obligationDate:"2026-01-31",notificationDate:"2026-04-30",newAsset:true,listConfirmed:true,mia:false,route:"purchase" as const};
  it("golden extra deduction is not invoice discount",()=>{const r=calculateEia(input);expect(r.rows[0].currentBenefitCents).toBe(1000000);expect(r.rows[1].currentBenefitCents).toBe(1137500);expect(r.extraBenefitCents).toBe(137500);});
  it("calendar-month deadline and late notification",()=>{expect(calculateEia(input).deadline).toBe("2026-04-30");expect(calculateEia({...input,notificationDate:"2026-05-01"}).conditional).toBe(true);});
  it("minimum, maximum, subsidies and private use",()=>{expect(calculateEia({...input,investmentCents:249999}).rows[0].deductionCents).toBe(0);expect(calculateEia({...input,investmentCents:250000}).rows[0].deductionCents).toBe(100000);expect(calculateEia({...input,subsidyCents:2000000,privatePpm:500000}).rows[0].baseCents).toBe(4000000);expect(calculateEia({...input,otherInvestmentsCents:15300000000}).rows[0].baseCents).toBe(0);});
  it("no current benefit on zero profit and no positive eligibility without match",()=>{expect(calculateEia({...input,profitCents:0}).rows[0].currentBenefitCents).toBe(0);expect(calculateEia({...input,listConfirmed:false}).conditional).toBe(true);});
});
describe("entrepreneur history",()=>{
  const history=Array.from({length:5},(_,index)=>({year:2021+index,entrepreneur:false,selfDeduction:false,disabilityDeduction:false}));
  const years=([2026,2027,2028,2029] as const).map(year=>({year,profitCents:5000000,hours:1225,otherWorkHours:0,entrepreneur:true,aowAtStart:false,disabilityBenefit:false}));
  it("preserves 10 euro and abolishes in 2028",()=>{expect(calculateEntrepreneurPlan(history,years).map(r=>r.starterCents)).toEqual([212300,1000,0,0]);});
  it("blocks below hours and after three uses",()=>{expect(calculateEntrepreneurPlan(history,[{...years[0],hours:1224}])[0].starterCents).toBe(0);const h=history.map((r,i)=>({...r,entrepreneur:i>1,selfDeduction:i>1}));expect(calculateEntrepreneurPlan(h,[years[0]])[0].starterCents).toBe(0);});
  it("retains losses, never labels them a refund",()=>{
    // -€1.000 - €1.200 - €2.123 = -€4.323; MKB adjustment: €549,02.
    expect(calculateEntrepreneurPlan(history,[{...years[0],profitCents:-100000}])[0].taxableProfitCents).toBe(-377398);
  });
  it("requires all five years",()=>{expect(()=>calculateEntrepreneurPlan(history.slice(1),years)).toThrow();});
  it("disability deduction ends in 2029",()=>{const r=calculateEntrepreneurPlan(history,years.map(y=>({...y,hours:800,disabilityBenefit:true})));expect(r.map(y=>y.disabilityCents)).toEqual([1200000,800000,400000,0]);});
});
describe("income comparison",()=>{
  const input={salaryCents:0,pensionCents:0,otherCents:0,pensionContributionCents:0,aow:"none" as const,singleElderly:false,iack:false,disabled:false};
  it("zero income has zero tax in both years",()=>{for(const year of [2026,2027] as const)expect(calculateIncomeYear(input,year).taxMaxCents).toBe(0);});
  it("unknown 2027 credit yields an explicit interval",()=>{const r=calculateIncomeYear({...input,salaryCents:2000000},2027);expect(r.uncertain).toBe(true);expect(r.netMinCents).toBeLessThan(r.netMaxCents);});
  it("AOW transition is blocked rather than guessed",()=>{expect(()=>calculateIncomeYear({...input,aow:"transition"},2026)).toThrow();});
  it("before-1946 category has a longer first bracket",()=>{const regular=calculateIncomeYear({...input,pensionCents:4500000,aow:"full"},2026);const older=calculateIncomeYear({...input,pensionCents:4500000,aow:"before1946"},2026);expect(older.grossTaxCents).toBeLessThan(regular.grossTaxCents);});
  it("golden high salary includes actual work-credit phaseout",()=>{const r=calculateIncomeYear({...input,salaryCents:15000000},2026);expect(r.workMaxCents).toBe(0);expect(r.generalCents).toBe(0);});
});
