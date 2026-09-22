# Functionaliteit Status (SSOT)

Dit is de **single source of truth** voor functionele status in de app.

Het doel van dit bestand:

- vastleggen wat actief is;
- vastleggen wat bewust uit staat;
- vastleggen wat hidden/draft is;
- heractivatie voorspelbaar maken;
- per wijziging traceerbaar houden wat er aan/uit is gezet.

Standaardregel: als een tool, route of flow niet meer actief aangeroepen wordt in de zichtbare site, hoort die niet publiek zichtbaar te blijven. Houd de code dan wel in de codebase, maar zet de manifest- en route-exposure op `hidden-draft` of `uitgeschakeld` en leg de wijziging hier vast.

## Verplichte werkwijze voor agents

Bij **elke** functionele wijziging (nieuwe feature, flag-toggle, hidden/public wijziging, UX-pad aan/uit):

1. Update de statusmatrix hieronder.
2. Voeg een regel toe aan `Mutatielog (append-only)`.
3. Update `PROJECT.md` als architectuur/flow is veranderd.
4. Benoem in commit wat functioneel is toegevoegd, uitgezet of geheractiveerd.

Als een commit functionaliteit wijzigt maar dit bestand niet bijwerkt, is de wijziging niet afgerond.

## Statuswaarden

- `actief`: standaard zichtbaar/bruikbaar.
- `experimenteel`: beschikbaar, maar bewust beperkt of beta.
- `uitgeschakeld`: code aanwezig, functioneel uit via flag.
- `hidden-draft`: in code aanwezig, niet publiek in registry/dashboard.
- `voorbereid`: technische laag aanwezig, nog niet actief in gebruikersflow.

## Statusmatrix

| Onderdeel | Status | Schakelaar | Default | Opmerking | Heractivatie |
|---|---|---|---|---|---|
| Belastingtools 2027: youngtimer, reiskosten, pensioenplafond, overdrachtsbelasting, EIA en netto-inkomen | experimenteel | zes nieuwe `app.json`-manifests: `enabled: true`, `visibility: public`, `status: beta` | aan | Publieke voorstel-beta met centrale regels, exact centenrekenen, per-tool procesdocumentatie, bronversie en zichtbare beperkingen. Geen tool claimt fiscale productie-status. Zie `docs/belastingtools-2027-uitvoering.md` | Werk voorstellen na bij parlementaire wijzigingen; productie vereist onafhankelijke fiscale review |
| Startersplanner 2026–2029 | voorbereid | `src/lib/tax/entrepreneur.ts` | uit | Centrale conceptberekening en grens-/historietests; nog geen toolmanifest of gebruikersflow | Eerst aftrekhistorie en verliesverrekening afronden, daarna adapter en volledige checks |
| Toolbibliotheek + categorie-navigatie | actief | n.v.t. | aan | `/apps` toont 17 publieke tools, gegroepeerd rond inkomen, vermogen, ondernemen, wonen, vervoer, studie en lenen; hidden en uitgeschakelde tools blijven uitgesloten | n.v.t. |
| Financiële kennisbank (`/kennisbank`) | actief | n.v.t. | aan | Algemene uitleg over het lezen van financiële berekeningen, met bestaande verdieping over studieschuld | n.v.t. |
| Versie 1 publieke website | actief | route-oppervlak zonder `/v2` | aan | Enige publieke en actieve ontwerp-, UX-, performance- en optimalisatielijn; gekoppelde formulierkolommen en kaartinhoud blijven op gedeelde horizontale rijen uitgelijnd | n.v.t. |
| Versie 2 presentatie | uitgeschakeld | private routecode onder `src/app/_v2-paused` | uit | Code behouden als gepauzeerde bron, maar geen publieke routes, navigatie, sitemap, SEO-output, dashboard, journey of livegangoppervlak | alleen heractiveren via expliciet scopebesluit + blueprint-/releasecheck |
| Publieke calculators (app-registry) | actief | `enabled: true` + `visibility: "public"` | aan | 17 publieke tools in de huidige registry; disabled tools tellen niet mee | n.v.t. |
| Draft tools (concept) | hidden-draft | `enabled: true` + `visibility: "hidden"` | uit | Alle tools en flows die niet meer actief aangeroepen worden blijven hier verborgen totdat er expliciet heractivatie is | zet manifest op `public` + checks draaien |
| Disabled tools | uitgeschakeld | `enabled: false` | uit | Manifestgestuurde technische uitschakeling; tool komt niet in registry, routes, dashboard, lazy bundle of publieke lijsten | zet `enabled` op `true`, genereer registry opnieuw en draai checks |
| Studieschuld-vs-beleggen | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; code behouden voor mogelijke latere heractivatie | alleen heractiveren met nieuwe productbeslissing + copycheck |
| Volgende euro | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; route niet meer gelinkt vanuit publieke UI | alleen heractiveren met nieuwe productbeslissing + copycheck |
| DUO-doorlenen-of-stoppen | hidden-draft | `visibility: "hidden"` | uit | Stopscenario-tool technisch aanwezig, maar niet in huidige publieke registry | zet manifest op `public` + volledige blueprint-check |
| Gerichte DUO-leenfase-resultaten | actief | gedeelde `FocusedDuoTool` + centrale studieschuldscenario’s | aan | De start-lenentool kiest de berekeningsmaand met een slider en maandknoppen, toont centrale normen en houdt correcties expliciet. Optionele studiebedragen staan standaard gesloten. Bij een verwachte eindschuld staat direct het totale bedrag inclusief rente bij regulier aflossen binnen 35 jaar. De drie gerichte tools gebruiken een korte taakgerichte PDF met dezelfde geldige view, bedragen en begrijpelijke bestandsnaam | n.v.t. |
| DUO-leenbedrag-impact | experimenteel | `visibility: "public"` | aan | Eenvoudige leenfase-tool met centrale DUO-maandlimiet; het hoofdresultaat toont zowel extra schuld door het maandbedrag als de verwachte totale schuld bij diploma | n.v.t. |
| DUO-stoppen-kosten-prestatiebeurs | experimenteel | `visibility: "public"` | aan | Eenvoudige tool voor prestatiebeursbedragen die schuld blijven bij stoppen zonder diploma, met een taakgerichte resultaat-PDF | n.v.t. |
| DUO-maandbedrag | experimenteel | `visibility: "public"` | aan | Kernflow vraagt alleen schuld, terugbetaalduur en rentepercentage; leningdelen en inkomen staan standaard gesloten. Het hoofdresultaat toont eerst de wettelijke maandtermijn en alleen bij inkomensinvoer ook het indicatieve lagere bedrag. De hypotheekverdieping gebruikt gewone taal, herstelt resultaatfocus en de PDF bewaakt paginagrenzen | n.v.t. |
| DUO-extra-aflossen | experimenteel | `visibility: "public"` | aan | Kernflow houdt huidige termijn en leningdelen optioneel; hoofdresultaat toont nieuwe maandtermijn, maanden eerder schuldenvrij en rentebesparing. De PDF gebruikt dezelfde view en bewaakt paginagrenzen | n.v.t. |
| DUO-aanvullende-beurs | experimenteel | `visibility: "public"` | aan | Publieke 2026-tool bovenop `src/lib/duo/additional-grant`; berekent reguliere aanvullende-beursindicatie en toont bij bijzondere oudersituaties geen schijnbedrag of technische waarschuwingen maar drie concrete stappen om gebruikte ouder- en inkomensgegevens in Mijn DUO te controleren; nog geen PDF | n.v.t. |
| Box 3-impact | experimenteel | `visibility: "public"` | aan | Voorlopige forfaitaire 2026-berekening met centrale vrijstelling, schuldendrempel, vermogenscategorieën en een expliciet 2026-scenario over de horizon | n.v.t. |
| Jaarruimte versus vrij beleggen | experimenteel | `visibility: "public"` | aan | Neutrale vergelijking met hetzelfde netto budget; gebruiker vult zelf de officiële jaarruimte in en de optionele Box 3-projectie hergebruikt zichtbaar de voorlopige 2026-regels | n.v.t. |
| ZZP-uurtarief | experimenteel | `visibility: "public"` | aan | Tariefplanner exclusief btw met declarabele uren, kosten en expliciet door de gebruiker gekozen reserveringen; geen belastingaangifteberekening | n.v.t. |
| Centrale tax/DUO/pension/constants lagen | actief | n.v.t. | aan | Hergebruikt door meerdere tools | n.v.t. |
| Submit-driven calculatorflow | actief | `useMobileFieldFlow` + `MobileFieldFlowControls` + `CalculationResultActions` | aan | Alle 17 publieke calculators tonen mobiel één relevante vraag per stap met conditionele voortgang, gerichte Enter-afhandeling en resultaatfocus. Optionele verdiepingen tellen niet als lege vraag | n.v.t. |
| Publieke technische procesgids | uitgeschakeld | procesdocumentatie blijft in `apps/*/PROCESS.md` | uit | Interne processtappen, reason codes en technische overdrachtstermen worden niet meer onder publieke toolpagina’s gerenderd; procesvalidatie en documentatie blijven intern volledig actief | alleen publiek maken na een afzonderlijk contentontwerp in gewone gebruikerstaal |
| Volgende-stap navigatie tussen publieke tools | actief | `ToolNextSteps` + journey-map | aan | Compacte vervolgstap per publieke tool, afgestemd op de meest waarschijnlijke vervolgvraag | n.v.t. |
| Maximale hypotheek | actief | `apps/artifact-hypotheek-wonen-maximale-hypotheek/app.json -> enabled: true` | aan | Publieke indicatieve tool met centrale hypotheekengine, PDF, transferflow, brondata, NHG, woningwaarde en studieschuld. Zichtbaar onder Wonen & vervoer. | Actualiseer brondata vóór afloop van de relevante geldigheidstermijn en voer volledige releasechecks uit |
| DUO-impact in maximale-hypotheektool | actief | centrale DUO-impact via maximale hypotheek | aan | De tool toont dezelfde centrale DUO-impact en berekeningsopbouw als de bewaarde implementatie. | n.v.t. |
| Hypotheekrentelink en salarisverhogingsanalyse | actief | centrale linkconfig + salarisadapter | aan | De uitgebreide tool bevat de rentelink en salarisverhogingsanalyse; de centrale hypotheekengine blijft de bron van rekenwaarheid. | n.v.t. |
| Familiehulp eerste woning | uitgeschakeld | `apps/familiehulp-eerste-woning/app.json -> enabled: false` | uit | Bewust buiten eerste-livegangscope; code blijft bestaan, maar publieke registry, routes, dashboard, zoekresultaten, lazy loading en journey-links sluiten de tool uit | zet alleen na scopebesluit `enabled: true` en draai volledige blueprint-/releasechecks |
| Hypotheek Regulations-integratieadapter | voorbereid | centrale adapter | uit in UI | Centrale adapterlaag voor hypotheektools richting Regulations-architectuur; nog niet gekoppeld aan calculators en wijzigt geen publieke uitkomsten | koppel per tool pas na UX/PDF- en regressiecontrole |
| Hypotheekimpact studieschuld | actief als DUO-verdieping | `duo-maandbedrag` resultaat + pure hypotheekadapter | aan binnen DUO-resultaat | De losse tool blijft technisch uitgeschakeld. De verdieping hergebruikt bekende DUO-data, vraagt alleen bruto inkomen bij, verplaatst focus naar de nieuwe uitkomst en legt de hypotheekomrekening eerst in gewone taal uit; brutering staat alleen als secundaire technische term | zet het losse manifest alleen na expliciet productbesluit en volledige blueprintcheck weer aan |
| DUO-maandbedrag-returnflow naar hypotheektools | voorbereid | sessionStorage-transfer | uit in publieke UI | De compatibele transfercode blijft behouden voor een eventuele toekomstige zelfstandige hypotheektool, maar geen publieke route start of ontvangt deze flow | heractiveert alleen samen met een expliciet geactiveerde hypotheektool |
| Centrale toeslagen-hard-checks | actief | n.v.t. | aan in centrale laag | `evaluateAllowanceSignals` en de officiële calculation engines blijven beschikbaar en getest, maar hebben tijdelijk geen publieke Toeslagenscan-route | 2027-dataset vereist vóór publiek gebruik in 2027 |
| Toeslagenscan publieke beta | uitgeschakeld | `apps/toeslagen-scan/app.json -> enabled: false` | uit | Broncode en centrale allowances-engines blijven behouden; registry, route, dashboard, categorie-navigatie, journey-links en lazy loading sluiten de tool uit | zet alleen na expliciet publicatiebesluit `enabled: true` en draai volledige blueprint-, brondata- en releasechecks |
| Vergelijk mijn schulden | uitgeschakeld | `apps/schulden-volgorde/app.json -> enabled: false` | uit | Toolcode, centrale prioriteringslogica en configuratie blijven behouden; registry, route, dashboard, kennislinks, journeys, profielaanbevelingen en lazy loading sluiten de tool uit | zet `enabled` op `true`, draai `generate:apps` en `process:update -- --tool schulden-volgorde --reviewed`, en voer de volledige blueprint-/releasechecks uit |
| Doorstap vanaf DUO-doorlenen-of-stoppen | actief | n.v.t. | aan | Resultaat toont scenariovergelijking, schuldenvrije datum en uitgebreide PDF | n.v.t. |
| Chart-standaardisatie (jaar/euro/tooltips/tabellen) | actief | n.v.t. | aan | Centrale charthelpers en resultaatcomponenten tonen alleen relevante tijdlijnen, vergelijkingen en bedragopbouw; iedere publieke grafiek heeft direct eronder een standaard gesloten tabel met dezelfde exacte waarden | n.v.t. |
| Profielfunctie (`/profiel`, prefillpad) | actief | `NEXT_PUBLIC_ENABLE_PROFILE` | `true` | Compact profiel voor inkomen, studieschuld en wonen, met stelselafhankelijke DUO-rentejaarkeuze en optionele ingeklapte leningdelen; vult alleen passende velden vooraf in en laat DUO-maandbedrag en hypotheekimpact hun actuele uitkomsten na een expliciete gebruikersactie terugschrijven | zet op `0` voor nooduitschakeling |
| Tijdelijke overdracht tussen vervolgtools | actief | sessionStorage-handoff | aan | Ondersteunde vervolgstappen dragen alleen semantisch passende profielvelden eenmalig over; bronwaarden hebben voorrang op profieldefaults en de doeltool toont welke waarden zijn overgenomen zonder het profiel te wijzigen | n.v.t. |
| Kennisniveaufunctionaliteit | uitgeschakeld | `NEXT_PUBLIC_ENABLE_KNOWLEDGE_LEVEL` | `false` | Bewust niet zichtbaar in productieflow | zet op `1` en valideer homepage/toolhints |
| Handmatige profielsync-panel | uitgeschakeld | `NEXT_PUBLIC_ENABLE_PROFILE_SYNC_PANEL` | `false` | Alleen zinvol in hybrid/remote traject | zet op `1` en valideer `/profiel` |
| Saved calculations MVP (opslaan/lijst/heropen) | uitgeschakeld | `NEXT_PUBLIC_ENABLE_SAVED_CALCULATIONS` | `false` | Feature-flagged local-first MVP | zet op `true` en valideer `volgende-euro` + `/profiel` |
| Profile storage mode: `local` | actief | `NEXT_PUBLIC_PROFILE_STORAGE_MODE` | `local` | Huidige runtime-opslag | n.v.t. |
| Bewaartermijn browserprofiel | actief | keuze op `/profiel` | `session` | Nieuwe profielen blijven standaard alleen tijdens de browsersessie; expliciete keuze voor opslag op hetzelfde apparaat migreert dezelfde gevalideerde data en verwijdert de oude kopie | n.v.t. |
| Profile storage mode: `hybrid`/`remote` | voorbereid | `NEXT_PUBLIC_PROFILE_STORAGE_MODE` | `local` | Fallback/no-op zonder remote activering | latere database/auth activatiestap nodig |
| Supabase/auth/session-contract | voorbereid | env/config | uit | Client-safe voorbereiding zonder verplichte login | alleen activeren met aparte rollout |
| Juridische informatie (`/privacy`, `/voorwaarden`) | actief | publieke statische routes + footerlinks | aan | Beschrijft local-first gegevensverwerking, indicatieve uitkomsten en scheiding tussen AGPL-software, gereserveerd merk/content en officiële brondata | actualiseer vóór nieuwe gegevensverwerking of licentiewijziging |
| Cloudflare Pages + eigen domein | voorbereid | toekomstige hostingmigratie | uit | Roadmap voor securityheaders, DNS, caching en rollback; activeert geen analytics of remote opslag | aparte DevOps-, privacy- en releasecontrole |

## Mutatielog (append-only)

| Datum | Commit | Wijziging | Impact |
|---|---|---|---|
| 2026-09-22 | `pending` | Eindvermogen-tool met beleggen gecontroleerd, gedocumenteerd en als publieke beta geactiveerd; gebruikt centrale box 3-logica en toont scenario-aannames. | Beleggen / vermogen / registry / publicatie |
| 2026-09-21 | `pending` | Uitgebreide Maximale-hypotheektool opnieuw publiek gemaakt met centrale hypotheekengine, actuele 2026-brondata, PDF, DUO-overdracht, rentelink en salarisverkenner. | Hypotheek / registry / navigatie / profiel / publicatie |
| 2026-09-21 | `pending` | Zes Belastingplan 2027-tools na architectuur-, bron-, unit-, browser- en responsive checks publiek als voorstel-beta gezet. Homepage, overzicht, kennisbank, over-pagina en footer maken Grip breed financieel in plaats van DUO-gericht. Toeslagenscan blijft uitgeschakeld. | Financiële tools / belasting / navigatie / publicatie / UX |
| 2026-09-20 | `pending` | Zes verborgen Belastingtools 2027-concepten, centrale voorstelregels en reken-/adaptertests voorbereid; startersrekenlaag zonder gebruikersflow. Publieke tools en Toeslagenscan-status ongewijzigd. Opdracht nog niet afgerond; geen publicatie | Belasting / conceptontwikkeling / bronvalidatie |
| 2026-09-18 | `pending` | Box 3-impact, Jaarruimte versus vrij beleggen en ZZP-uurtarief gecontroleerd publiek gemaakt; Box 3-schuldendrempel en 2026-bronnen toegevoegd, niet-officiële eindverkoopheffing en adviesscores verwijderd, homepage en toolgroepen verbreed; Toeslagenscan blijft uitgeschakeld | Belasting / vermogen / ZZP / registry / bronnen / hosting |
| 2026-08-11 | `pending` | Betekenisvolle resultaatgrafieken toegevoegd voor schuldverloop, extra aflossen, schuldopbouw bij stoppen, aanvullende beurs en hypotheekimpact; iedere grafiek gebruikt bestaande centrale resultaatdata en krijgt direct eronder een uitklapbare exacte tabel | Publieke DUO-tools / resultaten / charting / toegankelijkheid / responsive UX |
| 2026-08-11 | `pending` | Negen UX-auditpunten uitgevoerd: publieke procesgids verwijderd, mobiele actie sticky gemaakt, optionele velden uit de vraagstappen gehaald, resultaten en bijzondere oudersituaties verduidelijkt, taakgerichte PDF-pariteit hersteld en navigatie, kaarten en calculatorbreakpoints responsief aangescherpt; de gevraagde plausibiliteitsgrens voor studiemaanden is bewust niet uitgevoerd | Publieke tools / mobiel / resultaten / PDF / copy / responsive UX / toegankelijkheid |
| 2026-08-11 | `pending` | Hypotheekimpact studieschuld verplaatst van een zelfstandige publieke tool naar een standaard gesloten verdieping onder het DUO-maandbedragresultaat; bekende DUO-data wordt hergebruikt en dezelfde bestaande hypotheek-use-case levert vergelijking, brutering en uitleg | DUO / hypotheek / registry / routes / progressive disclosure |
| 2026-08-11 | `pending` | Schuldenvergelijker tijdelijk technisch uitgeschakeld; publieke registry, route, dashboard-, kennis-, journey- en profielverwijzingen worden via manifestfilters uitgesloten terwijl toolcode en centrale schuldprioritering behouden blijven | Schulden / registry / routes / navigatie |
| 2026-08-11 | `pending` | De zeven huidige publieke calculators en de inmiddels uitgeschakelde schuldenvergelijker omgezet naar één centrale mobiele vraagflow met conditionele voortgang, Enter-validatie, focus- en scrollherstel, safe-area-actiebalk, expliciete resultaatactie en bevestigde herstart; desktopformulieren en alle rekenuitkomsten blijven inhoudelijk gelijk | Publieke calculators / mobiel / formulieren / toegankelijkheid / UX |
| 2026-08-11 | `pending` | Maximale-hypotheektool tijdelijk technisch uitgeschakeld; publieke registry, route, dashboard-, homepage-, journey- en profielverwijzingen worden via de manifestfilters uitgesloten terwijl toolcode en centrale hypotheeklogica behouden blijven | Maximale hypotheek / registry / routes / navigatie |
| 2026-08-11 | `pending` | Toeslagenscan tijdelijk technisch uitgeschakeld; publieke registry, route, dashboardgroep en journey-link verwijderd terwijl centrale reken- en bronlagen behouden blijven | Toeslagen / registry / routes / navigatie |
| 2026-08-01 | `pending` | Berekeningsmaandslider afgerond met vorige- en volgendemaandbediening, centrale maandnormen, zichtbare normovergang en expliciete correctie van te hoge invoer zonder stille overschrijving | DUO / studiefinanciering / formulier-UX / toegankelijkheid |
| 2026-08-01 | `pending` | Start-lenentool uitgebreid met maand/jaar-slider, overneembare thuis- en uitwonende basisbeurs, uitlegkoppeling naar de centrale aanvullende-beurscalculator en centraal afgeleide resterende leenruimte | DUO / studiefinanciering / formulier-UX / validatie / toolkoppeling |
| 2026-07-31 | `pending` | Regulier collegegeldkrediet wordt centraal afgeleid als jaarlijks wettelijk collegegeld gedeeld door 12; de officiële 2026-maandwaarde van het studentenreisproduct telt in het maximumscenario als prestatiebeurs mee zolang deze niet in een gift is omgezet | DUO / brondata / collegegeldkrediet / reisproduct / scenario’s |
| 2026-07-31 | `pending` | De drie gerichte DUO-opbouwtools tonen na een expliciete knopdruk de indicatieve hypotheekimpact van de berekende eindschuld, via de centrale SF35-maandtermijn met de nieuwste beschikbare DUO-rente en de bestaande centrale hypotheekomrekening | DUO / studieschuld / hypotheekimpact / resultaten / UX |
| 2026-07-31 | `pending` | Direct DUO-scenario toegevoegd voor maximale hbo/wo-studiefinanciering tot de gekozen stopmaand zonder diploma, maandinvoer op hele stappen gezet en de maximale-hypotheeksamenvatting uitgebreid met compacte grensblokken en de centrale toetsrente-kans op extra leenruimte | DUO / hypotheek / scenario’s / resultaten / invoer-UX / responsive UX |
| 2026-07-31 | `pending` | Maandelijkse lening, collegegeldkrediet, basisbeurs en aanvullende beurs in de gerichte DUO-tools hard begrensd met de centrale periodegebonden 2026-normen; ieder maximum staat kort rechts bij het veld en wordt responsief zonder overlap getoond | DUO / brondata / validatie / formulieren / responsive UX |
| 2026-07-31 | `pending` | Horizontale uitlijning aangescherpt voor profiel- en aanvullende-beursvelden, toolkaarttitels en resultaatkaartlabels; geometrische regressiecontrole toegevoegd voor publieke routes en relevante rijen | V1 / formulieren / kaarten / responsive UX / toegankelijkheid |
| 2026-07-31 | `pending` | De laatste twee v1-releaseblokkers opgelost: de publieke link naar een verborgen tool verwijderd en de aanvullende-beursinvoer per ouder gegroepeerd met containerveilige responsieve velden | V1-livegang / routing / aanvullende beurs / responsive UX / toegankelijkheid |
| 2026-07-28 | `pending` | Maximale-hypotheekuitkomst uitgebreid met een standaard ingeklapte, stapsgewijze berekeningsopbouw die de DUO-impact en alle geldende eindgrenzen vanuit dezelfde centrale rapportdata toont | Maximale hypotheek / studieschuld / resultaten / UX / PDF |
| 2026-07-28 | `pending` | Softwarelicentie `AGPL-3.0-or-later`, merk- en contentscheiding, securitybeleid, publieke privacyverklaring en gebruiksvoorwaarden toegevoegd; Cloudflare Pages en eigen domein als toekomstige gecontroleerde hostingstap vastgelegd | Juridisch / privacy / security / routing / hosting |
| 2026-07-28 | `pending` | Centrale tijdelijke vervolgtool-overdracht toegevoegd voor DUO-maandbedrag, extra aflossen, hypotheekimpact en maximale hypotheek, inclusief expliciete voorrang boven profielwaarden en tekstuele toelichting op de doeltool | Tooljourneys / profiel / DUO / hypotheek / UX |
| 2026-07-28 | `pending` | Vrij DUO-renteveld in het browserprofiel vervangen door een stelselafhankelijke keuze uit centraal beheerde rentejaren en percentages; het gekozen rentejaar wordt expliciet bewaard en hergebruikt | Profiel / DUO / brondata / UX |
| 2026-07-28 | `pending` | Browserprofiel uitgebreid met optionele DUO-leningdelen, afzonderlijk hypotheektoetsbedrag en expliciete opslag van actuele DUO- en hypotheekimpactuitkomsten | Profiel / DUO / hypotheek / UX |
| 2026-07-28 | `pending` | Browserprofiel geactiveerd met sessieopslag als standaard, expliciete apparaatopslag, toegankelijke compacte profielinvoer en allowlisted automatische prefill voor vier publieke DUO- en hypotheektools | Profiel / privacy / DUO / hypotheek / UX |
| 2026-07-28 | `pending` | Verwachte eindschuld in de gerichte DUO-leenfasetool direct aangevuld met het totale terug te betalen bedrag inclusief rente bij regulier aflossen; dezelfde centrale `totalPaid`-uitkomst staat aansluitend in de PDF | DUO / studieschuld / resultaten / PDF |
| 2026-07-27 | `pending` | Publieke calculators starten zonder persoonlijke voorbeeldbedragen, markeren voorbeelden en indicaties consequent, geven korte veldhulp bij moeilijke begrippen en blokkeren onbekende DUO-regelingen vóór berekening | UX / toegankelijkheid / unknown resolution / DUO-veiligheid |
| 2026-07-27 | `pending` | Resterende categorie A/B-vereenvoudigingen uitgevoerd: alle publieke tools direct zichtbaar, optionele woningdoelvelden conditioneel, bijzondere DUO-oudersituaties taakgericht uitgelegd en toeslagbedragen per regeling geblokkeerd bij onopgeloste noodzakelijke invoer | UX / DUO / hypotheek / toeslagenveiligheid |
| 2026-07-26 | `pending` | Versie 2 publiek gepauzeerd; v1 is de enige actieve ontwerp- en livegangversie, v2-routecode blijft alleen als private broncode bestaan | Architectuur / routing / livegangscope |
| 2026-07-24 | `pending` | Manifestgestuurde `enabled`-laag toegevoegd voor tools; alle manifests hebben expliciet `enabled`, en `familiehulp-eerste-woning` is centraal uitgeschakeld voor de eerste livegang | Architectuur / registry / routes |
| 2026-07-24 | `pending` | Kinderopvangtoeslag is voor ondersteunde standaardscenario's bedraggevend aangesloten op een centrale 2026-engine met LRK/eigen-bijdrage/activiteit-blockers, officiële uurtarief- en urencaps en regressietests tegen officiële voorbeelden | Toeslagen / publieke beta / kinderopvangtoeslag |
| 2026-07-24 | `pending` | DUO-maandbedrag-returnflow uitgebreid naar maximale-hypotheektool, inclusief sessieherstel, automatisch invullen van wettelijk DUO-maandbedrag en uitleg over banktoetsing versus actuele DUO-incasso | Hypotheek / DUO / toolkoppeling |
| 2026-07-21 | `pending` | Huurtoeslag en kindgebonden budget publiek geïntegreerd in de Toeslagenscan via centrale adapters bovenop `calculateRentBenefit2026` en `calculateChildBudget2026`; kinderopvangtoeslag blijft zonder totaalbedrag | Toeslagen / publieke beta / bedragindicatie |
| 2026-07-21 | `pending` | Compacte volgende-stap navigatie toegevoegd op alle publieke tools via een centrale journey-map en `ToolNextSteps`-component | UX / conversie / publieke tools |
| 2026-07-20 | `pending` | Centrale hypotheekadapter richting Regulations-architectuur toegevoegd met inventarisatie, definitions, answer mapping, evaluation/recommendation/estimate-context en regressietests; niet gekoppeld aan publieke UI | Hypotheek / Regulations / voorbereid |
| 2026-07-21 | `pending` | Publieke `duo-aanvullende-beurs` calculator toegevoegd bovenop de centrale aanvullende-beursengine, met manifest, dashboardregistratie, formulieradapter, resultaatweergave en regressietests | DUO / aanvullende beurs / publieke beta |
| 2026-07-20 | `pending` | Release-reviewbevindingen Toeslagenscan verwerkt: publieke statuscopy afgestemd op zorgtoeslag-bedragindicatie, machinecodes vervangen door Nederlandse labels, reportmodel gevuld vanuit relevante invoer en `evaluateAllowanceSignals` expliciet vastgelegd als centrale hard-checklaag | Toeslagen / releasefix / publieke beta |
| 2026-07-19 | `pending` | Toeslagenscan gecontroleerd geactiveerd als publieke beta-tool; 10 publieke tools, destijds zonder publieke bedragindicatie/PDF/opslag/backend/analytics | Toeslagen / publieke beta / registry |
| 2026-07-20 | `pending` | Toeslagenscan gebruikt de centrale Regulation Question Flow voor voortgang, vervolgvraag en inferred/skipped/not-applicable-statussen zonder publieke signaleringsuitkomsten of berekeningen te wijzigen | Toeslagen / question flow / publieke beta |
| 2026-07-19 | `pending` | Eerste hidden-draft toeslagenscan toegevoegd op basis van centrale allowances-signalering; geen bedragen, geen PDF, geen opslag en niet publiek zichtbaar | Toeslagen / hidden draft / UI |
| 2026-07-19 | `pending` | Veilige DUO-maandbedrag-returnflow toegevoegd tussen hypotheek-impact en DUO-maandbedrag via allowlisted sessionStorage-transfer en expliciete gebruikerbevestiging | DUO / studieschuld / hypotheek-impact |
| 2026-07-19 | `pending` | Centrale 2026 toeslagen-hard-checks toegevoegd voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag; bedraglogica bleef toen nog buiten de publieke UI | Toeslagen / domeinlaag / brondata |
| 2026-07-19 | `pending` | Externe hypotheekrentelink toegevoegd bij publieke rentevelden en salarisverhogingsanalyse geïntegreerd in maximale-hypotheekflow via centrale hypotheekengine | Maximale hypotheek / hypotheekrente / salaris |
| 2026-07-18 | `pending` | Calculatorarchitectuur en blueprint-check gedocumenteerd; statusmatrix afgestemd op huidige publieke registry zonder manifestwijzigingen | Architectuur / statusdocumentatie |
| 2026-07-13 | `pending` | DUO-maandbedrag en DUO-extra-aflossen krijgen uitgebreide PDF-overzichten vanuit dezelfde centrale DUO-rekendata | DUO / studieschuld / PDF |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen omgebouwd naar stopscenario-tool met prestatiebeurs, diplomatermijn, schuldenvrij-datum en uitgebreide PDF-export | DUO / studieschuld / scenario's |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen hypotheekhint opgeschoond: irrelevante copy vervangen door relevante hypotheekvoorwaarden | DUO / studieschuld / copy |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen toont directe vervolgstap naar hypotheekimpact en maximale hypotheek | DUO / studieschuld / woonroute |
| 2026-07-13 | `cc39fb9` | DUO-renteselectie op laatste 5 jaar, debt-parts editor en hypotheek-prefill op historisch DUO-rentejaar toegevoegd | DUO / studieschuld / hypotheek-impact |
| 2026-07-05 | `pending` | Nieuwe publieke beta-tool `DUO doorlenen of stoppen` toegevoegd met centrale leenfaseprojectie | DUO / studieschuld / leenfase |
| 2026-07-05 | `pending` | Site herpositioneerd naar “studieschuld begrijpen” met drie fases: opbouw, maandbedrag, wonen | Homepage / kennisbank / navigatie |
| 2026-07-05 | `pending` | Nieuwe publieke beta-tools `duo-maandbedrag` en `duo-extra-aflossen` toegevoegd | DUO / studieschuld / terugbetalen |
| 2026-07-05 | `pending` | `studieschuld-vs-beleggen` en `volgende-euro` verborgen gehouden; links uit zichtbare UI verwijderd | Toolzichtbaarheid / positionering |
| 2026-06-14 | `pending` | DUO-impact centraal berekend en rechtsboven in de maximale-hypotheekuitkomst geplaatst | Maximale hypotheek / studieschuld |
| 2026-06-13 | `pending` | Mobiele calculatorflow, invoersemantiek en projectbrede UX-richtlijnen aangescherpt | Publieke calculatorflow en toegankelijkheid |
| 2026-05-28 | `36c6b0e` | Saved scenario’s direct heropenen in oorspronkelijke tool toegevoegd (deep-linkflow) | Saved calculations MVP |
| 2026-05-28 | `pending` | Financiële kennisbankpagina + centrale kennislaag toegevoegd | Kennislaag / navigatie |
| 2026-05-28 | `85d5864` | Nieuwe doelgroeptools live gezet + glossary-dekking verbreed | Toolzichtbaarheid + copy |
| 2026-05-27 | `9075395` | “Mijn opgeslagen scenario’s” op profielpagina toegevoegd | Saved calculations MVP |
| 2026-05-27 | `ec9f015` t/m `8857ac8` | Profile sync policy/orchestrator/events/documentatie voorbereid | Profile storage voorbereiding |

## Open functionele punten

- Zes overige Belastingtools 2027 (wijzigingsscan, startersplanner-flow, auto-TCO, zorgkosten, startupopties en vliegbelasting) blijven buiten de publieke scope totdat brondata en productflow volledig zijn uitgewerkt. De zes gepubliceerde tools zijn voorstel-beta en geen fiscale productieversie.

- Private-lease impacttool inhoudelijk valideren voordat deze publiek wordt.
- Begrippen-uitleg verder uitrollen naar losse vrije calculatorcopy buiten gedeelde componenten.
- Scenario-heropenflow uitbreiden naar extra tools zodra scenario-opslag daar wordt geactiveerd.
- Salarisverhogingsanalyse opnemen in het maximale-hypotheek-PDF-rapport zodra er een gedeeld report-viewmodel is, zonder aparte PDF-berekening.
