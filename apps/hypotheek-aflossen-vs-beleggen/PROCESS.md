---
tool: hypotheek-aflossen-vs-beleggen
title: Hypotheek aflossen of beleggen?
route: /apps/hypotheek-aflossen-vs-beleggen
status: active-public
lastReviewed: 2026-09-22
sourceHash: sha256:4ad9d15ab131fa56e77bfbc356ceb67179bd180d5a9d83c20acca3269801dc92
sources:
  - apps/hypotheek-aflossen-vs-beleggen/app.json
  - apps/hypotheek-aflossen-vs-beleggen/Calculator.tsx
  - apps/hypotheek-aflossen-vs-beleggen/logic.ts
  - apps/hypotheek-aflossen-vs-beleggen/logic.test.ts
---

# Procesplaat hypotheek aflossen of beleggen

## 1. Identificatie
Educatieve vergelijker; de uitkomst is geen persoonlijk advies.

## 2. Gebruikersproces
Vul hypotheek, rente, vrije ruimte en beleggingsaannames in en vergelijk beide routes.
```mermaid
flowchart TD
 A[Lees waarschuwing] --> B[Vul scenario in]
 B --> C[Controleer invoer]
 C --> D[Bereken vergelijking]
```

## 3. Beslisproces
Ongeldige waarden blokkeren de berekening; geldige waarden tonen beide scenario's.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Vergelijk scenario's]
```

## 4. Rekenproces
De pure logica vergelijkt gegarandeerde rentebesparing met een onzeker beleggingsscenario.
```mermaid
flowchart TD
 A[Normaliseer bedragen] --> B[Lees centrale regels]
 B --> C[Roep pure vergelijking aan]
 C --> D[Toon uitleg]
```

## 5. Gegevensstroom en koppelingen
Lokale React-state; geen backend of profielopslag. Scherm en download delen het resultaatmodel.

## 6. Resultaten en uitzonderingen
Toon verschil, aannames, onzekerheid en fiscale beperkingen; geen rendementsgarantie.

## 7. Functionele bronverwijzingen
- `apps/hypotheek-aflossen-vs-beleggen/app.json`
- `apps/hypotheek-aflossen-vs-beleggen/Calculator.tsx`
- `apps/hypotheek-aflossen-vs-beleggen/logic.ts`
- `apps/hypotheek-aflossen-vs-beleggen/logic.test.ts`
