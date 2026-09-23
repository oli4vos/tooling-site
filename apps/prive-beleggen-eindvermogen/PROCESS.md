---
tool: prive-beleggen-eindvermogen
title: Wat wordt mijn eindvermogen met beleggen?
route: /apps/prive-beleggen-eindvermogen
status: active-public
lastReviewed: 2026-09-23
sourceHash: sha256:7f385a25eb7d73c1049684818055d2c87ec1d9f3c3468035e9e031b809df201f
sources:
  - apps/prive-beleggen-eindvermogen/app.json
  - apps/prive-beleggen-eindvermogen/Calculator.tsx
  - apps/prive-beleggen-eindvermogen/logic.ts
  - apps/prive-beleggen-eindvermogen/logic.test.ts
  - src/components/WealthJourneyLinks.tsx
  - src/lib/planning/wealth-planning.ts
  - src/lib/tax/box3.ts
  - src/lib/financial-constants/index.ts
---

# Procesplaat eindvermogen met beleggen

## 1. Identificatie

De tool laat zien hoe een startvermogen en maandelijkse inleg per vermogenscategorie (sparen en beleggen) zich in een gekozen horizon kunnen ontwikkelen bij door de gebruiker ingevulde rendementsscenario's. De uitkomst toont een scenario mét en zonder indicatief box 3-effect. Het is geen rendementvoorspelling, beleggingsadvies of aangifteberekening.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open tool] --> B[Vul belastingjaar en startvermogen in]
  B --> C[Vul maandelijkse spaar- en beleggingsinleg, rendementen en horizon in]
  C --> D[Kies fiscale partner en box 3-methode]
  D --> E{Invoer geldig?}
  E -->|Nee| F[Herstel gemarkeerde velden]
  F --> E
  E -->|Ja| G[Bereken scenario per jaar]
  G --> H[Toon eindvermogen en cumulatief box 3-effect]
  H --> I[Lees aannames en waarschuwingen]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Zijn alle invoervelden geldig} -->|Nee| B[Toon fout bij eerste ongeldige veld]
  A -->|Ja| C{Is de gekozen box 3-methode ondersteund}
  C -->|Nee| D[Toon beperking en geen schijnprecisie]
  C -->|Ja| E[Bereken scenario per kalenderjaar]
```

## 4. Rekenproces

- `Calculator.tsx` verzamelt en valideert formulierinvoer.
- `logic.ts` normaliseert waarden en bouwt de jaartijdlijn.
- `src/lib/planning/wealth-planning.ts` projecteert per categorie de maandelijkse inleg en samengestelde groei.
- Box 3 wordt uitsluitend via de centrale `calculateBox3Tax`-functie berekend.
- De presentatie toont bruto groei, belasting en eindvermogen; de tool verzint geen rendement of fiscale grens.

```mermaid
flowchart TD
  A[Parse bedragen en percentages] --> B[Lees centrale box 3-parameters]
  B --> C[Simuleer per categorie maandelijkse inleg en jaarlijkse groei]
  C --> D[Roep centrale box 3-berekening aan]
  D --> E[Maak tijdlijn samenvatting en bronversie]
```

## 5. Gegevensstroom en koppelingen

Er is alleen lokale formulierstatus: geen backend, opslag, analytics of URL-invoer. De categorieprojectie komt uit `src/lib/planning/wealth-planning.ts`; Box 3-parameters en berekening komen uit `src/lib/financial-constants` en `src/lib/tax`. De vervolglinks sturen door naar de centrale planning, Box 3 of FIRE.

## 6. Resultaten en uitzonderingen

De uitkomst toont eindvermogen per categorie en totaal, maandelijkse en totale inleg, met en zonder indicatief box 3-effect, cumulatieve belasting en een jaarlijkse tijdlijn. Ongeldige of ontbrekende invoer blokkeert de berekening.

## 7. Functionele bronverwijzingen

- `apps/prive-beleggen-eindvermogen/app.json`
- `apps/prive-beleggen-eindvermogen/Calculator.tsx`
- `apps/prive-beleggen-eindvermogen/logic.ts`
- `apps/prive-beleggen-eindvermogen/logic.test.ts`
- `src/components/WealthJourneyLinks.tsx`
- `src/lib/planning/wealth-planning.ts`
- `src/lib/tax/box3.ts`
- `src/lib/financial-constants/index.ts`

## Beperkingen

- Het ingevulde rendement is een scenario, geen verwachting of garantie.
- Kosten, transacties, dividendbelasting, vermogenswinstbelasting buiten box 3 en individuele aftrekposten vallen buiten scope.
- De box 3-uitkomst is indicatief en volgt de beschikbare centrale parameterlaag voor het gekozen jaar.
