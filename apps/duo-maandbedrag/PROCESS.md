---
tool: duo-maandbedrag
title: Wat wordt mijn DUO-maandbedrag?
route: /apps/duo-maandbedrag
status: active-public
lastReviewed: 2026-09-18
sourceHash: sha256:c723ecf0a0753b3a15d2c59c2106f4c9c21dfc8d0de583c5a3a96c1f1279fcbf
sources:
  - apps/duo-maandbedrag/app.json
  - apps/duo-maandbedrag/Calculator.tsx
  - apps/duo-maandbedrag/logic.ts
  - apps/duo-maandbedrag/MortgageImpactDepth.tsx
  - apps/duo-maandbedrag/mortgage-depth.ts
  - apps/duo-maandbedrag/report.ts
  - src/components/ResultVisualization.tsx
  - src/components/duo/DuoDebtPartsEditor.tsx
  - src/components/MobileFieldFlowControls.tsx
  - src/components/tool/CalculationContextNotice.tsx
  - src/components/tool/CalculatorShell.tsx
  - apps/hypotheek-impact-studieschuld/logic.ts
  - src/lib/duo/calculations.ts
  - src/lib/duo/mortgage-assessment.ts
  - src/lib/duo/debt-parts-form.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/years.ts
  - src/lib/financial-constants/duo-rate-history.ts
  - src/lib/duo-mortgage-transfer.ts
  - src/lib/profile-tool-mapping.ts
  - src/lib/profile-prefill.ts
  - src/lib/profile-result-mapping.ts
  - src/lib/tool-handoff.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Wat wordt mijn DUO-maandbedrag?

## 1. Identificatie

- **Tool-ID:** `duo-maandbedrag`
- **Publieke route:** `/apps/duo-maandbedrag`
- **Doel:** de wettelijke DUO-maandtermijn berekenen, optioneel een draagkrachtindicatie tonen en daarna desgewenst de hypotheekimpact verdiepen zonder een tweede publieke calculator te openen.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** `apps/duo-maandbedrag/Calculator.tsx`, adapter `apps/duo-maandbedrag/logic.ts` en centrale DUO-functies in `src/lib/duo/calculations.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open DUO-maandbedrag] --> B{Profiel, handoff of hypotheektransfer?}
  B -->|Ja| C[Neem geldige schuldgegevens vooraf over]
  B -->|Nee| D[Start met lege invoer]
  C --> E[Kies totale schuld of leningdelen]
  D --> E
  E --> F[Kies terugbetaalduur en rentepercentage]
  F --> G{Inkomen ook meenemen?}
  G -->|Ja| H[Vul toetsingsinkomen en huishoudsituatie in]
  G -->|Nee| I[Laat inkomen leeg]
  H --> J{Invoer geldig?}
  I --> J
  J -->|Nee| K[Herstel schuld, regeling, rente of inkomen]
  K --> J
  J -->|Ja| L[Bereken wettelijke maandtermijn]
  L --> M[Bekijk optioneel draagkrachtbedrag]
  M --> N{Hypotheekimpact bekijken?}
  N -->|Nee| O[Bekijk details, PDF en vervolgstappen]
  N -->|Ja| P[Vul bruto inkomen en optioneel partnerinkomen in]
  P --> Q{Aanvullende invoer geldig?}
  Q -->|Nee| R[Herstel het gemarkeerde inkomen]
  R --> Q
  Q -->|Ja| S[Bekijk hypotheek met en zonder studieschuld]
  S --> SA[Bekijk vergelijking en open desgewenst de exacte tabel]
  SA --> T{Hoe is dit berekend openen?}
  T -->|Ja| U[Bekijk maandbedrag, omrekening voor de bank en bronnen]
  T -->|Nee| O
  U --> O
```

## 3. Beslisproces

Op mobiel doorloopt de gebruiker eerst alleen schuld, terugbetaalduur en rentepercentage. Leningdelen en een mogelijke verlaging op basis van inkomen staan in afzonderlijke, standaard gesloten verdiepingen en zijn geen lege mobiele stappen. Het rentejaar verdwijnt wanneer leningdelen actief zijn. De mobiele actie blijft tijdens scrollen bereikbaar. De laatste actie heet `Bekijk uitkomst`; zonder inkomensgegevens toont het hoofdresultaat alleen de wettelijke maandtermijn en met inkomen daarnaast het lagere indicatieve bedrag.

```mermaid
flowchart TD
  A{Leningdelen gekozen?} -->|Ja| B[Valideer delen en bereken gewogen rente]
  A -->|Nee| C[Gebruik totale schuld en gekozen rentejaar]
  B --> D{Concrete regeling bekend?}
  C --> D
  D -->|Nee| E[Blokkeer en verwijs naar Mijn DUO]
  D -->|Ja| F[Bepaal wettelijke looptijd]
  F --> G{Toetsingsinkomen ingevuld?}
  G -->|Nee| H[Toon alleen wettelijke termijn]
  G -->|Ja| I[Bereken draagkrachtvrije voet en percentage]
  I --> J{Draagkracht lager dan wettelijke termijn?}
  J -->|Ja| K[Gebruik draagkracht als indicatief te betalen bedrag]
  J -->|Nee| L[Gebruik wettelijke termijn]
  H --> M{Hypotheekverdieping geopend?}
  K --> M
  L --> M
  M -->|Nee| N[Behoud alleen DUO-resultaat]
  M -->|Ja| O[Hergebruik schuld, regeling, rente, looptijd en wettelijke termijn]
  O --> P{Bruto inkomen geldig?}
  P -->|Nee| Q[Blokkeer hypotheekindicatie]
  P -->|Ja| R[Roep bestaande hypotheekimpact-use-case aan]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Schuld of afzonderlijke leningdelen] --> B[Bepaal totale schuld]
  C[Rentejaar per schuld] --> D[Bepaal rente en gewogen rente]
  E[Terugbetalingsregel] --> F[Selecteer 15 of 35 jaar]
  B --> G[Bereken annuitaire wettelijke termijn]
  D --> G
  F --> G
  H[Toetsingsinkomen en huishoudsituatie] --> I[Selecteer draagkrachtvrije voet]
  I --> J[Bereken inkomen boven vrijstelling]
  K[Draagkrachtpercentage per regeling] --> L[Bereken draagkracht per maand]
  J --> L
  G --> M[Neem laagste van wettelijke termijn en draagkracht]
  L --> M
  M --> N[Bepaal bron: wettelijk of draagkracht]
  N --> O[Bouw primaire DUO-uitkomst]
  O --> P{Gebruiker opent hypotheekverdieping?}
  P -->|Nee| Q[Stop na DUO-resultaat]
  P -->|Ja| R[Gebruik wettelijke termijn als hypotheekbasis]
  R --> S[Reken om naar de woonlast die de bank kan meetellen]
  S --> T[Trek die impact af van de ruimte voor hypotheeklast]
  T --> U[Bereken hypotheek met en zonder studieschuld]
```

Voor `SF15_OLD` is geen eenvoudig centraal draagkrachtpercentage beschikbaar; die situatie blijft expliciet beperkt en gewaarschuwd. Rentehistorie, looptijden en draagkrachtregels komen via `src/lib/financial-constants/index.ts`.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant G as Gebruiker
  participant D as DUO-maandbedrag
  participant E as Centrale DUO-engine
  participant A as Hypotheekadapter
  participant H as Bestaande hypotheek-use-case
  G->>D: Vult DUO-gegevens in
  D->>E: Bereken wettelijke maandtermijn
  E-->>D: DUO-resultaat met schuld, rente en looptijd
  G->>D: Opent optionele hypotheekverdieping
  D->>A: DUO-resultaat plus bruto inkomen
  A->>H: Map naar bestaande hypotheekinput
  H-->>A: Hypotheekimpact en tussenwaarden
  A-->>D: Vergelijking, omrekenfactor en bronmetadata
  D-->>G: Toon compacte impact en uitleg in gewone taal
```

De publieke verdieping gebruikt geen URL-parameters of persistente overdracht. De afgeronde DUO-view blijft lokaal in de calculator en wordt immutable aan de adapter doorgegeven. Bestaande profielprefill blijft ongewijzigd; de PDF gebruikt dezelfde DUO-view en controleert paginaruimte voordat een nieuw inhoudsblok wordt geplaatst. Bedragen staan niet in de URL.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Wettelijke maandtermijn | Schuld, rente en wettelijke looptijd | Na geldige berekening | Dit is de termijn volgens het gekozen schuldmodel. |
| Indicatief draagkrachtbedrag | Inkomen boven vrije voet en percentage | Alleen met toetsingsinkomen | DUO stelt draagkracht jaarlijks officieel vast. |
| Hypotheek met en zonder studieschuld | Bestaande hypotheekimpact-use-case | Alleen na openen, geldige inkomensinvoer en berekenen | Laat de indicatieve leencapaciteitsimpact zien. |
| Hypotheekvergelijking en tabel | Dezelfde maximale hypotheek met en zonder studieschuld | Direct bij de hypotheekuitkomst; tabel standaard gesloten | De balken tonen de verhouding en de tabel noemt beide bedragen en het verschil exact. |
| Omrekening voor de hypotheek | Wettelijke termijn en centrale hypotheekconstants | Alleen binnen `Hoe is dit berekend?` | Legt in gewone taal uit welke woonlast de bank kan meetellen; de technische term brutering staat pas in de toelichting. |
| Gewogen rente | Meerdere leningdelen | Alleen bij leningdelen | Elk deel behoudt eigen rentejaar in de berekening. |
| PDF | Geldige view | Na berekening | Gebruikt hetzelfde resultaat. |

Onbekende regeling, ongeldige schuld, ongeldige leningdelen of een niet-ondersteund rentejaar blokkeren het DUO-resultaat. Ontbrekend of negatief hypotheekinkomen blokkeert alleen de optionele hypotheekindicatie. Sluiten en heropenen van de verdieping behoudt de lokale invoer; opnieuw beginnen met de DUO-tool verwijdert ook de verdieping.

## 7. Functionele bronverwijzingen

- `apps/duo-maandbedrag/app.json`: publieke identiteit.
- `apps/duo-maandbedrag/Calculator.tsx`: formulier, transferstatus, profiel, resultaat en PDF.
- `apps/duo-maandbedrag/logic.ts`: validatie, portefeuille, draagkracht en transferkandidaat.
- `apps/duo-maandbedrag/MortgageImpactDepth.tsx`: standaard gesloten invoer-, resultaat- en uitlegverdieping.
- `apps/duo-maandbedrag/mortgage-depth.ts`: pure mapping van de DUO-view naar de bestaande hypotheekimpact-use-case.
- `apps/hypotheek-impact-studieschuld/logic.ts`: bestaande hypotheekimpactberekening en gestructureerde tussenuitkomsten.
- `src/lib/duo/calculations.ts`: wettelijke termijn en draagkrachtindicatie.
- `src/lib/duo/mortgage-assessment.ts`: keuze van relevant hypotheektoetsbedrag.
- `src/lib/duo-mortgage-transfer.ts`: tijdelijke sessie- en retourflow.
- `apps/duo-maandbedrag/report.ts`: PDF uit dezelfde view, met paginacontrole vóór ieder inhoudsblok.
- Regressies: `apps/duo-maandbedrag/logic.test.ts`, `apps/duo-maandbedrag/mortgage-depth.test.ts`, `apps/duo-maandbedrag/report.test.ts` en `src/lib/duo/mortgage-assessment.test.ts`.
