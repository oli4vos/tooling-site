import { TAX_PROPOSALS, TAX_PROPOSAL_SOURCE } from "@/lib/financial-constants/tax-proposals";
import { calculateYoungtimer, type YoungtimerInput } from "@/lib/tax/vehicles";
import { cents } from "@/lib/tax/money";
import { euro, number, optionalPercent, percent, yesNo } from "../_tax_shared/form";
import type { TaxToolConfig } from "../_tax_shared/types";

export const config: TaxToolConfig = {
  title:"Youngtimer Check 2026–2028", intro:"Bekijk vanaf welke datum je auto onder het voorgestelde youngtimerregime valt en vergelijk de bruto bijtelling.",
  scope:"Voor één auto met een bevestigd regulier percentage. Meer dan N jaar betekent: vanaf de dag na de verjaardag. Een netto-uitkomst is alleen een indicatie bij je eigen tarief.",
  empty:{}, example:{year:"2027",firstUse:"2010-06-15",availableFrom:"2025-01-01",availableUntil:"2027-12-31",same:"yes",transition:"yes",role:"employee",catalogue:"40000",market:"10000",regular:"25",private:"yes",proof:"no",marginal:"37,56",costs:"6000"},
  fields:[
    {id:"year",label:"Kalenderjaar",type:"select",options:[2026,2027,2028].map(year=>({value:String(year),label:String(year)}))},
    {id:"firstUse",label:"Eerste ingebruikneming",type:"date",help:"Gebruik de exacte datum. Eerste toelating en bouwjaar zijn niet altijd dezelfde datum als eerste ingebruikneming."},
    {id:"availableFrom",label:"Vanaf wanneer stond de auto aan jou ter beschikking?",type:"date"},
    {id:"availableUntil",label:"Tot en met welke datum reken je?",type:"date",help:"Bij een volledig jaar: 31 december van het gekozen jaar."},
    {id:"same",label:"Stond deze auto op 31 december 2025 al aan jou ter beschikking?",type:"select",options:yesNo},
    {id:"transition",label:"Wil je de overgangsregeling voor 2026 toepassen?",type:"select",options:yesNo,visible:f=>f.year==="2026"&&f.same==="yes"},
    {id:"role",label:"In welke rol gebruik je de auto?",type:"select",options:[{value:"employee",label:"Werknemer"},{value:"director",label:"Dga"},{value:"entrepreneur",label:"IB-ondernemer"}]},
    {id:"catalogue",label:"Fiscale cataloguswaarde (€)",type:"money",help:"Gebruik de fiscale grondslag, inclusief relevante belastingen; niet de aanschafprijs van een occasion."},
    {id:"market",label:"Aantoonbare marktwaarde (€)",type:"money"},
    {id:"regular",label:"Regulier bijtellingspercentage (%)",type:"number",max:100,help:"Controleer het percentage in de auto- of loonadministratie. Voor oudere auto's is dit vaak 25%; niet automatisch 22%."},
    {id:"private",label:"Meer dan 500 privékilometers op jaarbasis?",type:"select",options:yesNo},
    {id:"proof",label:"Kun je maximaal 500 privékilometers aantonen?",type:"select",options:yesNo,visible:f=>f.private==="no"},
    {id:"costs",label:"Fiscale autokosten in dit jaar (€)",type:"money",visible:f=>f.role==="entrepreneur",help:"Voor een IB-ondernemer wordt de onttrekking begrensd door de autokosten."},
    {id:"marginal",label:"Eigen marginaal belastingtarief (%)",type:"number",max:100,optional:true},
  ],
  calculate(form) {
    const input: YoungtimerInput = {year:number(form,"year") as YoungtimerInput["year"],firstUse:form.firstUse,availableFrom:form.availableFrom,availableUntil:form.availableUntil,sameUserAt2025End:form.same==="yes",useTransition2026:form.transition==="yes",role:form.role as YoungtimerInput["role"],catalogueCents:cents(form.catalogue),marketCents:cents(form.market),regularRatePpm:percent(form,"regular"),privateOver500:form.private==="yes",proofOfLimitedPrivateUse:form.proof==="yes",marginalRatePpm:optionalPercent(form,"marginal"),annualCarCostsCents:form.role==="entrepreneur"?cents(form.costs):undefined};
    const r=calculateYoungtimer(input);
    return {conclusion:r.conclusion,rows:[{label:"Bijtelling in de gekozen periode",value:euro(r.grossCents)},{label:"Gemiddeld per kalendermaand",value:euro(r.monthlyCents)},{label:"Zonder overgangsrecht vanaf",value:r.eligibleFrom},{label:"Youngtimer — bedrag bij een volledig jaar",value:euro(r.annualYoungCents)},{label:"Regulier — bedrag bij een volledig jaar",value:euro(r.annualRegularCents)},...(r.netCents===null?[]:[{label:"Netto-indicatie met eigen tarief",value:euro(r.netCents)}])],warnings:r.warnings,steps:[`Gebruik van ${r.start} tot en met ${r.end}: ${r.usedDays} kalenderdagen.`,`Daarvan ${r.youngDays} dagen youngtimer en ${r.regularDays} dagen regulier.`,"Jaarbedragen worden naar kalenderdagen toegerekend; maandbedrag is het kalenderjaartotaal gedeeld door twaalf."],sources:[{title:"Belastingplan 2027 — artikelen I, II en XLVII",url:TAX_PROPOSAL_SOURCE}],version:TAX_PROPOSALS.version,verifiedAt:TAX_PROPOSALS.verifiedAt};
  },
};
