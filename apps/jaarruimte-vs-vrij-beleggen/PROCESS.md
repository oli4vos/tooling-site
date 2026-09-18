---
tool: jaarruimte-vs-vrij-beleggen
title: Jaarruimte versus vrij beleggen
route: /apps/jaarruimte-vs-vrij-beleggen
status: active-public
lastReviewed: 2026-09-18
sourceHash: sha256:1c2ffc841f4b0588a20845ef36a300cc613f8e7e9cf4851911858f71cdf7c050
sources:
  - apps/jaarruimte-vs-vrij-beleggen/app.json
  - apps/jaarruimte-vs-vrij-beleggen/Calculator.tsx
  - apps/jaarruimte-vs-vrij-beleggen/logic.ts
  - apps/jaarruimte-vs-vrij-beleggen/logic.test.ts
  - apps/jaarruimte-vs-vrij-beleggen/pdf-export.ts
  - src/lib/pension/index.ts
  - src/lib/tax/box1.ts
  - src/lib/tax/box3.ts
  - src/lib/financial-constants/years.ts
---

# Procesplaat Jaarruimte versus vrij beleggen

## 1. Identificatie

- **Tool-ID:** `jaarruimte-vs-vrij-beleggen`
- **Publieke route:** `/apps/jaarruimte-vs-vrij-beleggen`
- **Doel:** pensioeninleg binnen een door de gebruiker ingevulde jaarruimte neutraal vergelijken met vrij beleggen vanuit hetzelfde netto budget.
- **Gecontroleerd op:** 2026-09-18.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open de scenariovergelijker] --> B[Vul inkomen en officiële jaarruimte in]
  B --> C[Vul inleg rendement en horizon in]
  C --> D[Kies of het voorlopige box 3-effect wordt meegenomen]
  D --> E{Is alle invoer geldig}
  E -->|Nee| F[Herstel de gemarkeerde invoer]
  F --> E
  E -->|Ja| G[Bekijk beide eindwaarden en aannames]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Is de inleg hoger dan de ingevulde jaarruimte} -->|Ja| B[Begrens de aftrekbare pensioeninleg]
  A -->|Nee| C[Gebruik de volledige inleg]
  B --> D{Is box 3 ingeschakeld}
  C --> D
  D -->|Nee| E[Vergelijk zonder box 3-effect]
  D -->|Ja| F[Gebruik de voorlopige forfaitaire regels van 2026]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Bepaal pensioeninleg binnen jaarruimte] --> B[Bereken indicatief box 1-voordeel]
  B --> C[Gebruik de netto kosten als budget voor vrij beleggen]
  C --> D[Laat beide bedragen groeien met hetzelfde rendement]
  D --> E[Pas optioneel het forfaitaire box 3-scenario toe]
  E --> F[Vergelijk de berekende netto eindwaarden]
```

## 5. Gegevensstroom en koppelingen

Het formulier in `apps/jaarruimte-vs-vrij-beleggen/Calculator.tsx` bewaart invoer lokaal en mappt geldige waarden naar `apps/jaarruimte-vs-vrij-beleggen/logic.ts`. De façade gebruikt de centrale pensioenhelpers in `src/lib/pension/index.ts` en de centrale Box 1- en Box 3-berekeningen. CSV en PDF worden vanuit hetzelfde berekende resultaat opgebouwd; er wordt niets extern opgeslagen.

## 6. Resultaten en uitzonderingen

De tool berekent de jaarruimte niet: de gebruiker vult het officiële bedrag zelf in. Inleg boven dat bedrag wordt apart getoond en krijgt geen berekend huidig belastingvoordeel. Zonder verwacht tarief bij uitkering blijft die belasting buiten de netto pensioenuitkomst. Het optionele box 3-pad hergebruikt ieder toekomstig jaar de voorlopige 2026-regels en is geen voorspelling.

## 7. Functionele bronverwijzingen

- `apps/jaarruimte-vs-vrij-beleggen/app.json`: publieke metadata.
- `apps/jaarruimte-vs-vrij-beleggen/Calculator.tsx`: invoer, exports en resultaatpresentatie.
- `apps/jaarruimte-vs-vrij-beleggen/logic.ts`: neutrale scenariovergelijking.
- `src/lib/pension/index.ts`: centrale pensioenprojecties.
- `src/lib/tax/box1.ts`: centrale schijftariefreferentie.
- `src/lib/tax/box3.ts`: centrale voorlopige forfaitaire Box 3-berekening.
