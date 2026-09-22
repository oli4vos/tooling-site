---
tool: volgende-euro
title: Wat doe ik met mijn volgende euro?
route: /apps/volgende-euro
status: active-public
lastReviewed: 2026-09-22
sourceHash: sha256:16f06f37c0ff03b3af54791930494a8bafc7b81f03ed32e103cfc63eb21ae2cd
sources:
  - apps/volgende-euro/app.json
  - apps/volgende-euro/Calculator.tsx
  - apps/volgende-euro/logic.ts
  - apps/volgende-euro/logic.test.ts
---

# Procesplaat volgende euro

## 1. Identificatie
Educatieve prioriteringshulp voor buffer, schuld, woning, pensioen en beleggen.

## 2. Gebruikersproces
Vul beschikbare ruimte en doelen in; vergelijk daarna de voorgestelde volgorde.
```mermaid
flowchart TD
 A[Lees doel] --> B[Vul financiële situatie in]
 B --> C[Controleer invoer]
 C --> D[Bekijk prioriteiten]
```

## 3. Beslisproces
De prioriteit volgt uit buffertekort, dure schuld, doelen en beleggingshorizon.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Beoordeel financiële doelen]
 C --> D[Toon volgorde]
```

## 4. Rekenproces
De pure logica vergelijkt vrije kasstroom met buffer, rente, rendement en doelbedragen; box 3 gebruikt de gekozen methode waar van toepassing.
```mermaid
flowchart TD
 A[Normaliseer bedragen] --> B[Lees centrale regels]
 B --> C[Bereken scenario's]
 C --> D[Maak prioriteitsadvies]
```

## 5. Gegevensstroom en koppelingen
Lokale React-state; geen backend of profielopslag. Resultaat en download delen het resultaatmodel.

## 6. Resultaten en uitzonderingen
Toon volgorde en aannames, niet een verplicht advies. Rendement, rente en fiscale regels zijn onzeker.

## 7. Functionele bronverwijzingen
- `apps/volgende-euro/app.json`
- `apps/volgende-euro/Calculator.tsx`
- `apps/volgende-euro/logic.ts`
- `apps/volgende-euro/logic.test.ts`
