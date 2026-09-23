---
tool: fire-na-belasting
title: Wanneer kan ik stoppen of minder werken?
route: /apps/fire-na-belasting
status: active-public
lastReviewed: 2026-09-23
sourceHash: sha256:868c416f183cbc0791f6f7ec27da82157d5f22d7a6583c3028b9d5046e5e4475
sources:
  - apps/fire-na-belasting/app.json
  - apps/fire-na-belasting/Calculator.tsx
  - apps/fire-na-belasting/logic.ts
  - apps/fire-na-belasting/logic.test.ts
  - src/components/WealthJourneyLinks.tsx
  - src/lib/planning/wealth-planning.ts
  - src/lib/tax/index.ts
  - src/lib/financial-constants/index.ts
---

# Procesplaat FIRE na belasting

## 1. Identificatie

Educatieve beta-tool voor financiële vrijheid. De uitkomst is een scenario-inschatting en geen persoonlijk beleggingsadvies.

## 2. Gebruikersproces

De gebruiker vult vermogen, maandelijkse spaar- en beleggingsinleg, rendement per categorie, uitgaven, inflatie en horizon in, controleert de aannames en bekijkt het omslagpunt.

```mermaid
flowchart TD
 A[Lees doel en waarschuwing] --> B[Vul gegevens in]
 B --> C[Controleer invoer]
 C --> D[Bereken scenario]
 D --> E[Vergelijk horizon]
```

## 3. Beslisproces

Ongeldige of onrealistische waarden worden bij het veld gemeld. Alleen waarden binnen de ondersteunde horizon worden berekend.

```mermaid
flowchart TD
 A{Invoer geldig} -->|Nee| B[Toon veldfout]
 A -->|Ja| C[Controleer scope]
 C --> D[Bereken netto scenario]
```

## 4. Rekenproces

De pure domeinfunctie projecteert vermogen per categorie met maandelijkse inleg, categorie-rendement en inflatie en verwerkt het gekozen box-3-scenario. De gedeelde `wealth-planning`-laag houdt de categorieprojectie consistent met andere vermogenscalculators.

```mermaid
flowchart TD
 A[Normaliseer bedragen per categorie] --> B[Lees centrale fiscale regels]
 B --> C[Roep pure FIRE-berekening aan]
 C --> D[Maak uitleg en tijdlijn]
```

## 5. Gegevensstroom en koppelingen

De React-laag beheert alleen lokale invoer. Er is geen profielopslag, backend of externe beleggingskoppeling. De categorieprojectie komt uit `src/lib/planning/wealth-planning.ts`; scherm en download gebruiken hetzelfde resultaatmodel. Na de uitkomst biedt `WealthJourneyLinks` de financiële planning en Box 3-verfijning als vervolg.

## 6. Resultaten en uitzonderingen

De tool toont een indicatief jaar waarin uitgaven mogelijk door vermogen worden gedragen, plus aannames en beperkingen. Rendement is onzeker; de uitkomst is geen garantie.

## 7. Functionele bronverwijzingen

- `apps/fire-na-belasting/app.json`
- `apps/fire-na-belasting/Calculator.tsx`
- `apps/fire-na-belasting/logic.ts`
- `apps/fire-na-belasting/logic.test.ts`
- `src/components/WealthJourneyLinks.tsx`
- `src/lib/planning/wealth-planning.ts`
- `src/lib/tax`
