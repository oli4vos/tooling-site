# Audit fiscale rekenlaag en onderliggende berekeningen

**Project:** Tooling Site / IPC Ole  
**Auditdatum:** 28 september 2026  
**Peildatum wet- en broncontrole:** 28 september 2026  
**Scope:** de 24 publieke rekenhulpen, hun gedeelde rekenlagen, bronregister en geautomatiseerde controles.  
**Niet in scope:** een individuele aangifte, toeslagenberekening, advies over een concrete belegging of hypotheekaanvraag.  
**Uitkomst in één zin:** de basisbedragen en eenvoudige rekenformules voor 2026 zijn grotendeels juist en centraal opgeslagen, maar de site is nog **niet geschikt als fiscale uitkomstmachine** zonder eerst de hieronder genoemde P0-punten op te lossen — met name Box 3 werkelijk rendement, toekomstige belasting in prognoses en een verouderde hypotheekrenteaftrekfactor in één tool.

> Dit document is een technische en inhoudelijke audit, geen belastingadvies. Een `groen` oordeel betekent dat de geïnspecteerde formule en centrale parameter aansluiten op de genoemde bron binnen de afgebakende invoer. Het betekent niet dat alle persoonlijke voorwaarden voor een aangifte zijn afgedekt.

## 1. Managementsamenvatting

### Eindoordeel per toepassingsniveau

| Toepassing | Oordeel | Voorwaarde |
|---|---|---|
| Rekenen met rente, aflossing, maandelijkse inleg en samengestelde groei | **Geschikt als scenario** | Leg invoermoment, rendement en kosten expliciet vast. |
| Tarieven en standaardbedragen 2026 (Box 1 vóór AOW, Zvw, forfaitair Box 3, overdrachtsbelasting, EIA) | **Grotendeels juist** | Alleen voor de expliciet gemodelleerde situatie; vergelijk met de broncases in §9. |
| Netto-inkomen en hypotheekrenteaftrek | **Indicatief** | Niet gebruiken als aangifte- of loonstrookuitkomst; persoonlijke aftrekposten, AOW en eigenwoningregels zijn niet volledig gemodelleerd. |
| Box 3 forfaitaire voorlopige berekening 2026 | **Juist binnen de eenvoudige invoer** | Percentages zijn voorlopig en de vermogensindeling moet correct zijn. |
| Box 3 werkelijk rendement / tegenbewijs | **Niet aangiftegeschikt** | De huidige berekening is alleen een scenario; de wettelijke ‘voordeligste uitkomst’-vergelijking ontbreekt. |
| Meerjarige vermogens- en FIRE-prognoses ‘na belasting’ | **Scenario, niet fiscale prognose** | De gekozen belastingregels worden nu voor ieder toekomstjaar herhaald. |
| 2027-tools | **Alleen voorstel-scenario** | Geen tarief of beleidswijziging presenteren als vastgesteld recht vóór inwerkingtreding. |
| Maximale hypotheek | **Indicatieve voorselectie** | Q3-toetsrente loopt 30 september 2026 af; actualisatie is direct nodig. Een geldverstrekker beslist. |
| DUO-tools | **Bruikbare indicatie** | Controleer terugbetalingsregel, rentevaste periode, peiljaar, partner en uitzonderingen bij DUO. |

### Prioriteit vóór de volgende inhoudelijke release

1. **P0 — Box 3 werkelijk rendement:** bereken altijd forfaitair én werkelijk rendement; toon alleen een mogelijke vermindering wanneer werkelijk rendement lager is. Noem dit ‘tegenbewijs-scenario’, niet een vrije belastingmethode.
2. **P0 — annuïtair versus lineair:** vervang de statische netto-rentefactor `0,6303` door de centrale hypotheekrenteaftrekfunctie of maak hem zichtbaar als door de gebruiker gekozen aanname. Voor 2026 is de maximale aftrek in de hoogste schijf 37,56%; de vaste factor correspondeert daar niet mee.
3. **P0 — hypotheekrente:** neem de al gepubliceerde AFM-toetsrente voor Q4 op vóór 1 oktober 2026 en laat de app niet stilzwijgend met een verlopen kwartaalwaarde rekenen.
4. **P1 — toekomstjaren:** laat een 20- of 30-jaarsplanning niet doen alsof de Box 3-regels van 2026 in alle latere jaren vaststaan. Toon een belastingpad/aannameset of markeer fiscale bedragen na jaar 1 als onzeker.
5. **P1 — releasebewaking:** maak broncontrole reproduceerbaar via de project-Nodeversie en voeg een checksum/golden cases toe voor de hypotheek-financieringslasttabel.

## 2. Werkwijze en bewijsmateriaal

De audit is uitgevoerd zonder rekenlogica te wijzigen. Gecontroleerd zijn:

- de publieke registry: `src/lib/app-registry.ts` (24 actieve publieke tools);
- de centrale jaren-, bron- en voorsteldata onder `src/lib/financial-constants/`;
- de gedeelde rekenlagen voor Box 1, Zvw, Box 3, hypotheekrenteaftrek, inkomstenvergelijking, EIA, overdrachtsbelasting en hypotheeknormen;
- de tool-specifieke logica voor hypotheek, vermogen en DUO;
- de bronregisters en procesdocumentatie;
- statische typen en alle geautomatiseerde tests.

### Uitgevoerde technische controles

| Controle | Resultaat | Opmerking |
|---|---|---|
| `tsc --noEmit` | **Geslaagd** | Geen TypeScript-fouten. |
| `vitest run` | **Geslaagd** | 282 testbestanden; 1.416 geslaagd, 5 bewust overgeslagen; totaal 1.421. |
| `process:check` | **Geslaagd** | Procesdocumentatie voor alle 24 publieke tools aanwezig. |
| `validate:source-data` | **Geslaagd met 1 waarschuwing** | Dataset `mortgage-financing-load-2026` mist een optionele checksum. |
| Reproduceerbaarheid via de standaard lokale npm-koppeling | **Niet geslaagd** | De lokale npm koppelt aan een oude Node-runtime en faalt op moderne syntax. Met de project-Node v24.19.0 slaagt dezelfde broncontrole wel. |

De laatste bevinding is geen fout in de fiscale formule, maar wel een release-risico: een ontwikkelaar die de standaard `npm run validate:source-data` uitvoert kan ten onrechte denken dat de controle stuk is. Leg daarom een ondersteunde Node-versie vast (bijvoorbeeld `.nvmrc`/Volta of een CI-image) en laat CI de bronvalidatie uitvoeren.

### Gehanteerde primaire bronnen

Deze audit toetst fiscale claims aan uitvoeringsinformatie van Belastingdienst/DUO en, waar passend, aan de Staatscourant. De belangrijkste startpunten zijn:

- [Belastingdienst — tarieven en heffingskortingen voorlopige aanslag 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen)
- [Belastingdienst — forfaitaire Box 3-berekening 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026)
- [Belastingdienst — werkelijk rendement Box 3](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement)
- [Belastingdienst — wijziging bijdrage Zvw](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/)
- [Belastingdienst — tariefsaanpassing aftrek eigen woning](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/tariefsaanpassing-eigen-woning)
- [Belastingdienst — startersvrijstelling overdrachtsbelasting](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/)
- [Belastingdienst — energie-investeringsaftrek](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/investeringsaftrek_en_desinvesteringsbijtelling/energie_investeringsaftrek_eia)
- [DUO — rente voor studenten](https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp) en [DUO — berekening maandbedrag](https://www.duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp)
- [Staatscourant — financieringslastpercentages 2026](https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html)
- [Rijksoverheid — wetsvoorstel Belastingplan 2027](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-belastingplan-2027/wetsvoorstel-belastingplan-2027.pdf), uitsluitend als **voorstelbron**.

## 3. Status van de centrale rekenlaag

| Laag | Implementatie | Oordeel | Handmatige conclusie |
|---|---|---|---|
| Jaarselectie | `getFinancialConstants(year)` | **Let op** | Onbekend jaar valt stil terug op 2026. Dat is veilig voor een demo, maar onveilig wanneer een gebruiker denkt een toekomstjaar door te rekenen. |
| Box 1 bruto schijven | `src/lib/tax/box1.ts` | **Goed afgebakend** | Rekent alleen progressieve bruto belasting, vóór AOW, zonder kortingen. De waarschuwing in de functie is terecht; het resultaat mag nooit als netto belasting worden hernoemd. |
| Heffingskortingen/netto inkomen | `src/lib/tax/income-comparison.ts` | **Deels volledig** | Algemene heffingskorting, arbeidskorting en enkele specifieke kortingen zijn opgenomen. De AOW-transitie binnen een kalenderjaar wordt terecht geweigerd. Niet alle persoonlijke situaties en loonheffingseffecten zijn afgedekt. |
| Zvw | `src/lib/tax/zvw.ts` | **Goed voor één inkomenssoort** | Correcte 2026-percentages en maximumgrondslag. Bij gemengde inkomenssoorten bepaalt de invoervolgorde welk tarief de gezamenlijke cap krijgt; dat kan afwijken van officiële verrekening. |
| HRA | `src/lib/tax/mortgage-interest-deduction.ts` | **Eenvoudige indicatie** | Past de maximale 2026-aftrek toe als plafond op de marginale schijf. Eigenwoningforfait, aftrekvolgorde, schuldkwalificatie, 30-jaarsregeling en betalingsmoment ontbreken. |
| Box 3 forfaitair | `src/lib/tax/box3.ts` | **Goed voor 2026 voorlopig model** | De formule en actuele voorlopige parameters sluiten aan. Correcte categorie-indeling blijft voorwaarde. |
| Box 3 werkelijk rendement | `src/lib/tax/box3.ts` | **Onvoldoende voor officiële uitkomst** | Zie kritieke bevinding F-01. |
| Hypotheeknormen | `src/lib/mortgage/max-mortgage.ts` | **Indicatief met sterke bronbasis** | Staatscourant-tabel is centraal, maar toetsrente is tijdgebonden en studieschuld-brutering bevat projectaannames. |
| Voorstellen 2027 | `tax-proposals.ts` | **Technisch transparant, productmatig risicovol** | Metadata zeggen terecht `proposed`/`future`, maar iedere uitkomst moet dit zichtbaar dragen. |

### 3.1 Centrale parameters 2026 vergeleken met primaire bron

| Onderwerp | Centrale waarde | Bronstatus | Audituitkomst |
|---|---:|---|---|
| Box 1, schijf 1 | 35,75% t/m € 38.883 | Officiële 2026-tabel | Match, voor niet-AOW-gerechtigde. |
| Box 1, schijf 2 | 37,56% t/m € 78.426 | Officiële 2026-tabel | Match. |
| Box 1, schijf 3 | 49,50% boven € 78.426 | Officiële 2026-tabel | Match. |
| Algemene heffingskorting | max. € 3.115, afbouw vanaf € 29.736 met 6,398% | Officiële 2026-tabel | Match voor niet-AOW. |
| Arbeidskorting | grenzen € 11.965 / € 25.845 / € 45.592 / € 132.920 | Officiële 2026-tabel | Match voor niet-AOW. |
| Zvw werkgever | 6,10%, maximum € 79.409 | Officiële 2026-tabel | Match. |
| Zvw werknemer/zelfstandige | 4,85%, maximum € 79.409 | Officiële 2026-tabel | Match. |
| Box 3 vrijstelling | € 59.357 alleen / € 118.714 partners | Voorlopige aanslag 2026 | Match. |
| Box 3 forfait sparen / overige / schuld | 1,28% / 6,00% / 2,70% | Voorlopige aanslag 2026 | Match; percentages zijn voorlopig. |
| Box 3-tarief | 36% | Voorlopige aanslag 2026 | Match. |
| HRA-plafond hoogste inkomens | 37,56% | Belastingdienst 2026 | Match in centrale dataset; niet overal consequent gebruikt. |
| EIA 2026 | 40%, minimum € 2.500, maximum € 153 mln | Belastingdienst/RVO-regime | Match als de investering kwalificeert. |
| Overdrachtsbelasting 2026 eigen woning / woning niet-hoofdverblijf / niet-woning | 2% / 8% / 10,4% | Belastingdienst | Match binnen de eenvoudige route. |

## 4. Bevindingen met prioriteit

### F-01 — Kritiek: Box 3 ‘werkelijk rendement’ is geen vrije methode

**Betrokken laag/tools:** `src/lib/tax/box3.ts`, `box3-indicatie`, `box-3-impact`, `annuitair-lineair`, `hypotheek-aflossen-vs-beleggen`, `prive-beleggen-eindvermogen`, `fire-na-belasting`, `jaarruimte-vs-vrij-beleggen`, `studieschuld-vs-beleggen` en de financiële planning.

**Wat de wetuitvoering zegt.** De Belastingdienst berekent tot nieuwe wetgeving in beginsel fictief rendement. Werkelijk rendement is de tegenbewijsroute wanneer het lager is; de gebruiker betaalt nooit méér belasting dan de eerdere fictieve berekening. Werkelijk rendement omvat alle inkomsten én waardeveranderingen van alle bezittingen en schulden. Vanaf 2026 geldt bij eigen gebruik van een tweede woning/andere onroerende zaak bovendien een bijtelling (als vaste optie 5,06% van de WOZ-waarde, naar gebruikstijd). Zie [Werkelijk rendement](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement).

**Wat de code doet.** Bij `method: "actual"` wordt belasting berekend als 36% van `max(inkomsten + waardeverandering − betaalde schuldrente, 0)`, of als 36% van een handmatig rendement op de totale activa. De vergelijking met de forfaitaire uitkomst ontbreekt. De invoer bevat ook niet de noodzakelijke detailgegevens om alle categorieën, begin-/eindwaarden, negatieve resultaten en de bijtelling eigen gebruik te beoordelen.

**Risico.** De tool kan een hogere ‘werkelijk’-belasting tonen dan forfaitair, terwijl de officiële tegenbewijsroute juist alleen voordeel mag geven. Ook kunnen gebruikers denken dat zij tussen twee gelijke, zelf te kiezen belastingstelsels kiezen. Dat is inhoudelijk onjuist en materieel voor beslissingen over beleggen, aflossen en FIRE.

**Besluit:** **P0.**

**Benodigde correctie.**

1. Bereken voor één belastingjaar zowel `forfaitair` als `werkelijk` uit dezelfde vermogensinventaris.
2. Rapporteer `indicatieve officiële belasting = min(forfaitair, werkelijk)` uitsluitend als alle verplichte werkelijke gegevens zijn ingevuld en de gebruiker de tegenbewijsvoorwaarden bevestigt.
3. Geef anders alleen `werkelijk rendement-scenario` weer, zonder het als belastingaangifte te labelen.
4. Voeg categorieën/velden toe voor rente/dividend/huur, kosten voor zover toegestaan, waardemutaties, schuld-rente, begin- en eindwaarden en eigen gebruik van onroerend goed.
5. Voeg tests toe voor: werkelijk hoger dan forfaitair, werkelijk lager dan forfaitair, negatief rendement, tweede woning eigen gebruik en fiscale partners.

### F-02 — Hoog: 2026-fiscaliteit wordt over hele toekomstige horizon herhaald

**Betrokken laag/tools:** `src/lib/financial-plan.ts` en vrijwel alle vermogens-/beleggingsprognoses met Box 3.

**Observatie.** De financiële planning roept voor ieder geprojecteerd jaar `calculateBox3Tax` aan met één vast `taxYear`. Dezelfde werking komt terug in scenario’s aflossen versus beleggen en annuïtair versus lineair. Een horizon van 20 of 30 jaar gebruikt daardoor effectief de 2026 vrijstelling, tarieven en methode in ieder toekomstjaar.

**Risico.** Dit is geen rekenfout in samengestelde rente, maar wel een fiscale aanname die de uitkomst substantieel kan kleuren. De Belastingdienst schrijft zelf dat de huidige Box 3-overbruggingswetgeving tijdelijk is; nieuwe wetgeving wordt waarschijnlijk per 1 januari 2028 verwacht. Zie [werkelijk rendement Box 3](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement).

**Besluit:** **P1.** Toon jaar 1 met actuele regels, en gebruik voor latere jaren één van: (a) geen fiscale aftrek in het eindvermogen, (b) een expliciet instelbare constante effectieve belastingdruk, of (c) versieerbare toekomstscenario’s. Zet prominent bij alle toekomstige belastingbedragen welke keuze geldt.

### F-03 — Hoog: vaste netto-rentefactor annuïtair/lineair is niet de centrale 2026-regel

**Betrokken tool:** `apps/annuitair-lineair/mortgageCalculator.js`.

**Observatie.** Deze tool gebruikt standaard `TAX_FACTOR_DEFAULT = 0.6303`; netto rente wordt `rente × 0,6303`. Dat impliceert een aftrek van 36,97%. De centrale fiscale laag kent voor 2026 maximaal 37,56%. Belangrijker: de daadwerkelijke aftrek is inkomens-, schuld- en woningspecifiek, niet een vaste maandfactor.

**Risico.** Een gebruiker ziet netto maandlasten en vervolgens een beleggingspot die direct van dit bedrag afhangt. Het effect stapelt dus door in de grafiek en eindpot. De afwijking in alleen het tarief is beperkt, maar de modelkeuze is structureel te grof voor een tool die juist netto verschillen communiceert.

**Besluit:** **P0.** Gebruik de centrale HRA-laag of laat het aftrekpercentage expliciet invullen met standaard ‘geen HRA’/‘maximaal 2026’. Voeg een zichtbare disclaimer toe: geen eigenwoningforfait, aflossingsvereiste, resterende aftrekduur of persoonsgebonden situatie.

### F-04 — Hoog: Q4-AFM-toetsrente is al gepubliceerd, maar nog niet in de dataset

**Betrokken tool:** `artifact-hypotheek-wonen-maximale-hypotheek`.

**Observatie.** Het bronregister bevat alleen ‘AFM-toetsrente Q3 2026’, effectief van 1 juli tot en met 30 september 2026. De ingeplande reviewdatum is al 15 september 2026 gepasseerd. De AFM heeft op 15 september inmiddels [de Q4-toetsrente gepubliceerd](https://www.afm.nl/nl-nl/sector/actueel/2026/sep/sb-toetsrente): **5%**. Dat is hetzelfde percentage als de bestaande Q3-waarde, maar de bronversie en geldigheidsperiode zijn wél anders.

**Risico.** Voor Q4 is de numerieke afwijking toevallig nul (beide kwartalen 5%), maar de rekenlaag werkt na 30 september met een verlopen bron. Bij een volgend kwartaal kan dat zonder codewijziging wél tot een substantieel afwijkende hypotheekruimte leiden. De financieringslasttabel zelf is jaargeldig, maar de toetsrente is dat niet.

**Besluit:** **P0 voor onderhoud.** Voeg Q4-dataset toe, laat de bestaande dataset automatisch vervallen en test op een datum buiten de geldigheid. Behoud altijd de uitleg dat een kredietverstrekker de definitieve toets uitvoert.

### F-05 — Hoog: 2027-voorstellen moeten productmatig gescheiden blijven van 2026-recht

**Betrokken tools:** `youngtimer-check`, `reiskostenvergoeding-check`, `pensioenplafond-check`, 2027-delen van `overdrachtsbelasting-check`, `eia-investeringsvoordeel` en `netto-inkomen-vergelijking`.

**Observatie.** De centrale dataset is zorgvuldig gemarkeerd als `proposed`/`future`, met een bron naar het wetsvoorstel Belastingplan 2027. Dat is goed. Een wetsvoorstel is echter geen geldend recht en kan tijdens behandeling wijzigen.

**Risico.** Een gebruikersuitkomst met jaartal 2027 kan als vast tarief worden gelezen, vooral als er een eurobedrag als ‘voordeel’ staat.

**Besluit:** **P1.** Zet boven elke 2027-uitkomst een vaste banner: ‘Voorstel, nog niet vastgesteld — geen geldend tarief’. Publiceer pas als standaardberekening wanneer publicatie/inwerkingtreding is vastgelegd. Hercontroleer uiterlijk 1 oktober 2026 en bij elke parlementaire wijziging.

### F-06 — Middel: HRA-laag is te smal voor labels als ‘netto hypotheeklast’

De centrale HRA-functie doet een transparante schatting: bruto rente maal de laagste van de marginale Box 1-schijf en het aftrekplafond. Zij neemt niet mee: aftrekbare eigenwoningschuld, annuïtaire/lineaire aflossing binnen 30 jaar, eigenwoningforfait, eerdere eigenwoningreserve, verdeling tussen partners, betalingsdatum of verlies aan aftrek bij laag inkomen. Gebruik daarom `indicatieve rentelast na aangenomen aftrek`, niet ‘jouw netto hypotheeklast’.

### F-07 — Middel: Box 1-brutolayer wordt terecht beperkt, maar valt stil terug naar 2026

`calculateBox1Tax` is correct afgebakend als bruto progressieve belasting vóór kortingen. De fallback `getFinancialConstants(onbekendJaar) → 2026` is daarentegen gevaarlijk bij een toekomstjaar: het systeem geeft geen fout of prominente waarschuwing. Kies voor niet-ondersteund jaar liever een foutmelding of expliciete ‘2026-technische fallback’ in het resultaat.

### F-08 — Middel: Zvw bij meerdere inkomensregels is volgordegevoelig

De Zvw-implementatie deelt één maximumbijdrage-inkomen sequentieel over invoerregels. Als bijvoorbeeld werkgeversbijdrage en zzp-inkomen samen boven de cap uitkomen, kan de invoervolgorde bepalen welk tarief de resterende grondslag krijgt. Controleer de officiële verrekenvolgorde of modelleer de inkomenssoorten expliciet. Voor één salaris, één uitkering of één zzp-inkomen is de implementatie helder en passend.

### F-09 — Middel: bronbeheer is inhoudelijk sterk maar de peildatum is verouderd

`SOURCE_DATA_REFERENCE_DATE` staat op 19 juli 2026; `docs/source-data-overview.md` rapporteert daarom ‘fresh’ vanuit die oude datum. Per auditdatum is de Q3-hypotheekrente bijna verlopen en het voorstelregister aan hercontrole toe. Laat de validatie standaard met de werkelijke datum draaien, of geef expliciet `asOf` mee vanuit CI/release. Het register mag niet door een historische peildatum groen blijven.

### F-10 — Laag: checksum ontbreekt bij hypotheek-financieringslasttabel

De bronvalidatie waarschuwt dat `mortgage-financing-load-2026` geen optionele checksum heeft. De datavorm wordt wel gevalideerd, maar een gekopieerde tabel kan zo nog een numerieke fout bevatten die structureel plausibel blijft. Voeg een hash van de bronextractie toe én golden tests op minstens vijf inkomen/rente-kruispunten uit de Staatscourant.

## 5. Tool-voor-tool audit

Legenda: **G** = voldoende als scenario; **O** = oriëntatie met duidelijke beperking; **P** = voorstel; **H** = aanpassen voor fiscale betrouwbaarheid.

### Wonen en hypotheek

| Tool | Oordeel | Wat klopt | Wat handmatig toetsen / beperking |
|---|---|---|---|
| `annuitair-lineair` | **H** | Annuïtaire en lineaire aflossing gebruiken de gebruikelijke maandrente- en aflossingsformule. De pot verwerkt positieve verschillen als inleg en latere negatieve verschillen als onttrekking. | F-03: vaste factor 0,6303 is niet de centrale 2026-HRA. F-01/F-02 gelden zodra Box 3/pot na belasting aanstaat. Controleer maand 1, maand 360 en eindschuld met een onafhankelijke spreadsheet. |
| `artifact-hypotheek-wonen-maximale-hypotheek` | **O** | Centrale financieringslasttabel 2026, LTV/NHG en energiegegevens zijn van primaire/gezaghebbende bronnen afgeleid. | F-04. Studieschuld-brutering, acceptatie inkomen, erfpacht, alimentatie, tijdelijk contract, ondernemersinkomen en lender policy blijven indicatief. Vergelijk met minimaal twee geldverstrekkers. |
| `hypotheek-aflossen-vs-beleggen` | **H** | Simuleert rente, extra aflossen en rendement inzichtelijk in jaartijdlijn. | HRA is benaderd; de investeringsroute gebruikt Box 3 ‘actual’ als belasting per jaar en herhaalt één belastingjaar. Geen boeterente, renteherziening, risicoprofiel, kosten of vermogensmix. |
| `hypotheekrenteaftrek-afschaffen` | **O** | Geeft precies de gekozen contra-feitelijke vraag weer: rente met en zonder een eenvoudige HRA-aanname. | Geen voorspelling van beleidsafschaffing en geen officiële netto-hypotheekberekening. Toets eigenwoningforfait, resterende 30 jaar en inkomen. |

### Vermogen, beleggen en Box 3

| Tool | Oordeel | Wat klopt | Wat handmatig toetsen / beperking |
|---|---|---|---|
| `box3-indicatie` | **H** | De forfaitaire 2026-route volgt vrijstelling, schuldendrempel, vermogensmix en voorlopige percentages correct. | F-01. Werkelijk rendement is alleen scenario totdat de voordeligheidsvergelijking en details zijn ingebouwd. Controleer categorieën: banktegoed versus overige bezitting. |
| `box-3-impact` | **H** | Maakt effect van vermogenssamenstelling begrijpelijk. | Dezelfde Box 3-beperking; toekomstige of periodieke inleg is geen officiële jaarlijkse aangifteberekening. |
| `prive-beleggen-eindvermogen` | **O/H met Box 3** | Samengestelde groei en maandelijkse inleg zijn scenarioformules. | Rendement, kosten, inflatie en belasting zijn aannames. Bij ‘na belasting’ F-01/F-02. Geen beleggingsadvies. |
| `fire-na-belasting` | **O/H met Box 3** | FIRE-doel als jaarlijkse uitgaven gedeeld door opnamepercentage is transparant als vuistregel. | Geen garantie op duurzame onttrekking. Pensioen, AOW, inflatie, kosten, sequence risk en toekomstige belastingwet zijn niet volledig gemodelleerd. |
| `jaarruimte-vs-vrij-beleggen` | **O/H met Box 3** | Vergelijkt zichtbaar pensioensparen met vrij vermogen. | Jaarruimte is persoonsgebonden; factor A, reserveringsruimte, jaarruimteformule, toekomstige tarieven en uitkeringsbelasting moeten per gebruiker geverifieerd worden. Box 3-route is scenario. |
| `studieschuld-vs-beleggen` | **O/H met Box 3** | Maakt rente, aflossen en alternatieve belegging vergelijkbaar. | DUO-contract/renteperiode en Box 3 moeten apart kloppen; geen waarde-oordeel zonder buffer en risico. |
| `volgende-euro` | **G/O** | Marginale scenarioberekening is nuttig om ‘waar gaat mijn volgende euro heen?’ te verkennen. | Noem aanbeveling geen fiscaal optimum; marginale belasting, buffer, toeslagen en persoonlijke doelen kunnen de uitkomst omkeren. |

### Inkomen, ondernemer en fiscale voordelen

| Tool | Oordeel | Wat klopt | Wat handmatig toetsen / beperking |
|---|---|---|---|
| `netto-inkomen-vergelijking` | **O (2026) / P (2027)** | Centrale 2026-schijven, kortingen en Zvw zijn in de relevante rekenlaag opgenomen. AOW-transitie wordt bewust geweigerd. | Geen complete loonstrook/aangifte: pensioen, lease, toeslagen, buitenlandse situatie, ondernemersaftrek en meerdere werkgevers zijn niet volledig. 2027 is voorstel en arbeidskorting heeft expliciete onzekerheidsband. |
| `zzp-uurtarief` | **O** | Goed als omzet-, reserverings- en tariefplanner. | Geen volledige winst-uit-onderneming-aangifte of netto-naar-bruto-inversie. Controleer zelfstandigenaftrek, mkb-winstvrijstelling, btw, kosten, arbeidsongeschiktheid, pensioen en Zvw. |
| `eia-investeringsvoordeel` | **O (2026) / P (2027)** | 2026-minimum, maximum en 40%-aftrek zijn correct als de investering op de Energielijst staat. | EIA is extra aftrek, geen directe cash-teruggave. Controleer Energielijst-code, meldingstermijn bij RVO, kwalificerende kosten, MIA-samenloop en onderneming. 2027 45,5% is voorstel. |
| `reiskostenvergoeding-check` | **P** | Rekent transparant met een gekozen kilometervergoeding. | Een 2027-voorstel is geen recht. Controleer ook arbeidscontract/cao en verschil tussen belastingvrije vergoeding en feitelijke vergoeding. |
| `pensioenplafond-check` | **P** | Maakt een beleidsoptie rond pensioengevend loon inzichtelijk. | Geen pensioen- of jaarruimteberekening en geen vastgesteld 2027-recht. |
| `youngtimer-check` | **P/H** | Rekenkern (35% bijtelling over waarde wanneer regime van toepassing is) is begrijpelijk uitgewerkt. | Jaarlijkse leeftijdsgrens/wetsvoorstel en privé-/zakelijkgebruik vereisen wettelijke bevestiging. Markeer als voorstel-scenario en laat gebruiker kenteken/data controleren. |

### Overdrachtsbelasting

| Tool | Oordeel | Wat klopt | Wat handmatig toetsen / beperking |
|---|---|---|---|
| `overdrachtsbelasting-check` | **O (2026) / P (2027)** | 2% eigen woning, 8% woning die niet als hoofdverblijf wordt gebruikt, 10,4% niet-woning en startersvrijstelling tot € 555.000 zijn binnen de gekozen eenvoudige route juist. | Startersvrijstelling vraagt onder meer leeftijd, hoofdverblijf en niet eerder benutten. Bij € 555.001 geldt niet gedeeltelijk maar het gehele 2%-tarief; test dat grensgeval. Erfpacht, aandelenoverdracht, samenloop en bijzondere situaties zijn bewust uitgesloten. |

### DUO en studiefinanciering

| Tool | Oordeel | Wat klopt | Wat handmatig toetsen / beperking |
|---|---|---|---|
| `duo-aanvullende-beurs` | **O** | Centrale 2026-regels, peiljaarlogica en studiedata zijn documenteerbaar opgeslagen. | Vergelijk met DUO bij gescheiden ouders, nieuwe partner, buitenlands inkomen, peiljaarverlegging en mbo/ho-variant. |
| `duo-extra-aflossen` | **O** | Rekent extra aflossing en rente-effect inzichtelijk. | Werkelijke schuld kan meerdere renteperiodes/regels hebben; DUO bepaalt maandbedrag en termijn. |
| `duo-leenbedrag-impact` | **O** | Gebruikt centrale leenlimieten/rentes voor een scenario. | Alleen werkelijk afgesloten termijnen en rentebesluiten zijn leidend. |
| `duo-maandbedrag` | **O** | Draagkracht en terugbetalingsregels zijn gescheiden van de rest van de site opgeslagen. | DUO kijkt normaliter naar inkomen van twee jaar eerder (peiljaar), met mogelijke peiljaarverlegging; partnerstudieschuld en specifieke regeling zijn bepalend. Vergelijk met DUO-rekenhulp. |
| `duo-schuld-bij-starten-lenen` | **O** | Projecteert lening en rente volgens invoer. | Bedragen, uitval/stoppen, rentevaste periode en daadwerkelijk leengedrag zijn scenario’s. |
| `duo-stoppen-kosten-prestatiebeurs` | **O** | Brengt gevolgen van stoppen als leerscenario in beeld. | Definitieve omzetting, diplomatermijnen, ziekte/overmacht en reisproductvoorwaarden altijd bij DUO verifiëren. |

## 6. Fiscale aannames die bewust níet volledig zijn

Dit zijn geen fouten zolang zij helder blijven, maar ze mogen niet impliciet als werkelijkheid worden behandeld.

1. **Persoonlijke belastingpositie.** Heffingskortingen hangen onder meer af van leeftijd, arbeidsinkomen, verzamelinkomen, partner, woonland en reeds ingehouden loonheffing. Een bruto Box 1-tarief is niet hetzelfde als marginale netto druk.
2. **AOW-jaar.** In het kalenderjaar waarin AOW ingaat veranderen premiedelen per maand. De inkomstenvergelijker weigert dit verstandig; andere tools die alleen standaard Box 1 gebruiken doen dat niet.
3. **Toeslagen.** Huur-, zorg-, kinderopvang- en kindgebonden budget zijn niet generiek meegenomen. Een extra euro inkomen kan daardoor een andere netto-impact hebben dan de tool toont.
4. **Ondernemerschap.** Winst, urencriterium, ondernemersaftrek, mkb-winstvrijstelling, btw, pensioen en Zvw vereisen meer invoer dan een uurtarief-tool vraagt.
5. **Eigen woning.** HRA is niet alleen ‘rente maal tarief’. De schuld en leningvorm moeten kwalificeren; ook eigenwoningforfait en eerdere woninghistorie tellen mee.
6. **Beleggen.** Nominaal rendement is geen verwacht rendement, kosten/risico/inflatie ontbreken vaak als afzonderlijke invoer en fiscale regimes kunnen wijzigen.
7. **Box 3-waardering.** Een bankrekening is niet hetzelfde als alle overige bezittingen. VvE-aandelen, contanten, groen sparen, onroerend goed, crypto, vorderingen en schulden hebben eigen regels of voorwaarden.
8. **Hypotheekacceptatie.** De wettelijke normen zijn een bovengrens in een standaardmodel; een aanbieder kan strenger zijn en eigen beleid toepassen.
9. **DUO.** De persoonlijke terugbetalingsregel en rente wordt niet uitsluitend bepaald door het kalenderjaar waarin iemand de tool opent.

## 7. Handmatige toetsset

Voer onderstaande set eerst in de site uit en vergelijk vervolgens de tussenwaarden met de genoemde officiële bron of onafhankelijke spreadsheet. Leg per testcase datum, URL, invoer, tussenwaarden, uitkomst en screenshot vast.

### 7.1 Box 1 en heffingskortingen

| Case | Invoer | Verwachting |
|---|---|---|
| B1-01 | Niet-AOW, belastbaar inkomen € 38.883, geen persoonlijke correcties | Bruto schijf 1: € 13.900,67. Marginaal 35,75%. Vergelijk vooral het grensbedrag en niet een afgeronde loonstrook. |
| B1-02 | Niet-AOW, € 78.426 | Schijf 1 volledig plus schijf 2 volledig; marginale druk 37,56%. |
| B1-03 | Niet-AOW, € 80.000 | Derde schijf alleen over € 1.574; marginale druk 49,50%. |
| B1-04 | Arbeidsinkomen € 45.592 | Arbeidskorting bereikt € 5.685 vóór afbouw; toets tegen de officiële 2026-tabel. |
| B1-05 | AOW-jaar | Verwacht: de inkomstenvergelijker weigert een schijnprecies jaartotaal. Andere netto claims moeten dit eveneens duidelijk beperken. |

Gebruik de [officiële 2026 tarieven- en kortingentabel](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen). Reken nooit de verschuldigde aangiftebelasting na door alleen bruto schijven van de site te vergelijken: heffingskortingen horen daar nog vanaf.

### 7.2 Zvw

| Case | Invoer | Verwachting |
|---|---|---|
| ZVW-01 | Zelfstandig inkomen € 10.000 | 4,85% = € 485. |
| ZVW-02 | Zelfstandig inkomen € 79.409 | 4,85% = € 3.851,34, vóór afrondingsconventie. |
| ZVW-03 | Werkgeversbijdrage € 79.409 | 6,10% = € 4.843,95, vóór afrondingsconventie. |
| ZVW-04 | Gemengd werkgevers- en zzp-inkomen boven de cap, invoervolgorde omdraaien | Resultaat mag niet willekeurig verschillen; als het wel verschilt is F-08 bevestigd. |

Vergelijk tarieven, bijdrageplicht en maximering met [Belastingdienst Zvw](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/).

### 7.3 Box 3 forfaitair 2026

| Case | Invoer | Te verifiëren tussenwaarden / verwachte belasting |
|---|---|---|
| B3-01 | Alleenstaand; € 100.000 banktegoed; geen schuld | Belastbare grondslag € 40.643. Fictief rendement € 1.280 × 40,643% = € 520,23. Belasting **€ 187,28**. |
| B3-02 | Alleenstaand; € 100.000 overige bezittingen; geen schuld | Belastbare grondslag € 40.643. Fictief rendement € 6.000 × 40,643% = € 2.438,58. Belasting **€ 877,89**. |
| B3-03 | Fiscale partners; € 118.714 vermogen | Geen belastbare grondslag, mits geen andere relevante componenten. |
| B3-04 | Schuld net onder/over € 3.800 (alleenstaand) | Onder drempel geen aftrekbare schuld; boven drempel alleen het meerdere. |
| B3-05 | Bank + belegging + schuld | Vergelijk stap voor stap: rendement per categorie, aftrekbare schuld, netto grondslag, vrijstelling en pro-rataverhouding. |

Deze bedragen volgen uit de [voorlopige Box 3-berekening 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026). Ze zijn geschikt als regressietests; neem er niet uit af dat de definitieve percentages al vaststaan.

### 7.4 Box 3 werkelijk rendement / tegenbewijs

| Case | Invoer | Gewenste productuitkomst na P0-correctie |
|---|---|---|
| WR-01 | Zelfde vermogen als B3-02, werkelijk rendement € 0 | Tool toont forfaitair, werkelijk en **laagste** belasting; motiveert welke informatie nodig is. |
| WR-02 | Werkelijk rendement hoger dan forfaitair | Tool toont dat tegenbewijs geen hogere belasting veroorzaakt; forfaitaire uitkomst blijft bepalend. |
| WR-03 | Negatieve waardemutatie aandelen/crypto | Tool accepteert negatieve waardeontwikkeling en geeft geen onjuiste nulclamp als officiële claim. |
| WR-04 | Tweede woning in eigen gebruik | Tool vraagt of toont de bijtelling eigen gebruik (economische huurwaarde of 5,06%-optie) of verklaart de uitkomst onvolledig. |

Vergelijk de inhoudelijke voorwaarden met [Wat is mijn werkelijk rendement?](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement).

### 7.5 Eigen woning en hypotheek

| Case | Invoer | Verwachting |
|---|---|---|
| HYP-01 | € 300.000, 4%, 30 jaar, annuïtair | Controleer bruto maandlast met een externe annuïteitenformule; eindschuld na 360 maanden is nul binnen afronding. |
| HYP-02 | Zelfde lening lineair | Aflossing elke maand € 833,33 vóór de laatste afronding; bruto last daalt. |
| HYP-03 | Annuïtair/lineair met HRA aan | Vergelijk factor 0,6303 met een 2026 maximumfactor 0,6244 en met ‘geen aftrek’; verschil moet zichtbaar zijn. |
| HYP-04 | Max-hypotheek vóór en na 1 oktober 2026 | App moet een geldige Q4-toetsrente gebruiken (gepubliceerd: 5%), geen Q3-dataset. |
| HYP-05 | HRA € 10.000 rente, inkomen boven € 78.426 | Eenvoudige bovenlimiet: € 3.756 voordeel bij 37,56%, maar markeer dat dit geen aangifte-uitkomst is. |

Gebruik de [Staatscourant-financieringslastpercentages 2026](https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html) voor normgevallen en [Belastingdienst eigen woning](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/tariefsaanpassing-eigen-woning) voor het aftrekplafond.

### 7.6 Overdrachtsbelasting en EIA

| Case | Invoer | Verwachting |
|---|---|---|
| OVB-01 | Starter, 28 jaar, hoofdverblijf, € 555.000, vrijstelling niet eerder benut | € 0 indien alle voorwaarden kloppen. |
| OVB-02 | Dezelfde starter, € 555.001 | Geen gedeeltelijke vrijstelling; 2% over volledige grondslag binnen het standaardscenario. |
| OVB-03 | Eigen woning zonder startersvrijstelling | 2%. |
| OVB-04 | Tweede woning / niet hoofdverblijf | 8% binnen de eenvoudige 2026-route. Voeg een aparte case toe voor bedrijfspand/bouwgrond: 10,4%. |
| EIA-01 | Kwalificerende investering € 2.500 | Extra aftrek € 1.000, geen directe teruggave van € 1.000. |
| EIA-02 | Investering niet op Energielijst of melding te laat | Tool mag geen harde EIA-toekenning suggereren. |

Zie [startersvrijstelling](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/) en [EIA](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/investeringsaftrek_en_desinvesteringsbijtelling/energie_investeringsaftrek_eia).

### 7.7 DUO

| Case | Invoer | Verwachting |
|---|---|---|
| DUO-01 | Standaard schuld, juiste SF15/SF35-regel en rentejaar | Maandbedrag vergelijkbaar met DUO-rekenhulp binnen dezelfde invoer en afronding. |
| DUO-02 | Inkomen daalt sterk na peiljaar | Tool wijst op peiljaarverlegging, geen automatische belofte van lager maandbedrag. |
| DUO-03 | Partner met eigen studieschuld | Tool laat zien of/hoe partnerschuld is verwerkt en verwijst naar DUO. |
| DUO-04 | Aanvullende beurs, gescheiden ouders of gewijzigde gezinssituatie | Geen harde uitkomst zonder de specifieke DUO-gegevens. |

DUO gebruikt voor draagkracht in beginsel inkomen van twee jaar geleden en biedt bij inkomensdaling peiljaarverlegging. Zie [berekening maandbedrag](https://www.duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp).

## 8. Release- en bronbeheerprotocol

Maak van de volgende controles een harde releasepoort voor iedere tool die eurobedragen of wettelijke regels toont.

1. **Bronverversing.** Neem de actuele datum als referentie, niet een vast historisch getal. Controleer alle items waarvan `nextReviewAt` binnen 30 dagen ligt.
2. **Statusgate.** `active` mag als huidige regel zichtbaar zijn; `future`/`proposed` uitsluitend met banner, bron, datum en geen taal als ‘je betaalt’ of ‘je voordeel is’.
3. **Geldigheidsgate.** Een dataset met `effectiveTo` vóór de build-/bezoekdatum mag de productie-uitkomst niet voeden zonder duidelijke blokkade.
4. **Golden cases.** Leg voor iedere centrale belastinglaag ten minste vijf broncases vast: nul, grens onder, grens op, grens boven en partner/gemengd geval.
5. **Snapshotbron.** Sla publicatiedatum, opgehaalde datum en checksum/archiefverwijzing op voor tabellen die uit een PDF of Staatscourant worden overgenomen.
6. **Tekstgate.** Elke uitkomst met fiscale impact moet één van deze labels hebben: ‘officiële 2026-parameter’, ‘indicatieve berekening’, ‘projectaanname’ of ‘wetsvoorstel’. Laat de UI deze bronstatus automatisch lezen uit dezelfde dataset die rekent.
7. **CI-runtime.** Pin Node en package manager. Laat `typecheck`, tests, bronvalidatie en procesvalidatie in één schone CI-run lopen.
8. **Visuele regressie.** Test per publieke tool: lege invoer, voorbeeldwaarden, grenswaarde, foutmelding, mobiel en print/download. Controleer vooral dat waarschuwingen boven de beslisconclusie zichtbaar blijven.

## 9. Aanbevolen backlog

| Volgorde | Werkpakket | Acceptatiecriterium |
|---:|---|---|
| P0-1 | Box 3 tegenbewijs-engine | Forfaitair en werkelijk worden samen berekend; de fiscale aanbeveling gebruikt de laagste uitkomst; onvolledige categorieën blokkeren een ‘officiële’ claim. |
| P0-2 | HRA-adapter voor hypotheektools | Geen losse standaardfactor meer in `annuitair-lineair`; test onder/midden/boven aftrekplafond plus geen recht op aftrek. |
| P0-3 | Q4 hypotheekdataset | Geldige AFM-toetsrente vanaf 1 oktober 2026; oude dataset kan niet ongemerkt na einddatum worden gebruikt. |
| P1-1 | Fiscaal tijdpad vermogensplanning | Iedere jaarregel toont wetjaar of scenario; na 2026/2027 geen stille fallback. |
| P1-2 | Inkomens-/Zvw-context | Zorg voor expliciete AOW-, partner-, meerdere-inkomens- en loonheffingsstatus; voeg gemengde Zvw-golden tests toe. |
| P1-3 | Voorstelmodus 2027 | Eén centraal UI-component voor voorstelbanner en automatisch uitsluiten van ‘huidige regel’-filters. |
| P1-4 | Broncontrole CI | Gepinde runtime, actuele peildatum en checksum voor normtabellen. |
| P2-1 | Persoonlijke belastingprofiel-input | Voeg eigenwoningforfait, aftrekduur, pensioengegevens, toeslagen-signalen en ondernemingsaftrekken alleen toe wanneer de vraag en broncoverage helder zijn. |
| P2-2 | Auditlog voor download | Een financiële planning-download bevat gebruikte versie, datum, bronstatus, invoer en aannames, zodat de gebruiker hem later kan herleiden. |

## 10. Conclusie

De architectuur is in de kern gezond: belangrijke 2026-parameters staan niet verspreid door de UI maar in centrale datasets; bronmetadata en toolprocessen bestaan; en de automatische testdekking is aanzienlijk. De audit bevestigt dat veel standaardwaarden — Box 1, heffingskortingen, Zvw, forfaitair Box 3, EIA en de simpele overdrachtsbelastingroute — inhoudelijk aansluiten op officiële 2026-bronnen.

De grens ligt bij **persoonlijke fiscale duiding**. De toolset moet niet doen alsof een scenario automatisch een aangifteberekening is. Dat geldt het sterkst voor werkelijk rendement in Box 3, voor ‘netto’ hypotheekuitkomsten en voor fiscale eurobedragen ver in de toekomst. Als P0-1 tot en met P0-3 zijn uitgevoerd en de waarschuwingen productmatig strak worden gemaakt, is de site overtuigend als transparante financiële planningssite. Zonder die punten is hij bruikbaar voor inzicht, maar niet betrouwbaar genoeg voor beslissingen die uitsluitend op fiscale netto-uitkomsten rusten.

## Bijlage A — gecontroleerde codepaden

- `src/lib/financial-constants/years.ts`
- `src/lib/financial-constants/source-datasets.ts`
- `src/lib/financial-constants/tax-proposals.ts`
- `src/lib/tax/box1.ts`
- `src/lib/tax/income-comparison.ts`
- `src/lib/tax/zvw.ts`
- `src/lib/tax/box3.ts`
- `src/lib/tax/mortgage-interest-deduction.ts`
- `src/lib/tax/property-transfer.ts`
- `src/lib/tax/eia.ts`
- `src/lib/tax/vehicles.ts`
- `src/lib/mortgage/max-mortgage.ts`
- `src/lib/financial-plan.ts`
- `apps/annuitair-lineair/logic.ts`
- `apps/annuitair-lineair/mortgageCalculator.js`
- `apps/hypotheek-aflossen-vs-beleggen/logic.ts`
- de logica en tests van de overige publieke tools uit de registry.

## Bijlage B — begrippen

- **Forfaitair rendement:** rendement berekend met vaste percentages per vermogenscategorie.
- **Werkelijk rendement / tegenbewijs:** daadwerkelijke inkomsten en waardeveranderingen; relevant wanneer dit lager is dan fictief rendement.
- **Heffingsvrij vermogen:** deel van het vermogen dat bij forfaitair Box 3 niet in de grondslag valt.
- **Marginaal tarief:** belastingpercentage over de volgende euro, niet het gemiddelde percentage over al het inkomen.
- **Zvw:** inkomensafhankelijke bijdrage Zorgverzekeringswet; de nominale zorgpremie valt hier buiten.
- **Peiljaar:** bij DUO doorgaans het inkomen van twee jaar eerder voor draagkracht.
