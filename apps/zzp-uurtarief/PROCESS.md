---
tool: zzp-uurtarief
title: Welk ZZP-uurtarief heb ik nodig?
route: /apps/zzp-uurtarief
status: active-public
lastReviewed: 2026-09-21
sourceHash: sha256:7cc94424d7dcda130acc325213c633b218bd0e7253351850d7db74895d29075a
sources:
  - apps/zzp-uurtarief/app.json
  - apps/zzp-uurtarief/Calculator.tsx
  - apps/zzp-uurtarief/logic.ts
  - apps/zzp-uurtarief/logic.test.ts
  - src/lib/tax/box1.ts
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

`apps/zzp-uurtarief/Calculator.tsx` houdt alle invoer lokaal en geeft alleen gevalideerde waarden door aan `apps/zzp-uurtarief/logic.ts`. De scenariofaçade berekent omzet en tarief en gebruikt `src/lib/tax/box1.ts` uitsluitend voor een grove tariefreferentie. De ingevoerde belastingreserve blijft een gebruikersaanname en is geen berekende aanslag.

## 6. Resultaten en uitzonderingen

De tool toont benodigde omzet, belastingreserve, declarabele uren en uurtarief exclusief btw. Nul declarabele uren levert bewust geen bruikbaar uurtarief op. De Box 1-referentie houdt geen rekening met zakelijke kosten, heffingskortingen of ondernemersregelingen en wordt daarom niet als belastingaanslag gepresenteerd.

## 7. Functionele bronverwijzingen

- `apps/zzp-uurtarief/app.json`: publieke metadata.
- `apps/zzp-uurtarief/Calculator.tsx`: formulier en resultaatpresentatie.
- `apps/zzp-uurtarief/logic.ts`: planningsformule en waarschuwingen.
- `src/lib/tax/box1.ts`: centrale Box 1-tariefreferentie.
- `src/lib/financial-constants/years.ts`: centrale 2026-schijven en bronmetadata.
