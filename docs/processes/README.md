# Procesdocumentatie publieke rekentools

Deze index beschrijft de actuele gebruikers-, beslis-, reken- en gegevensprocessen van alle publieke rekentools. De inhoud wordt tegen functionele bronbestanden gecontroleerd met een bronvingerafdruk; de tabel hieronder wordt gegenereerd uit dezelfde appmanifests die de publieke registry voeden.

## Definitie actief en publiek

Een tool valt in deze index wanneer het manifest onder `apps/<slug>/app.json` zowel `enabled: true` als `visibility: "public"` bevat. De registrygenerator gebruikt dezelfde selectie voor registry, lazy component-map en statische routes. Productstatus `active` of `beta` verandert deze technische publicatieregel niet.

## Actuele inventaris

| Tool | Publieke route | Procesdocument | Laatst gecontroleerd | Procesplaten |
| --- | --- | --- | --- | --- |
| Aanvullende beurs berekenen | `/apps/duo-aanvullende-beurs` | [PROCESS.md](../../apps/duo-aanvullende-beurs/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat doet extra aflossen? | `/apps/duo-extra-aflossen` | [PROCESS.md](../../apps/duo-extra-aflossen/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Impact van mijn leenbedrag | `/apps/duo-leenbedrag-impact` | [PROCESS.md](../../apps/duo-leenbedrag-impact/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat wordt mijn DUO-maandbedrag? | `/apps/duo-maandbedrag` | [PROCESS.md](../../apps/duo-maandbedrag/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat wordt mijn studieschuld? | `/apps/duo-schuld-bij-starten-lenen` | [PROCESS.md](../../apps/duo-schuld-bij-starten-lenen/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat kost stoppen met studeren? | `/apps/duo-stoppen-kosten-prestatiebeurs` | [PROCESS.md](../../apps/duo-stoppen-kosten-prestatiebeurs/PROCESS.md) | 2026-08-11 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |

Aantal actieve publieke tools: **6**. Aantal vereiste procesdocumenten: **6**.

## Intern gebruik

De procesdocumenten en Mermaid-platen zijn een interne controlebron voor product, engineering en agents. Ze worden niet automatisch onder publieke toolpagina's weergegeven. `npm run process:check` valideert wel dat de gebruikers-, beslis- en rekenprocessen structureel leesbaar blijven voor interne review en eventuele toekomstige documentatie-uitvoer.

## Actualiseren en valideren

1. Controleer bij een functionele wijziging de volledige bronketen en pas de bijbehorende `PROCESS.md` aan als gedrag, invoer, beslissingen, berekening, resultaten of overdracht wijzigt.
2. Vernieuw pas daarna de gecontroleerde vingerafdruk met `npm run process:update -- --tool <tool-id> --reviewed`.
3. Genereer deze index zo nodig met `npm run process:index`.
4. Draai `npm run process:check`. De controle faalt bij ontbrekende documenten, route- of ID-afwijkingen, ontbrekende secties, ongeldige Mermaid-basisstructuur, ontbrekende bronbestanden, een verouderde hash of een niet-actuele index.

De updateopdracht bevestigt alleen administratief dat een mens of agent de inhoud heeft herbeoordeeld; de vlag `--reviewed` mag niet worden gebruikt om uitsluitend een rode hashcontrole te omzeilen.

De vingerafdruk gebruikt de exacte inhoud van uitsluitend de expliciete functionele bronbestanden in de frontmatter. Dat is bewust conservatief: een formattingwijziging in zo'n bestand kan extra review vragen, maar een gedragswijziging kan niet worden gemist door een onbetrouwbare poging om semantische en cosmetische TypeScript-wijzigingen automatisch te onderscheiden.

## Afwijkingen

- `familiehulp-eerste-woning` heeft publieke manifestmetadata maar `enabled: false` en is daarom terecht niet opgenomen.
- `hypotheek-impact-studieschuld` heeft publieke manifestmetadata maar `enabled: false`; de functionaliteit is als verdieping in `duo-maandbedrag` opgenomen en heeft geen zelfstandige publieke route.
- De Mermaid-validatie gebruikt bewust de projectsubset `flowchart TD` en `sequenceDiagram`. Zonder een zware browser-/Mermaid-CLI-dependency controleert zij structuur, verbindingen, verboden syntax en gebalanceerde delimiters; rendering blijft aanvullend onderdeel van review.
