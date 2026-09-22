---
tool: studieschuld-vs-beleggen
title: Studieschuld extra aflossen of beleggen?
route: /apps/studieschuld-vs-beleggen
status: active-public
lastReviewed: 2026-09-22
sourceHash: sha256:1070eaa970a3e224520666b43b2904a5f15440913eb3964b28afa496b932fbe2
sources:
  - apps/studieschuld-vs-beleggen/app.json
  - apps/studieschuld-vs-beleggen/Calculator.tsx
  - apps/studieschuld-vs-beleggen/logic.ts
  - apps/studieschuld-vs-beleggen/logic.test.ts
---

# Procesplaat studieschuld versus beleggen

## 1. Identificatie
Educatieve scenariovergelijker voor extra aflossen op studieschuld versus beleggen; geen persoonlijk advies.

## 2. Gebruikersproces
Vul schuld, rente, inkomen, extra maandbedrag en beleggingsrendement in en vergelijk de scenario's.
```mermaid
flowchart TD
 A[Lees doel en waarschuwing] --> B[Vul schuld en scenario in]
 B --> C[Controleer invoer]
 C --> D[Bereken vergelijking]
```

## 3. Beslisproces
Fouten blokkeren de berekening; geldige invoer wordt doorgerekend binnen de ondersteunde looptijd.
```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Controleer looptijd]
 C --> D[Vergelijk aflossen en beleggen]
```

## 4. Rekenproces
De pure logica berekent DUO-betalingen, vervroegde aflossing en de waarde van dezelfde maandelijkse ruimte bij beleggen.
```mermaid
flowchart TD
 A[Normaliseer schuld en rente] --> B[Lees centrale regels]
 B --> C[Bereken aflossingspad]
 C --> D[Projecteer beleggingsscenario]
```

## 5. Gegevensstroom en koppelingen
Lokale React-state zonder backend of profielopslag. De zichtbare uitkomst en download delen hetzelfde resultaatmodel.

## 6. Resultaten en uitzonderingen
Toon verschil, looptijd, aannames en onzekerheid. DUO-regels en rendement kunnen wijzigen; de vergelijking is indicatief.

## 7. Functionele bronverwijzingen
- `apps/studieschuld-vs-beleggen/app.json`
- `apps/studieschuld-vs-beleggen/Calculator.tsx`
- `apps/studieschuld-vs-beleggen/logic.ts`
- `apps/studieschuld-vs-beleggen/logic.test.ts`
