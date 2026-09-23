---
tool: box3-indicatie
title: Box 3 indicatie
route: /apps/box3-indicatie
status: active-public
lastReviewed: 2026-09-23
sourceHash: sha256:836dd5ed2706f579b424eed0e65d2632c0432692be4dac4cb5c10245c5af1d11
sources:
  - apps/box3-indicatie/app.json
  - apps/box3-indicatie/Calculator.tsx
  - apps/box3-indicatie/logic.ts
  - apps/box3-indicatie/logic.test.ts
  - src/lib/tax/box3.ts
  - src/lib/tax/types.ts
---

# Procesplaat Box 3-indicatie

## 1. Identificatie
Indicatieve fiscale tool voor spaargeld, beleggingen en schulden. Geen aangifte of persoonlijk belastingadvies.

## 2. Gebruikersproces
Vul vermogen, schulden, fiscale partner en jaar in en kies werkelijk of forfaitair rendement.
```mermaid
flowchart TD
 A[Lees waarschuwing] --> B[Vul vermogen en schulden in]
 B --> C[Kies rendementmethode]
 C --> D[Controleer invoer]
 D --> E[Bereken indicatie]
```

## 3. Beslisproces
De gekozen methode bepaalt welke rendementroute wordt gebruikt; ongeldige invoer blokkeert de uitkomst.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C{Methode werkelijk of forfaitair}
 C --> D[Bereken volgens gekozen route]
```

## 4. Rekenproces
De centrale box-3-laag past vrijstelling, schuldendrempel, rendement en tarief toe voor het gekozen jaar.
```mermaid
flowchart TD
 A[Normaliseer bedragen] --> B[Lees versiegebonden box3-regels]
 B --> C[Gebruik werkelijk rendement of forfaitaire percentages]
 C --> D[Bereken indicatieve heffing en waarschuwingen]
```

## 5. Gegevensstroom en koppelingen
De calculator geeft invoer door aan `calculateBox3Tax`. Er is geen backend of profielopslag; scherm en download delen hetzelfde resultaatmodel.

## 6. Resultaten en uitzonderingen
De tool toont methode, grondslag, indicatieve heffing en waarschuwingen. Werkelijk rendement is hier een vereenvoudigde projectie en geen officiële vaststelling.

## 7. Functionele bronverwijzingen
- `apps/box3-indicatie/app.json`
- `apps/box3-indicatie/Calculator.tsx`
- `apps/box3-indicatie/logic.ts`
- `apps/box3-indicatie/logic.test.ts`
- `src/lib/tax/box3.ts`
- `src/lib/tax/types.ts`
