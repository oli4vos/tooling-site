# Belastingtools 2027 — uitvoering en bronreview

Peildatum: 18 september 2026. Productstatus: in ontwikkeling; geen fiscale production-review.

## Architectuurbesluit

De aangeleverde specificatie wordt binnen de bestaande architectuur uitgevoerd. Geen monorepo of tweede `@tax`-framework: regels en metadata blijven in `src/lib/financial-constants`, pure berekeningen in `src/lib/tax`, datumrekenen in de bestaande `src/lib/calendar`, adapters in `apps/<slug>` en presentatie in de bestaande CalculatorShell en mobiele vraagflow. Bedragen in nieuwe fiscale functies zijn veilige gehele eurocenten; rationale vermenigvuldiging gebruikt BigInt. Bestaande publieke engines worden niet stil gewijzigd.

Regelversies onderscheiden juridische status van registry-status. `future`/`active` beschrijft selecteerbaarheid van een dataset; `proposed`/`enacted` beschrijft de wet. Een voorstel wordt nooit de automatische default van een bestaande 2026-tool. De release blijft `proposal-preview` totdat de gevraagde onafhankelijke fiscale review is vastgelegd.

## Bronafwijkingen ten opzichte van de opdracht

- Vliegbelasting: §5.23 van het voorstel gebruikt landenlijsten A/B van de Wbm. Afstand tot een luchthaven is geen toereikende classificatie. Het Caribisch Koninkrijk valt in A. Een calculator met alleen grenzen op 2.000/5.500 km zou verkeerde bedragen geven.
- Youngtimer: artikel XLVII(3/4) noemt kalenderjaar 2026 voor de cohortafbakening; de artikelsgewijze toelichting op pagina 180 noemt 2027. De algemene toelichting op pagina 43 beschrijft auto's die in 2027 17 worden. De implementatie volgt de artikeltekst en markeert dit reviewpunt expliciet.
- Netto-inkomen: WML-afhankelijke parameters zijn volgens tabel 1/2 pas definitief na vaststelling in november 2026. Een ontbrekende opbouwgrens mag niet uit een maximumkorting worden geraden.
- Startupopties: het wetsvoorstel bevat tevens een tweejaarswachttermijn. De gebruikersspecificatie noemt die niet. De bijzondere heffingsmomenten vereisen review van de volledige eventvolgorde.

Bron: [Belastingplanstukken](https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/belastingplan/belastingplanstukken), [wetsvoorstel](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-belastingplan-2027/wetsvoorstel-belastingplan-2027.pdf).

## Werkvolgorde en acceptatie

1. Gedeeld bron-, geld-, datum- en uitlegfundament; grens- en regelupdate-tests.
2. Youngtimercheck; wijzigingsscan; startersplanner; inkomensvergelijking.
3. Reiskosten; overdrachtsbelasting; EIA; vliegbelasting volgens landenlijsten.
4. Zorgkosten; pensioenplafond; auto-TCO; startupopties.
5. Per tool: gevalideerde adapter, voorstelbadge, rekenstappen, bronversie, reset, gevoelige-invoervrije export, PROCESS.md en publicatiebesluit.
6. Volledige regressiesuite, lint, typecheck, source- en proceschecks, static build, toetsenbord- en mobielcontrole op 320/375/430 px.

## Bronbeheer voor volgende agents

Controleer eerst AGENTS.md, PROJECT.md en FUNCTIONALITY_STATUS.md. Wijzig geen regel in JSX. Bewaar historische versies en voeg per parameter bronlocatie, verandering, verificatiedatum en juridische status toe. Actualiseer bij een amendement de centrale parameter, grens/golden-tests en alle betrokken PROCESS-documenten. Een groene softwaretest vervangt geen fiscale review. Geen `production`-label zonder genoemde reviewer, datum, gecontroleerde versie en conclusies.

## Werkstand 21 september 2026 — publieke voorstel-beta

Zes conceptadapters zijn na aanvullende releasechecks publiek als voorstel-beta gezet: youngtimer, reiskosten, pensioenplafond, overdrachtsbelasting, EIA en netto-inkomen. Elk heeft een zichtbaar voorstel-label, bronversie, beperkingen, lokale invoer, download, centrale rekenlaag en PROCESS.md. De startersplanner heeft alleen een centrale rekenlaag. De wijzigingsscan, startersgebruikersflow, auto-TCO, zorgkosten, startupopties en vliegbelasting zijn nog niet gebouwd. Ook de zes publieke beta-tools dekken nog niet alle acceptatiecriteria uit de oorspronkelijke twaalf-toolbouwspecificaties.

Deze hervatting herstelt de onjuiste verwachte verliesuitkomst in de ondernemerstest en de TypeScript-inferentie van kopersvelden. Twintig adaptertests controleren voorbeeldscenario's, determinisme, lege invoer, ongeldige keuzes, datums, getallen, conditionele velden en fracties van centen. De centrale bronvalidatie controleert nu de voorstelparameters; een regressietest bewijst dat een ongeldige waarde wordt afgekeurd. Registrytests controleren expliciet dat de zes concepten niet publiek zijn. De eerdere wijziging aan de bestaande Box 1-afronding is teruggenomen: de publieke rekenlaag blijft ongewijzigd.

Controles: 272 testbestanden groen, 1.391 tests geslaagd, 5 bestaande tests overgeslagen. Typecheck, lint, static build, procesdocumentatie van de negen publieke tools en bronvalidatie slagen. Bronvalidatie meldt de bestaande optionele hypotheek-checksum; freshness meldt de aparte toekomstige voorsteldataset. De bronoverzichten zijn opnieuw gegenereerd. Dit is geen browser-, toegankelijkheids- of fiscale goedkeuring.

Nog vereist vóór een publicatiebesluit:

- Volledige productscope per tool en bijbehorende PROCESS.md; bestaande concepten blijven hidden/draft.
- Volledige 2027-arbeidskorting, woningwaardegrens en EIA-jaarvoorwaarden verifiëren; geen referentiewaarden als definitieve jaarregels presenteren.
- Youngtimer-overgangsrecht en IB-kostenplafond in beide vergelijkingspaden controleren; de brontegenstrijdigheid niet met softwaretests afdoen.
- Startersverliesverrekening, vijfjaarshistorie en alle toekomstige referentieaannames afronden.
- Alle rekenparameters van metadata voorzien, ook ondernemersregels en resterende inkomenspercentages; referentiewaarden juridisch onderscheiden van voorstellen.
- Mobiele foutnavigatie, bestaande stijl, toetsenbord, schermlezerlabels, reset en export in de browser controleren op 320/375/430 px.
- Onafhankelijke fiscale review vastleggen vóór het label production.

Publicatie als voorstel-beta is toegestaan omdat iedere uitkomst de voorwaardelijke juridische status en beperkingen toont; dit is nadrukkelijk geen fiscale productie-release. De Toeslagenscan blijft geparkeerd. Commit, push en GitHub Pages-deploy volgen pas na de volledige releasecheck.
