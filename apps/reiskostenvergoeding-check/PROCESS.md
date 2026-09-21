---
tool: reiskostenvergoeding-check
title: Reiskostenvergoeding-check
route: /apps/reiskostenvergoeding-check
status: active-public
lastReviewed: 2026-09-20
sourceHash: sha256:6ede3e8595244c9716ceeb15aad0c8b8d988ddf619aad70aff43f1cd37e6a6e8
sources:
  - apps/reiskostenvergoeding-check/app.json
  - apps/reiskostenvergoeding-check/Calculator.tsx
  - apps/reiskostenvergoeding-check/logic.ts
  - apps/reiskostenvergoeding-check/logic.test.ts
  - apps/_tax_shared/TaxCalculator.tsx
  - apps/_tax_shared/form.ts
  - apps/_tax_shared/types.ts
  - src/lib/tax/proposal-planning.ts
  - src/lib/tax/money.ts
  - src/lib/financial-constants/tax-proposals.ts
  - src/hooks/useMobileFieldFlow.ts
---

# Procesplaat Reiskostenvergoeding-check

## 1. Identificatie

Publieke voorstel-beta. De gebruiker heeft op 20 september 2026 om publicatie na testen gevraagd. Juridische status: voorstel; onafhankelijke fiscale productie-review is niet afgerond.

## 2. Gebruikersproces

Vervoerswijze, enkele reisafstand, geplande werkdagen, thuiswerk, afwezigheid, overige zakelijke kilometers en ontvangen vergoeding; werkelijke OV-kosten alleen bij de OV-route.

```mermaid
flowchart TD
  A[Lees doel en beperkingen] --> B[Vul gegevens of voorbeeld in]
  B --> C[Controleer invoer]
  C --> D[Bekijk scenario en bronversie]
  D --> E[Wijzig invoer of download samenvatting]
```

## 3. Beslisproces

Thuiswerk en afwezigheid verminderen het aantal feitelijke ritten. OV gebruikt werkelijke kosten, werkgeversvervoer geeft geen tweede vrijstelling voor dezelfde rit.

```mermaid
flowchart TD
  A{Zijn zichtbare verplichte velden geldig} -->|Nee| B[Toon fout bij het veld]
  A -->|Ja| C[Controleer domeinvoorwaarden]
  C --> D{Is berekening binnen ondersteunde scope}
  D -->|Nee| E[Toon beperking zonder schijnuitkomst]
  D -->|Ja| F[Bereken expliciet scenario]
```

## 4. Rekenproces

Retourafstand maal feitelijke reisdagen plus overige zakelijke kilometers. Vergelijk 23 en 25 cent, ontvangen vergoeding, onbenutte ruimte en bedrag boven de vrijstelling.

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

De uitkomst is fiscale ruimte, geen afdwingbaar recht op vergoeding. Geen vaste 128/214-dagenregeling of thuiswerkvergoeding. Onmogelijke dagtotalen en niet-gehele dagen blokkeren.

De voorstelwaarschuwing en bronversie staan boven de uitkomst. Op mobiel één zichtbaar vraagveld, op desktop alle relevante velden. Bij submit met veldfouten gaat de flow naar het eerste ongeldige veld. Voorbeeld vervangt de invoer; expliciet wissen wist alleen deze tool. Opnieuw beginnen onder het resultaat vraagt bevestiging. Berekening en bronnen staan in een disclosure. Gevoelige uitvoer komt alleen in de bewuste lokale download.

## 7. Functionele bronverwijzingen

- `apps/reiskostenvergoeding-check/app.json`
- `apps/reiskostenvergoeding-check/Calculator.tsx`
- `apps/reiskostenvergoeding-check/logic.ts`
- `apps/reiskostenvergoeding-check/logic.test.ts`
- `apps/_tax_shared/TaxCalculator.tsx`
- `apps/_tax_shared/form.ts`
- `apps/_tax_shared/types.ts`
- `src/lib/tax/proposal-planning.ts`
- `src/lib/tax/money.ts`
- `src/lib/financial-constants/tax-proposals.ts`
- `src/hooks/useMobileFieldFlow.ts`
