---
tool: zzp-uurtarief
title: Welk ZZP-uurtarief heb ik nodig?
route: /apps/zzp-uurtarief
status: active-public
lastReviewed: 2026-09-23
sourceHash: sha256:bace956a76d76f4bc5e4b81b1c7bab768decb1d0811ea4f6a4d1a809fda5a3be
sources:
  - apps/zzp-uurtarief/app.json
  - apps/zzp-uurtarief/Calculator.tsx
  - apps/zzp-uurtarief/logic.ts
  - apps/zzp-uurtarief/logic.test.ts
  - src/lib/tax/box1.ts
  - src/lib/tax/income-comparison.ts
  - src/lib/tax/zvw.ts
  - src/lib/financial-constants/years.ts
---

# Procesplaat Welk ZZP-uurtarief heb ik nodig?

## 1. Identificatie

- **Tool-ID:** `zzp-uurtarief`
- **Publieke route:** `/apps/zzp-uurtarief`
- **Doel:** een uurtarief exclusief btw plannen vanuit een netto doel, declarabele tijd, kosten en eigen reserveringspercentages.
- **Gecontroleerd op:** 2026-09-18.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open de ZZP-tariefplanner] --> B[Vul netto doel en maandelijkse reserveringen in]
  B --> C[Vul declarabele uren en werkweken in]
  C --> D[Vul het eigen belastingreservepercentage in]
  D --> E{Is alle invoer geldig}
  E -->|Nee| F[Herstel de gemarkeerde invoer]
  F --> E
  E -->|Ja| G[Bekijk omzet en uurtarief exclusief btw]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Is een maandbedrag voor pensioen ingevuld} -->|Ja| B[Gebruik het maandbedrag]
  A -->|Nee| C{Is een pensioenpercentage ingevuld}
  C -->|Ja| D[Bereken pensioenreserve over het netto doel]
  C -->|Nee| E[Gebruik geen pensioenreserve]
  B --> F{Zijn declarabele uren groter dan nul}
  D --> F
  E --> F
  F -->|Nee| G[Toon geen bruikbaar uurtarief]
  F -->|Ja| H[Bereken het uurtarief]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Zet maandbedragen om naar jaarbedragen] --> B[Tel netto doel buffer pensioen AOV en kosten op]
  B --> C[Bruto het subtotaal op met de gekozen belastingreserve]
  C --> D[Bepaal de benodigde jaaromzet]
  D --> E[Deel door declarabele uren per jaar]
  E --> F[Toon uurtarief exclusief btw]
```

## 5. Gegevensstroom en koppelingen

`apps/zzp-uurtarief/Calculator.tsx` houdt alle invoer lokaal en geeft alleen gevalideerde waarden door aan `apps/zzp-uurtarief/logic.ts`. De scenariofaçade berekent omzet en tarief. Voor 2026 en de voorstelvergelijking 2027 gebruikt de fiscale referentie de centrale box 1-schijven, heffingskortingen en de Zvw-route voor winst uit onderneming; zakelijke kosten worden eerst van de benodigde omzet afgetrokken. De ingevoerde belastingreserve blijft een gebruikersaanname en is geen berekende aanslag.

## 6. Resultaten en uitzonderingen

De tool toont benodigde omzet, belastingreserve, declarabele uren en uurtarief exclusief btw. Nul declarabele uren levert bewust geen bruikbaar uurtarief op. De fiscale referentie trekt zakelijke kosten af en toont heffingskortingen en Zvw apart, maar activeert nog geen ondernemersaftrek, MKB-winstvrijstelling, startersaftrek, investeringsaftrek of persoonlijke aftrekposten. Daarom wordt de uitkomst niet als belastingaanslag gepresenteerd.

## 7. Functionele bronverwijzingen

- `apps/zzp-uurtarief/app.json`: publieke metadata.
- `apps/zzp-uurtarief/Calculator.tsx`: formulier en resultaatpresentatie.
- `apps/zzp-uurtarief/logic.ts`: planningsformule en waarschuwingen.
- `src/lib/tax/box1.ts`: centrale Box 1-tariefreferentie.
- `src/lib/tax/income-comparison.ts`: centrale 2026/2027-heffingskortingen.
- `src/lib/tax/zvw.ts`: centrale Zvw-bijdrage voor winst uit onderneming.
- `src/lib/financial-constants/years.ts`: centrale 2026-schijven en bronmetadata.
