import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek",
    "title": "Maximale hypotheek",
    "description": "Schat je maximale hypotheek met je inkomen, woningwaarde, studieschuld en NHG.",
    "enabled": true,
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "woningwaarde",
      "inkomen",
      "NHG",
      "studieschuld"
    ],
    "status": "active",
    "visibility": "public",
    "reasonHint": "Indicatieve tool voor starters zonder bestaande hypotheek die hun maximale hypotheek willen inschatten.",
    "assumptionsUsed": [
      "mortgage"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "mixed",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "box-3-impact",
    "title": "Wat kost mijn vermogen in box 3?",
    "description": "Zie hoeveel belasting je indicatief betaalt over spaargeld, beleggingen en schulden.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "box 3",
      "belasting",
      "sparen",
      "beleggen",
      "vermogen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear"
    ],
    "reasonHint": "Handig als je wilt zien wat spaargeld, beleggingen en schulden indicatief doen in box 3.",
    "assumptionsUsed": [
      "tax",
      "box3"
    ],
    "calculationDomains": [
      "tax",
      "saving",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.1.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-aanvullende-beurs",
    "title": "Aanvullende beurs berekenen",
    "description": "Schat je aanvullende beurs voor 2026 met het ouderinkomen uit het peiljaar.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "aanvullende beurs",
      "studiefinanciering",
      "ouderinkomen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt zien welk maandbedrag bij mbo, hbo of universiteit past.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-extra-aflossen",
    "title": "Wat doet extra aflossen?",
    "description": "Bekijk feitelijk wat een extra DUO-aflossing doet met maandtermijn, looptijd en rentelast.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "extra aflossen",
      "looptijd"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.currentMonthlyPayment",
      "studentDebt.repaymentRule"
    ],
    "reasonHint": "Handig als je wilt zien wat extra aflossen bij DUO verandert in maandlast en looptijd.",
    "assumptionsUsed": [
      "duo",
      "charts"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-leenbedrag-impact",
    "title": "Impact van mijn leenbedrag",
    "description": "Bereken simpel wat een nieuw leenbedrag per maand doet met je eindschuld terwijl je al studeert.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "leenbedrag",
      "eindschuld",
      "studieschuld"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je al studeert en wilt zien wat meer of minder lenen per maand doet.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-maandbedrag",
    "title": "Wat wordt mijn DUO-maandbedrag?",
    "description": "Bereken je wettelijke DUO-maandtermijn en bekijk optioneel een draagkrachtindicatie.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "maandbedrag",
      "draagkracht"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.repaymentRule",
      "income.grossAnnualIncome",
      "income.householdType"
    ],
    "reasonHint": "Handig als je wilt begrijpen welk DUO-maandbedrag bij je schuld hoort.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-schuld-bij-starten-lenen",
    "title": "Wat wordt mijn studieschuld?",
    "description": "Bereken simpel wat je schuld wordt als je nu begint met studeren en per maand gaat lenen.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "lenen",
      "student"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt weten wat je schuld wordt voordat je begint met lenen.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-stoppen-kosten-prestatiebeurs",
    "title": "Wat kost stoppen met studeren?",
    "description": "Bekijk welk deel van je prestatiebeurs schuld blijft als je stopt zonder diploma.",
    "enabled": true,
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "stoppen",
      "prestatiebeurs",
      "studieschuld"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt weten welk prestatiebeursbedrag schuld blijft als je stopt zonder diploma.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "eia-investeringsvoordeel",
    "title": "EIA Investeringsvoordeel",
    "description": "Vergelijk energie-investeringsaftrek van 40% met het voorstel van 45,5%, bij dezelfde referentievoorwaarden.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Een winstaftrek is geen factuurkorting; bekijk het verschil bij je eigen tarief.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "jaarruimte-vs-vrij-beleggen",
    "title": "Jaarruimte versus vrij beleggen",
    "description": "Vergelijk twee scenario's met hetzelfde netto budget: pensioeninleg binnen je ingevulde jaarruimte en vrij beleggen.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "jaarruimte",
      "pensioen",
      "box 3",
      "beleggen",
      "FIRE"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "savingInvesting.currentSavings",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "savingInvesting.pensionBuildUp"
    ],
    "reasonHint": "Handig als je twijfelt tussen pensioeninleg met belastingvoordeel en flexibel vrij beleggen.",
    "assumptionsUsed": [
      "tax",
      "box1",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "tax",
      "investing",
      "pension"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "scenarioComparison",
    "version": "1.1.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "netto-inkomen-vergelijking",
    "title": "Netto-inkomen 2026 versus 2027",
    "description": "Vergelijk inkomen na box 1-belasting in 2026 en het voorstel voor 2027; onbekende regels geven een bandbreedte.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Geen loonstrook: controleer welke inkomsten, kortingen en inhoudingen meetellen.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "overdrachtsbelasting-check",
    "title": "Overdrachtsbelasting-check",
    "description": "Bekijk de overdrachtsbelasting per koper in 2026 of een voorgesteld 2027-scenario.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Leeftijd, eigendomsaandeel en gebruik van de woning bepalen het scenario.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "pensioenplafond-check",
    "title": "Pensioenplafond-check 2027–2032",
    "description": "Zie welk salarisdeel boven het voorgestelde pensioenplafond valt en vergelijk een eigen groeiscenario.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Geen pensioenvoorspelling: inzicht in salaris, grens en premieverschil.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "prive-beleggen-eindvermogen",
    "title": "Wat wordt mijn eindvermogen met beleggen?",
    "description": "Bereken je verwachte eindvermogen bij maandelijks beleggen, inclusief box 3-heffing zodra je boven de vrijstelling uitkomt.",
    "enabled": true,
    "type": "frontend",
    "category": "Beleggen",
    "tags": [
      "beleggen",
      "eindvermogen",
      "box 3",
      "vermogen",
      "privé"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "tax.preferredBox3Method"
    ],
    "reasonHint": "Handig als je wilt zien wat periodiek privé beleggen oplevert na box 3 over de jaren.",
    "assumptionsUsed": [
      "tax",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "investing",
      "saving",
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "reiskostenvergoeding-check",
    "title": "Reiskostenvergoeding-check",
    "description": "Vergelijk de fiscale ruimte bij 23 en 25 cent per kilometer. Je werkelijke vergoeding kan anders zijn.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Bereken de ruimte voor de ritten in jouw gekozen periode.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "youngtimer-check",
    "title": "Youngtimer Check 2026–2028",
    "description": "Bekijk de bijtelling van een oudere zakelijke auto in 2026–2028, met de voorgestelde wijzigingen en overgangsregels.",
    "enabled": true,
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "belastingplan",
      "2027",
      "voorstel"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Vergelijk de bruto bijtelling; een netto-indicatie gebruikt je eigen tarief.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "0.2.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "zzp-uurtarief",
    "title": "Welk ZZP-uurtarief heb ik nodig?",
    "description": "Plan een indicatief uurtarief exclusief btw, met eigen reserveringen voor belasting, buffer, pensioen, AOV en kosten.",
    "enabled": true,
    "type": "frontend",
    "category": "Werk",
    "tags": [
      "ZZP",
      "uurtarief",
      "AOV",
      "pensioen",
      "inkomen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.employmentType",
      "income.grossAnnualIncome",
      "savingInvesting.targetEmergencyFund",
      "tax.preferredTaxYear",
      "employment.grossAnnualSalary",
      "employment.businessProfitBeforeTax",
      "employment.aovPremiumAnnual",
      "employment.pensionContributionAnnual"
    ],
    "reasonHint": "Handig als je wilt weten welk uurtarief past bij inkomen, belasting, pensioen, AOV en buffer.",
    "assumptionsUsed": [
      "tax",
      "box1"
    ],
    "calculationDomains": [
      "employment",
      "cashflow",
      "pension",
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.1.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
