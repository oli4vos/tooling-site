import { TAX_PROPOSALS, TAX_PROPOSAL_SOURCE } from "@/lib/financial-constants/tax-proposals";
import { calculateIncomeYear, type IncomeComparisonInput } from "@/lib/tax/income-comparison";
import { cents, ratio } from "@/lib/tax/money";
import type { ZvwMode } from "@/lib/tax";
import { euro, yesNo } from "../_tax_shared/form";
import type { TaxToolConfig } from "../_tax_shared/types";

const zvwOptions = [
  { value: "employer", label: "Werkgeversheffing (werkgever betaalt)" },
  { value: "employee", label: "Inhouding op loon/pensioen" },
  { value: "self-employed", label: "Zelf betalen via aanslag (winst/overig werk)" },
  { value: "none", label: "Geen Zvw-bijdrage in deze regel" },
];

export const config: TaxToolConfig = {
  title: "Netto-inkomen 2026 versus 2027",
  intro: "Vergelijk box 1, landelijke heffingskortingen en de inkomensafhankelijke Zvw-bijdrage per inkomenssituatie.",
  scope: "Indicatieve jaarberekening: exclusief loonheffingstabellen per tijdvak, box 2/3, toeslagen, woning- en persoonsgebonden aftrek. Kies per inkomensregel of de Zvw een werkgeversheffing, inhouding of aanslag is. Ondernemerswinst vraagt de afzonderlijke ondernemersberekening. AOW-overgangsjaren worden geblokkeerd.",
  empty: {},
  example: { salary: "55000", pension: "0", other: "0", contribution: "0", salaryZvw: "employer", pensionZvw: "employee", otherZvw: "self-employed", aow: "none", single: "no", iack: "no", disabled: "no" },
  fields: [
    { id: "salary", label: "Bruto jaarloon vóór pensioeninhouding (€)", type: "money" },
    { id: "salaryZvw", label: "Zvw over loon", type: "select", options: zvwOptions },
    { id: "contribution", label: "Ingehouden aftrekbare werknemerspensioenpremie (€)", type: "money" },
    { id: "pension", label: "Pensioen en AOW per jaar (€)", type: "money" },
    { id: "pensionZvw", label: "Zvw over pensioen/AOW", type: "select", options: zvwOptions },
    { id: "other", label: "Overig box 1-inkomen zonder arbeidskorting (€)", type: "money" },
    { id: "otherZvw", label: "Zvw over overig werk/winst", type: "select", options: zvwOptions },
    { id: "aow", label: "AOW-situatie in beide vergelijkingsjaren", type: "select", options: [{ value: "none", label: "Hele jaar nog geen AOW" }, { value: "full", label: "Hele jaar AOW, geboren vanaf 1946" }, { value: "before1946", label: "Hele jaar AOW, geboren vóór 1946" }, { value: "transition", label: "Ik bereik in een vergelijkingsjaar de AOW-leeftijd" }] },
    { id: "single", label: "Recht op alleenstaande-ouderenkorting?", type: "select", options: yesNo, visible: (f) => f.aow === "full" || f.aow === "before1946" },
    { id: "iack", label: "Voldoe je aan de voorwaarden voor IACK?", type: "select", options: yesNo, help: "Kind jonger dan 12 jaar, minimaal zes maanden in je huishouden; je bent alleenstaand of hebt het lagere arbeidsinkomen. De inkomensdrempel wordt in de berekening toegepast.", visible: (f) => f.aow === "none" },
    { id: "disabled", label: "Heb je recht op jonggehandicaptenkorting?", type: "select", options: yesNo, help: "Bij recht op een Wajong-uitkering of ondersteuning bij het vinden van werk volgens de Wajong; niet alleen op basis van een diagnose.", visible: (f) => f.aow === "none" },
  ],
  calculate(f) {
    const salaryCents = cents(f.salary);
    const pensionCents = cents(f.pension);
    const otherCents = cents(f.other);
    const input: IncomeComparisonInput = {
      salaryCents,
      pensionCents,
      otherCents,
      pensionContributionCents: cents(f.contribution),
      aow: f.aow as IncomeComparisonInput["aow"],
      singleElderly: f.single === "yes",
      iack: f.iack === "yes",
      disabled: f.disabled === "yes",
      zvwLines: [
        { incomeCents: salaryCents, mode: f.salaryZvw as ZvwMode, label: "Loon" },
        { incomeCents: pensionCents, mode: f.pensionZvw as ZvwMode, label: "Pensioen/AOW" },
        { incomeCents: otherCents, mode: f.otherZvw as ZvwMode, label: "Overig werk/winst" },
      ],
    };
    const rows = ([2026, 2027] as const).map((year) => calculateIncomeYear(input, year));
    const format = (low: number, high: number) => low === high ? euro(low) : `${euro(low)} – ${euro(high)}`;
    const zvwWarnings = rows.flatMap((row) => row.zvwWarnings ?? []).filter((warning, index, all) => all.indexOf(warning) === index);
    return {
      conclusion: rows.some((row) => row.uncertain) ? "Voor 2027 is een bandbreedte nodig" : "Je indicatieve nettojaarvergelijking",
      rows: rows.map((row) => ({ label: `Netto per maand ${row.year}`, value: format(ratio(row.netMinCents, 1, 12), ratio(row.netMaxCents, 1, 12)) })),
      table: {
        headers: ["Jaar", "Belasting vóór korting", "Algemene korting", "Arbeidskorting", "Overige kortingen", "Zvw op netto", "Netto jaar"],
        rows: rows.map((row) => [String(row.year), euro(row.grossTaxCents), euro(row.generalCents), format(row.workMinCents, row.workMaxCents), euro(row.elderlyCents + row.singleCents + row.iackCents + row.disabledCents), euro(row.zvwCents), format(row.netMinCents, row.netMaxCents)]),
      },
      warnings: [
        "De WML-afhankelijke grenzen voor 2027 zijn voorlopig tot de vaststelling in november 2026.",
        ...(rows.some((row) => row.uncertain) ? ["De volledige opbouwparameters van arbeidskorting 2027 zijn in deze bronversie niet geverifieerd. De getoonde bandbreedte omvat nul tot de gepubliceerde maximale korting; dit is geen verwachting of persoonlijke voorspelling."] : []),
        "Werkgeversheffing Zvw is een werkgeverslast en verlaagt het werknemersnetto niet; inhouding en bijdrage via aanslag wel.",
        ...zvwWarnings,
        "Andere inkomsten en aftrekposten kunnen de kortingen veranderen. Kortingen worden niet als terugbetaling boven de berekende belasting weergegeven.",
      ],
      steps: ["Jaarinkomen minus de opgegeven aftrekbare looninhouding.", "Centrale schijfberekening met de juiste AOW-categorie.", "Algemene, arbeids-, ouderen-, alleenstaande ouderen-, IACK- en jonggehandicaptenkorting binnen de gekozen scope.", "Zvw wordt per inkomensregel toegepast met één gedeeld maximumbijdrage-inkomen.", "Geen afzonderlijk bedrag voor inflatiecorrectie: daarvoor is een volledig gecontroleerd alternatief parameterstelsel nodig; niet alle verschillen zijn inflatie-effect."],
      sources: [
        { title: "Belastingdienst — heffingskortingen 2026", url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen" },
        { title: "Belastingdienst — percentages inkomensafhankelijke bijdrage Zvw", url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/" },
        { title: "Belastingplan 2027 — tabellen 1 en 2", url: TAX_PROPOSAL_SOURCE },
      ],
      version: TAX_PROPOSALS.version,
      verifiedAt: TAX_PROPOSALS.verifiedAt,
    };
  },
};
