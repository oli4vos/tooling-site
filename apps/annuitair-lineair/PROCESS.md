---
tool: annuitair-lineair
title: Annuïtair of lineair
route: /apps/annuitair-lineair
status: active-public
lastReviewed: 2026-09-23
sourceHash: sha256:d6d0ff6326facf8d6f975e9a208bfaf4ae975eb4ce6c945a9c9debbd5d315e16
sources:
  - apps/annuitair-lineair/app.json
  - apps/annuitair-lineair/Calculator.tsx
  - apps/annuitair-lineair/logic.ts
  - apps/annuitair-lineair/logic.test.ts
  - apps/annuitair-lineair/mortgageCalculator.js
  - apps/annuitair-lineair/investmentStrategy.js
  - src/lib/tax/box3.ts
---

# Procesplaat annuïtair of lineair

## 1. Identificatie
Hypotheekvergelijker met optionele beleggingspot. De beleggingsroute gebruikt het netto maandlastverschil en is indicatief.

## 2. Gebruikersproces
Vul lening, rente en looptijd in. Optioneel: voer rendement in en laat het netto verschil maandelijks beleggen en later onttrekken.
```mermaid
flowchart TD
 A[Lees doel en aannames] --> B[Vul hypotheekgegevens in]
 B --> C[Kies optionele beleggingsverdieping]
 C --> D[Bereken en vergelijk]
```

## 3. Beslisproces
De calculator vergelijkt annuïtaire en lineaire maandlasten en activeert alleen de beleggingspot wanneer de gebruiker daarvoor kiest.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Maak hypotheekroutes]
 C --> D{Beleggingsverdieping actief}
 D --> E[Stort of onttrek netto verschil]
```

## 4. Rekenproces
Maandelijkse rente, aflossing, belastingfactor en netto lasten worden berekend. De pot groeit tegen het ingevoerde rendement; bij een negatief verschil wordt onttrokken. Box 3 is optioneel en volgt de gekozen methode.
```mermaid
flowchart TD
 A[Maak annuïtaire en lineaire schema's] --> B[Bereken netto maandlasten]
 B --> C[Projecteer maandelijkse pot]
 C --> D[Pas optioneel box3-effect toe]
 D --> E[Toon eindpot en onttrekkingen]
```

## 5. Gegevensstroom en koppelingen
De calculator gebruikt lokale invoer en de centrale box-3-laag. Geen backend of profielopslag.

## 6. Resultaten en uitzonderingen
Toon maandlasten, totale rente, omslagmoment, eindpot vóór/na box 3 en totale onttrekking. Rendement en belasting zijn scenario-aannames.

## 7. Functionele bronverwijzingen
- `apps/annuitair-lineair/Calculator.tsx`
- `apps/annuitair-lineair/logic.ts`
- `apps/annuitair-lineair/mortgageCalculator.js`
- `apps/annuitair-lineair/investmentStrategy.js`
- `src/lib/tax/box3.ts`
