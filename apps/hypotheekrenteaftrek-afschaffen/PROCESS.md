---
tool: hypotheekrenteaftrek-afschaffen
title: Wat als hypotheekrenteaftrek stopt?
route: /apps/hypotheekrenteaftrek-afschaffen
status: active-public
lastReviewed: 2026-09-22
sourceHash: sha256:a6dbf40e4ed7297f4dc3f3e2cf729c71bbe29497425d92599c3c5136125b834c
sources:
  - apps/hypotheekrenteaftrek-afschaffen/app.json
  - apps/hypotheekrenteaftrek-afschaffen/Calculator.tsx
  - apps/hypotheekrenteaftrek-afschaffen/logic.ts
  - apps/hypotheekrenteaftrek-afschaffen/logic.test.ts
  - src/lib/tax/index.ts
---

# Procesplaat hypotheekrenteaftrek

## 1. Identificatie
Indicatieve scenario-tool voor de netto gevolgen wanneer hypotheekrenteaftrek wegvalt.

## 2. Gebruikersproces
Vul inkomen, hypotheek, rente, hypotheekvorm en horizon in en bekijk het verschil per jaar.
```mermaid
flowchart TD
 A[Lees aannames] --> B[Vul hypotheekgegevens in]
 B --> C[Controleer invoer]
 C --> D[Bekijk tijdlijn]
```

## 3. Beslisproces
De calculator bepaalt per jaar of aftrek binnen de resterende termijn geldt en vergelijkt met geen aftrek.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Controleer resterende aftrektermijn]
 C --> D[Vergelijk netto lasten]
```

## 4. Rekenproces
De centrale fiscale laag berekent het tariefvoordeel; de hypotheeklaag projecteert bruto rente en cumulatief verschil.
```mermaid
flowchart TD
 A[Projecteer bruto rente] --> B[Bereken belastingvoordeel]
 B --> C[Vergelijk met nul aftrek]
 C --> D[Maak jaaroverzicht]
```

## 5. Gegevensstroom en koppelingen
Lokale invoer, centrale hypotheek- en belastinglogica, geen backend of profielopslag.

## 6. Resultaten en uitzonderingen
Toon jaarlijkse en cumulatieve extra netto kosten. Het scenario is indicatief en geen beleidsvoorspelling.

## 7. Functionele bronverwijzingen
- `apps/hypotheekrenteaftrek-afschaffen/app.json`
- `apps/hypotheekrenteaftrek-afschaffen/Calculator.tsx`
- `apps/hypotheekrenteaftrek-afschaffen/logic.ts`
- `apps/hypotheekrenteaftrek-afschaffen/logic.test.ts`
- `src/lib/tax`
