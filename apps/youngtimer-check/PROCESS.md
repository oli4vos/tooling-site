---
tool: youngtimer-check
title: Youngtimer Check 2026–2028
route: /apps/youngtimer-check
status: active-public
lastReviewed: 2026-09-20
sourceHash: sha256:34a501f3fcf53765edff14d4c2cf535c549b5142b1ff84189da970afd8082f5b
sources:
  - apps/youngtimer-check/app.json
  - apps/youngtimer-check/Calculator.tsx
  - apps/youngtimer-check/logic.ts
  - apps/youngtimer-check/logic.test.ts
  - apps/_tax_shared/TaxCalculator.tsx
  - apps/_tax_shared/form.ts
  - apps/_tax_shared/types.ts
  - src/lib/tax/vehicles.ts
  - src/lib/tax/money.ts
  - src/lib/financial-constants/tax-proposals.ts
  - src/hooks/useMobileFieldFlow.ts
---

# Procesplaat Youngtimer Check 2026–2028

## 1. Identificatie

Publieke voorstel-beta. De gebruiker heeft op 20 september 2026 om publicatie na testen gevraagd. Juridische status: voorstel; onafhankelijke fiscale productie-review is niet afgerond.

## 2. Gebruikersproces

Kalenderjaar, exacte datums van ingebruikneming en terbeschikkingstelling, continuïteit eind 2025, fiscale rol, catalogus- en marktwaarde, regulier percentage en privégebruik. Bewijs, ondernemerskosten en eigen marginaal tarief verschijnen waar relevant.

```mermaid
flowchart TD
  A[Lees doel en beperkingen] --> B[Vul gegevens of voorbeeld in]
  B --> C[Controleer invoer]
  C --> D[Bekijk scenario en bronversie]
  D --> E[Wijzig invoer of download samenvatting]
```

## 3. Beslisproces

De engine knipt de gebruiksperiode in reguliere en youngtimerdagen. Overgangsrecht wordt afzonderlijk getoetst; het tekstverschil in de bron voor 2027 wordt zichtbaar gemeld.

```mermaid
flowchart TD
  A{Zijn zichtbare verplichte velden geldig} -->|Nee| B[Toon fout bij het veld]
  A -->|Ja| C[Controleer domeinvoorwaarden]
  C --> D{Is berekening binnen ondersteunde scope}
  D -->|Nee| E[Toon beperking zonder schijnuitkomst]
  D -->|Ja| F[Bereken expliciet scenario]
```

## 4. Rekenproces

Dagen per regime delen door de werkelijke kalenderjaarlengte, maal de bijbehorende jaarbijtelling. Voor IB-ondernemers wordt in beide vergelijkingspaden hetzelfde kostenplafond toegepast. Het maandbedrag is een kalenderjaargemiddelde, niet een maandloonstrook.

```mermaid
flowchart TD
  A[Parse bedragen naar gehele centen] --> B[Lees centrale versiegebonden regels]
  B --> C[Roep pure domeinberekening aan]
  C --> D[Maak resultaat met uitleg en bronnen]
  D --> E[Dezelfde uitkomst voor scherm en download]
```

## 5. Gegevensstroom en koppelingen

De dunne toolfaçade geeft configuratie door aan de gedeelde belastingpresentatie. De adapter valideert en mappt invoer naar de centrale domeinlaag. Alleen lokale React-state: geen profielprefill, opslag, URL-invoer, analytics of backend. De tekstdownload bevat de daadwerkelijk ingediende invoer en hetzelfde resultaatmodel als het scherm. Na een wijziging blijft de vorige uitkomst herkenbaar en is downloaden geblokkeerd tot opnieuw berekenen. De gebruiker kan terug naar alle tools zonder gegevensoverdracht.

## 6. Resultaten en uitzonderingen

Zonder bewijs van maximaal 500 privékilometers geen nulbijtelling. Ongeldige datumvolgorde en ontbrekende ondernemerskosten blokkeren. Geen volledige EV-percentagestaffel. Overgangspad 2027 vereist fiscale controle; beta is geen fiscaal goedgekeurde productie.

De voorstelwaarschuwing en bronversie staan boven de uitkomst. Op mobiel één zichtbaar vraagveld, op desktop alle relevante velden. Bij submit met veldfouten gaat de flow naar het eerste ongeldige veld. Voorbeeld vervangt de invoer; expliciet wissen wist alleen deze tool. Opnieuw beginnen onder het resultaat vraagt bevestiging. Berekening en bronnen staan in een disclosure. Gevoelige uitvoer komt alleen in de bewuste lokale download.

## 7. Functionele bronverwijzingen

- `apps/youngtimer-check/app.json`
- `apps/youngtimer-check/Calculator.tsx`
- `apps/youngtimer-check/logic.ts`
- `apps/youngtimer-check/logic.test.ts`
- `apps/_tax_shared/TaxCalculator.tsx`
- `apps/_tax_shared/form.ts`
- `apps/_tax_shared/types.ts`
- `src/lib/tax/vehicles.ts`
- `src/lib/tax/money.ts`
- `src/lib/financial-constants/tax-proposals.ts`
- `src/hooks/useMobileFieldFlow.ts`
