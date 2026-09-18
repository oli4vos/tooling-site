---
tool: box-3-impact
title: Wat kost mijn vermogen in box 3?
route: /apps/box-3-impact
status: active-public
lastReviewed: 2026-09-18
sourceHash: sha256:4d555026072fdc9accaef0d3bad3d03c3be7db9fa340ef5a55da8ca1529cccad
sources:
  - apps/box-3-impact/app.json
  - apps/box-3-impact/Calculator.tsx
  - apps/box-3-impact/logic.ts
  - apps/box-3-impact/logic.test.ts
  - src/lib/tax/box3.ts
  - src/lib/tax/types.ts
  - src/lib/financial-constants/years.ts
---

# Procesplaat Wat kost mijn vermogen in box 3?

## 1. Identificatie

- **Tool-ID:** `box-3-impact`
- **Publieke route:** `/apps/box-3-impact`
- **Doel:** de voorlopige forfaitaire box 3-heffing voor 2026 en een meerjarig scenario met dezelfde 2026-regels inzichtelijk maken.
- **Gecontroleerd op:** 2026-09-18.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open de box 3-tool] --> B[Vul vermogen schulden en partnerstatus in]
  B --> C[Vul rendement horizon en inleg in]
  C --> D{Is alle invoer geldig}
  D -->|Nee| E[Herstel de gemarkeerde invoer]
  E --> D
  D -->|Ja| F[Bereken de indicatie]
  F --> G[Bekijk jaarheffing horizon en aannames]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Is er een fiscale partner} -->|Ja| B[Gebruik dubbele vrijstelling en schuldendrempel]
  A -->|Nee| C[Gebruik enkele vrijstelling en schuldendrempel]
  B --> D{Is vermogen boven de vrijstelling}
  C --> D
  D -->|Nee| E[Toon nul box 3-heffing]
  D -->|Ja| F[Bereken forfaitair belastbaar rendement]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Tel banktegoeden en overige bezittingen op] --> B[Trek alleen schulden boven de schuldendrempel af]
  B --> C[Trek het heffingsvrije vermogen af]
  C --> D[Bereken forfaitair rendement per vermogenscategorie]
  D --> E[Pas het belastbare aandeel toe]
  E --> F[Pas het box 3-tarief van 36 procent toe]
  F --> G[Herhaal als scenario met dezelfde regels van 2026]
```

## 5. Gegevensstroom en koppelingen

De formulierwaarden blijven in de browser. `apps/box-3-impact/Calculator.tsx` valideert en mappt ze naar de dunne scenariofaçade in `apps/box-3-impact/logic.ts`. Die gebruikt `src/lib/tax/box3.ts`; tarieven, vrijstellingen en schuldendrempels komen centraal uit `src/lib/financial-constants/years.ts`. De tool slaat geen bedragen extern op.

## 6. Resultaten en uitzonderingen

De hoofdweergave toont de indicatieve box 3-heffing voor 2026. Details tonen onder meer schuldendrempel, aftrekbare schulden, rendementsgrondslag en forfaitair rendement. De horizon hergebruikt bewust de voorlopige 2026-regels en wordt expliciet als scenario getoond, niet als voorspelling. Ongeldige of negatieve invoer blokkeert de berekening.

## 7. Functionele bronverwijzingen

- `apps/box-3-impact/app.json`: publieke metadata.
- `apps/box-3-impact/Calculator.tsx`: invoer, validatie en resultaatpresentatie.
- `apps/box-3-impact/logic.ts`: scenariofaçade en horizonberekening.
- `src/lib/tax/box3.ts`: centrale box 3-berekening.
- `src/lib/financial-constants/years.ts`: centrale 2026-waarden en bronmetadata.
