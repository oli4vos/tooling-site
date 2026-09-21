# Belastingtools 2027 — productanalyse en agentprompts

Versie: 18 september 2026
Status wetgeving: voorstellen; parlementaire behandeling loopt
Primaire bron: pakket Belastingplan 2027, ingediend op 15 september 2026

## 0. Gezamenlijke product- en techniekstandaard

Alle tools moeten dezelfde fiscale infrastructuur gebruiken. Bouw daarom geen bedragen of regels rechtstreeks in UI-componenten. Gebruik een versieerbare rule set, bijvoorbeeld `rules/2026.proposed.json`, `rules/2027.proposed.json` en later `rules/2027.enacted.json`. Iedere parameter bevat minimaal:

- `value` en `unit`;
- `effectiveFrom` en indien relevant `effectiveUntil`;
- `status`: `proposed`, `amended`, `enacted` of `expired`;
- `sourceUrl`, `sourceTitle`, `sourceDate` en een verwijzing naar pagina, paragraaf of artikel;
- `lastVerifiedAt`;
- een korte uitleg voor gebruikers;
- een changelog-entry ten opzichte van de vorige versie.

Iedere tool toont boven de uitkomst een duidelijke statusbadge: **Voorstel Belastingplan 2027 — nog niet definitief**. Uitkomsten vermelden de gebruikte regelversie, peildatum en bronlinks. Als een essentieel gegeven nog niet definitief of onbekend is, rekent de tool niet stilzwijgend met een verzonnen aanname. De gebruiker krijgt dan een scenario, bandbreedte of expliciete melding.

### Gedeelde technische eisen

- TypeScript met strikte compilerinstellingen.
- Scheiding tussen pure rekenfuncties, validatie, presentatie en content.
- Geldbedragen intern in eurocenten of een veilige decimale representatie; geen binaire floating-point-afronding in fiscale kernlogica.
- Alle datums expliciet in `Europe/Amsterdam`; datumlogica testen rond 1 januari en verjaardagen van voertuigen/personen.
- Pure functies voor iedere berekening, met unit tests voor grenzen, net onder de grens en net boven de grens.
- Zod of een vergelijkbare schema-validator voor invoer en rule files.
- Resultaten moeten via een reproduceerbare berekeningsspecificatie uitlegbaar zijn: invoer → toegepaste regel → tussenbedrag → uitkomst.
- Geen persoonsgegevens opslaan zonder noodzaak. Standaard lokaal in de browser rekenen. Analytics alleen op anonieme events en nooit op inkomen, medische kosten, kenteken of exacte geboortedatum.
- WCAG 2.2 AA: volledig toetsenbordbedienbaar, zichtbare focus, foutmeldingen gekoppeld aan velden, correcte labels, voldoende contrast en geen betekenis uitsluitend via kleur.
- Mobiel eerst, maar tabellen en vergelijkingen moeten ook op desktop goed leesbaar zijn.
- Nederlandse getal- en valutanotatie; begrijpelijke taal op B1/B2-niveau met uitklapbare fiscale verdieping.
- Print- en deellink zonder gevoelige invoer in de URL. Een deelcode mag alleen een geanonimiseerde scenario-configuratie bevatten als de gebruiker daar actief voor kiest.
- Geen aangifteadvies of gegarandeerde aanslag presenteren. Gebruik “indicatie” waar niet de volledige persoonlijke fiscale situatie wordt doorgerekend.

### Gedeelde kwaliteitscontrole

Voor publicatie moet iedere tool minimaal slagen voor:

1. unit tests van alle beslisregels;
2. vaste golden tests met handmatig gecontroleerde voorbeelden;
3. property tests waar monotoniciteit of grensgedrag relevant is;
4. accessibility-audit;
5. mobiele visuele controle op 320, 375 en 430 px;
6. controle van alle externe bronlinks;
7. inhoudelijke review door een fiscalist voordat de status `production` wordt gebruikt;
8. een update-test waarmee een regelbestand kan wijzigen zonder UI-code aan te passen.

### Officiële basisbronnen

- [Belastingplanstukken 2027](https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/belastingplan/belastingplanstukken)
- [Wetsvoorstel Belastingplan 2027](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-belastingplan-2027/wetsvoorstel-belastingplan-2027.pdf)
- [Aanbiedingsbrief pakket Belastingplan 2027](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/aanbiedingsbrief-belastingplan-2027/aanbiedingsbrief-aanbiedingsbrief-pakket-belastingplan-2027.pdf)
- [Wetsvoorstel fiscale stimulering start-ups en scale-ups](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-fiscale-stimulering-start-ups-en-scale-ups/wetsvoorstel-wet-fiscale-stimulering-start-ups-en-scale-ups-wetsvoorstel.pdf)
- [Wetsvoorstel Overige fiscale maatregelen 2027](https://www.rijksoverheid.nl/site/binaries/site-content/collections/documents/2026/09/15/wetsvoorstel-overige-fiscale-maatregelen-2027/wetsvoorstel-overige-fiscale-maatregelen-2027-wetsvoorstel.pdf)

---

## 1. Youngtimer Check 2026–2028

### Productdoel

De tool bepaalt per kalenderjaar of een auto onder de youngtimerregeling kan vallen, welk overgangsrecht relevant is en hoe de fiscale bijtelling zich verhoudt tot de reguliere bijtelling. De kernwaarde is zekerheid over ingewikkelde datumregels; een eenvoudige “auto is X jaar oud”-check is onvoldoende.

### Doelgroepen

- IB-ondernemers en zzp’ers met een auto op de zaak;
- dga’s en werknemers met een auto van de zaak;
- autobedrijven, accountants en leaseadviseurs;
- mensen die in 2026 of 2027 een oudere zakelijke auto overwegen.

### Benodigde invoer

- datum eerste toelating/eerste ingebruikneming;
- kalenderjaar waarvoor wordt gecontroleerd: 2026, 2027 of 2028;
- rol: IB-ondernemer, werknemer of dga;
- datum waarop de auto aan deze gebruiker ter beschikking is gesteld;
- bevestiging of de auto op 31 december 2025 al aan dezelfde gebruiker ter beschikking stond;
- cataloguswaarde inclusief relevante fiscale grondslag;
- actuele waarde in het economische verkeer op de gekozen peildatum;
- toepasselijk regulier bijtellingspercentage, standaard afgeleid maar handmatig controleerbaar;
- wel of geen privégebruik van meer dan 500 km per jaar;
- optioneel geschat belastbaar inkomen of marginaal tarief voor een netto-indicatie.

### Regelmodel

- 2026: normale leeftijdsgrens van 16 jaar, plus het gecodificeerde overgangsrecht voor auto’s die in 2025 al ter beschikking stonden en in 2025 de toenmalige grens van 15 jaar bereikten.
- 2027: voorgestelde leeftijdsgrens van 17 jaar. Voor bepaalde auto’s die uiterlijk op 31 december 2025 al ter beschikking stonden en gedurende 2027 17 jaar worden, kan toepassing voor heel 2027 mogelijk zijn.
- Vanaf 2028: voorgestelde structurele leeftijdsgrens van 20 jaar.
- Youngtimerbijtelling: 35% van de waarde in het economische verkeer.
- Reguliere vergelijking: toepasselijk bijtellingspercentage maal fiscale cataloguswaarde.
- Bij maximaal 500 privé-kilometers en sluitend bewijs kan geen bijtelling gelden; de tool moet dit als afzonderlijke route behandelen en geen rittenregistratie juridisch beoordelen.
- De exacte wettelijke formulering “meer dan N jaar geleden voor het eerst in gebruik genomen” moet als datumvergelijking worden geïmplementeerd, niet als afgeronde leeftijd.

### Uitvoer

- heldere conclusie per jaar: kwalificeert, kwalificeert via overgangsrecht, kwalificeert nog niet of onvoldoende gegevens;
- datum waarop de auto zonder overgangsrecht de leeftijdsgrens bereikt;
- jaarlijkse en maandelijkse bruto bijtelling onder youngtimer- en regulier regime;
- verschil in bruto belastbaar voordeel;
- optionele netto-indicatie bij opgegeven marginaal tarief;
- tijdlijn 2025–2028 met wijzigingen;
- uitleg waarom de auto wel of niet kwalificeert, inclusief de gebruikte datums;
- waarschuwing dat marktwaarde aantoonbaar moet zijn en kan afwijken van een advertentieprijs.

### Kritieke uitzonderingen

- datum eerste toelating is niet altijd zonder meer gelijk aan eerste ingebruikneming;
- wisseling van werknemer of ondernemer kan overgangsrecht doorbreken;
- een lage cataloguswaarde kan reguliere bijtelling voordeliger maken dan 35% van de marktwaarde;
- elektrische auto’s kunnen meerdere bijtellingspercentages of plafonds hebben;
- gedurende het jaar wisselende terbeschikkingstelling vereist tijdsevenredige berekening;
- importauto’s en ontbrekende cataloguswaarden mogen niet automatisch met een koopprijs worden doorgerekend.

### Acceptatiecriteria

- De tool rekent correct op de dag vóór, de dag van en de dag na iedere leeftijdsgrens.
- Overgangsrecht is een afzonderlijk uitlegbaar beslispad.
- Een gebruiker kan de vergelijking zien zonder een marginaal belastingtarief in te vullen.
- Geen conclusie “youngtimer” wanneer alleen bouwjaar bekend is.
- Rule files bevatten 2026, voorgesteld 2027 en voorgesteld 2028 afzonderlijk.

### Agentprompt

> Bouw in de huidige repository een productieklare Nederlandse webtool **Youngtimer Check 2026–2028**. Inspecteer eerst de bestaande stack; als de repository leeg is, initialiseer een moderne TypeScript-webapp met een toegankelijke componentstructuur en tests. Implementeer de gezamenlijke productstandaard uit `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Maak een versieerbare fiscale rule engine en implementeer de datum- en overgangsregels uit sectie 1 exact als pure functies. Vraag minimaal om datum eerste ingebruikneming, datum terbeschikkingstelling, situatie op 31 december 2025, rol van de gebruiker, cataloguswaarde, marktwaarde, privégebruik en gekozen jaar. Geef per jaar een uitlegbare kwalificatie, een tijdlijn, youngtimerbijtelling, reguliere bijtelling en optionele netto-indicatie. Modelleer “meer dan N jaar” met exacte datums. Voeg unit tests toe voor iedere grensdatum en ieder overgangspad, plus end-to-endtests voor een kwalificerende auto, een auto die alleen via overgangsrecht kwalificeert en een niet-kwalificerende auto. Toon voorstelstatus en officiële bronlinks. Lever werkende code, documentatie, tests en een korte bron-updatehandleiding; laat geen onafgemaakte onderdelen achter.

---

## 2. Persoonlijke “Wat verandert er voor mij in 2027?”-scan

### Productdoel

Een korte intake vertaalt het omvangrijke pakket naar uitsluitend relevante wijzigingen. Dit is primair een beslis- en relevantietool, niet één allesomvattende belastingaangiftecalculator.

### Doelgroepen

Vrijwel alle burgers, werknemers, AOW’ers, ondernemers, verhuurders, mensen met zorgkosten en werkgevers. De scan moet binnen twee minuten bruikbare resultaten geven.

### Intake

Gebruik progressieve vragen zodat irrelevante gevoelige vragen worden overgeslagen:

- leeftijdscategorie en AOW-status;
- loondienst, ondernemer, dga, gepensioneerd of combinatie;
- bandbreedte jaarinkomen, met optionele exacte invoer;
- starter als ondernemer en startjaar;
- auto van de zaak/youngtimer, eigen auto voor werk of geen relevante auto;
- werkgever met personeelskorting;
- specifieke zorgkosten;
- pensioen- of lijfrenteopbouw bij inkomen rond/boven €137.800;
- koop van een niet-zelfbewoonde woning;
- zakelijk energie-investeren;
- werkzaam bij of eigenaar van startup/scale-up met aandelenopties;
- grote leidingwaterafname, kleine brouwerij, sierteelt, ballonvaart, bosbouw of relevante afval-/brandstofsector.

### Beslislogica

Iedere maatregel wordt als afzonderlijke contentregel opgeslagen met:

- doelgroepvoorwaarden;
- ingangsdatum;
- impacttype: voordeel, nadeel, gemengd of nog onbekend;
- financiële rekenmodule indien beschikbaar;
- urgentie: actie in 2026, voorbereiding voor 2027, voorbereiding voor 2028/2029 of alleen informeren;
- afhankelijkheden en onzekerheden;
- doorklik naar een gespecialiseerde tool.

De scan mag geen relevant onderwerp verbergen omdat de gebruiker geen exact inkomen wil delen. Werk met bandbreedtes en toon “mogelijk relevant” bij onzekerheid.

### Uitvoer

- persoonlijke top 3 met grootste of urgentste wijzigingen;
- volledige relevante lijst, gesorteerd op ingangsdatum;
- “dit moet je mogelijk vóór 1 januari regelen”;
- onderscheid tussen nieuw voorstel, wijziging van eerder plan en reeds gepland afbouwpad;
- bedrag of bandbreedte waar betrouwbaar mogelijk;
- doorklik naar Youngtimer, Netto-inkomen, Startersaftrek, Zorgkosten, Overdrachtsbelasting, EIA en Pensioenplafond;
- downloadbare, privacyvriendelijke samenvatting.

### Risico’s

- Schijnprecisie: niet elke wijziging kan zonder volledige aangifte worden becijferd.
- Selectiebias: gebruikers weten soms niet dat zij onder een regeling vallen.
- Politieke wijzigingen: resultaten moeten aan een rule version hangen.
- Medische en inkomensgegevens zijn gevoelig; verwerk lokaal en wis bij reset.

### Acceptatiecriteria

- Iedere materiële maatregel uit de analyse is aan minimaal één antwoordpad gekoppeld.
- De scan werkt zonder account.
- Resultaten zijn reproduceerbaar met een samenvatting van antwoorden.
- De gebruiker kan antwoorden aanpassen zonder opnieuw te beginnen.
- “Niet relevant” wordt nooit als fiscaal oordeel gepresenteerd wanneer invoer ontbreekt.

### Agentprompt

> Bouw een productieklare Nederlandse webtool **Wat verandert er voor mij in 2027?** op basis van sectie 2 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Maak een dynamische intake die alleen relevante vervolgvragen toont en binnen twee minuten kan worden afgerond. Modelleer iedere belastingmaatregel als versieerbare data met doelgroepvoorwaarden, status, ingangsdatum, impact, actie en bron. Geef een persoonlijke top 3, een volledige tijdlijn en concrete actiemomenten. Gebruik bedragen alleen wanneer de invoer en regelset dat verantwoord toelaten; toon anders een bandbreedte of kwalitatieve impact. Verwerk alle antwoorden lokaal, voeg reset en privacyvriendelijke export toe, en implementeer toegankelijke terug- en wijzigfunctionaliteit. Voeg een dekkingstest toe die controleert dat iedere maatregel aan een beslispad is gekoppeld, unit tests voor combinaties van doelgroepen en end-to-endtests voor werknemer, AOW’er, startende ondernemer en verhuurder. Toon overal de voorstelstatus en bronversie. Lever volledige code, tests en documentatie.

---

## 3. Startersaftrek Afbouwplanner

### Productdoel

De tool maakt zichtbaar hoe de vrijwel volledige beëindiging van de startersaftrek en latere afschaffing van aanverwante regelingen doorwerken in belastbare winst, belasting en toetsingsinkomen.

### Invoer

- startjaar onderneming;
- IB-ondernemer ja/nee;
- verwachte winst per jaar 2026–2029 vóór ondernemersaftrek;
- uren per jaar en indicatie voldoen aan urencriterium;
- aantal keren startersaftrek gebruikt in de voorafgaande vijf jaar;
- aantal jaren ondernemer in de voorafgaande vijf jaar;
- gebruik willekeurige afschrijving starters en gepland investeringsbedrag;
- arbeidsongeschiktheidsuitkering en uren voor de speciale startersaftrek;
- fiscale partner en indicatie toeslagen, zonder een volledige toeslagberekening te simuleren;
- overige relevante aftrekken optioneel.

### Regelmodel

- gewone zelfstandigenaftrek volgens jaarparameters, waaronder €1.200 in 2026 en €900 in 2027;
- startersaftrek €2.123 in 2026, voorgesteld €10 in 2027 en €0 vanaf 2028;
- voorwaarden voor maximaal drie toepassingen in de relevante vijfjaarsperiode;
- willekeurige afschrijving starters beschikbaar tot en met 2027 en voorgesteld afgeschaft in 2028;
- startersaftrek arbeidsongeschikten voorgesteld afgeschaft vanaf 2029;
- effect op verzamel-/toetsingsinkomen tonen, maar toeslagbedragen alleen berekenen als een afzonderlijke, volledige toeslagmodule aanwezig is.

### Uitvoer

- jaartabel 2026–2029 met aftrek, belastbare winst en verschil ten opzichte van ongewijzigd 2026-beleid;
- indicatieve inkomstenbelasting via koppeling aan de netto-inkomen-engine;
- waarschuwing wanneer een toeslagvoorschot mogelijk op een te laag toetsingsinkomen is gebaseerd;
- investeringsmomentvergelijking 2027 versus 2028 voor willekeurige afschrijving;
- checklist van bewijs en voorwaarden, waaronder urenadministratie;
- scenario’s “doorgaan”, “investering naar voren” en “geen recht op urencriterium”, zonder een handelingsadvies als gegarandeerd optimum te presenteren.

### Uitzonderingen

- startersaftrek kan niet worden toegepast zonder recht op zelfstandigenaftrek;
- verliesjaren en niet-verzilverde aftrek vragen meerjarige logica;
- MKB-winstvrijstelling werkt na ondernemersaftrek en beïnvloedt het belastingeffect;
- investeringsaftrek en willekeurige afschrijving zijn verschillende regelingen;
- toeslageffect hangt af van huishouden en vermogen.

### Acceptatiecriteria

- De tool blokkeert startersaftrek als de voorwaarden niet zijn gehaald.
- Gebruikshistorie over vijf jaren wordt controleerbaar weergegeven.
- De €10 in 2027 wordt niet afgerond naar nul.
- De uitkomst scheidt belastingeffect en mogelijk toeslageffect.
- Verlies- of onvoldoende-winstsituaties geven geen negatief fictief belastingvoordeel.

### Agentprompt

> Bouw de **Startersaftrek Afbouwplanner 2026–2029** volgens sectie 3 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Implementeer een meerjarige rule engine voor zelfstandigenaftrek, startersaftrek, gebruikshistorie, urencriterium, MKB-winstvrijstelling, willekeurige afschrijving starters en startersaftrek bij arbeidsongeschiktheid. Laat de gebruiker winst en omstandigheden per jaar invoeren en toon een transparante jaartabel met belastbare winst, aftrekposten en verschil met een ongewijzigd referentiescenario. Voeg een duidelijke waarschuwing over mogelijk aangepast toetsingsinkomen toe, maar bereken geen toeslag zonder volledige toeslagmodule. Test maximaal drie toepassingen in vijf jaar, grensgevallen van het urencriterium, verliesjaren, de €10-aftrek van 2027, afschaffing in 2028 en arbeidsongeschiktheidsaftrek in 2029. Gebruik versieerbare bronnen, voorstelbadges en lokale gegevensverwerking. Lever een complete, toegankelijke interface, pure rekenfuncties, tests en documentatie.

---

## 4. Netto-inkomen 2026 versus 2027

### Productdoel

Een betrouwbare jaarvergelijking van box 1-belasting en landelijke heffingskortingen. Het product moet aantonen welke wijziging het verschil veroorzaakt, niet alleen één netto-eindbedrag tonen.

### Invoer

- geboortedatum of veilige leeftijd/AOW-categorie;
- jaarloon, winst uit onderneming, pensioen/AOW en overig box 1-inkomen afzonderlijk;
- ingehouden pensioenpremie en andere beperkte looninhoudingen;
- recht op arbeidskorting, IACK en jonggehandicaptenkorting via relevante vragen;
- ondernemersstatus en ondernemersaftrekken via koppeling met Tool 3;
- fiscale partner alleen waar relevant voor gekozen modules;
- optioneel maandloon voor herkenbare maandindicatie.

### Rekenbereik

Minimaal:

- drie box 1-schijven voor niet-AOW’ers;
- AOW-tarieven en afwijkende eerste schijf voor vóór 1946 geborenen;
- algemene heffingskorting inclusief afbouw;
- arbeidskorting met alle opbouw- en afbouwtrajecten;
- ouderenkorting en alleenstaande-ouderenkorting;
- IACK en jonggehandicaptenkorting wanneer voldoende gegevens beschikbaar zijn;
- zelfstandigenaftrek en MKB-winstvrijstelling als ondernemerstraject;
- versieerbare premieparameters indien netto na premies wordt getoond.

Geen onderdeel van MVP: box 2, box 3, hypotheekrenteaftrek, persoonsgebonden aftrek, toeslagen, werkgeverspremies en exacte loonstrookreconstructie. Benoem dit vóór de invoer.

### Uitvoer

- netto jaar- en maandindicatie voor 2026 en 2027;
- waterfall of tabel met bijdrage van tarieven, grenzen en kortingen;
- effectieve gemiddelde druk en marginale druk rond het opgegeven inkomen;
- verschil door de beperkte inflatiecorrectie afzonderlijk zichtbaar;
- gevoeligheidsweergave bij €1.000 meer of minder inkomen;
- waarschuwing als WML-afhankelijke parameters nog voorlopig zijn.

### Teststrategie

- golden tests op nulinkomen, iedere schijfgrens en ieder kortingsknikpunt;
- tests direct onder en boven AOW-leeftijd en geboortegrens 1946;
- vergelijking met officiële voorbeeldtabellen of een onafhankelijke fiscale rekenbron;
- afronding pas op wettelijk passend niveau, niet per tussenstap tenzij de wet dat vereist.

### Acceptatiecriteria

- Het verschil kan worden herleid tot afzonderlijke regels.
- De interface noemt de berekening geen loonstrook.
- Voorlopige grenzen zijn zichtbaar gemarkeerd.
- Een regelupdate vereist alleen een rule-filewijziging en nieuwe golden test.

### Agentprompt

> Bouw een productieklare **Netto-inkomen 2026 versus 2027**-calculator volgens sectie 4 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Maak een fiscale kernbibliotheek met pure, versieerbare functies voor box 1-schijven en landelijke heffingskortingen voor niet-AOW’ers, AOW’ers en de vóór-1946-categorie. Ondersteun loon, pensioen en ondernemersinkomen binnen de beschreven scope. Toon netto jaar- en maandindicatie, gemiddelde en marginale druk en een volledige verklaring van het verschil. Maak beperkte inflatiecorrectie zichtbaar als afzonderlijke factor. Markeer WML-afhankelijke parameters als voorlopig. Voeg golden tests toe op alle schijf- en kortingsgrenzen, tests voor AOW-categorieën en validatie tegen officiële parametertabellen. Bouw geen box 2, box 3, toeslagen of loonstrooksimulator in deze tool. Lever volledige code, tests, toegankelijke UI, bronnen en updatehandleiding.

---

## 5. Reiskostenvergoeding-check

### Productdoel

De tool berekent hoeveel een werkgever maximaal gericht vrijgesteld kan vergoeden, wat de verhoging van €0,23 naar €0,25 betekent en of er sinds 1 januari 2026 theoretisch onbenutte fiscale ruimte is.

### Invoer

- enkele reisafstand;
- werkdagen per week en werkdagen per jaar of een kalendergestuurde berekening;
- thuiswerkdagen, vakantiedagen, ziekte en structurele afwijkingen;
- vervoermiddel: privéauto, fiets, lopen, ov of door werkgever ter beschikking gesteld vervoer;
- zakelijke ritten buiten woon-werk;
- werkelijk door werkgever betaalde vergoeding per kilometer of vast bedrag;
- eventuele vergoeding van werkelijke ov-kosten;
- periode waarover wordt gerekend.

### Logica

- maximaal €0,23 per kilometer vóór de beleidswijziging en €0,25 met terugwerkende kracht vanaf 1 januari 2026, volgens de voorgestelde codificatie;
- de verhoging creëert fiscale ruimte, geen verplicht recht op vergoeding;
- bij openbaar vervoer kunnen werkelijke kosten een alternatief zijn;
- geen kilometervergoeding voor een door de werkgever ter beschikking gesteld vervoermiddel voor dezelfde reis;
- voorkom dubbeltelling van thuiswerk- en reiskostenvergoeding op dezelfde dag waar de toepasselijke regels dat uitsluiten;
- ondersteun feitelijke dagen en, pas na verificatie, een vaste-vergoedingsmethode.

### Uitvoer

- maximaal belastingvrij bedrag per maand en jaar;
- werkelijk bedrag volgens invoer;
- onbenutte fiscale ruimte;
- verschil tussen €0,23 en €0,25;
- aparte retroactieve indicatie voor 2026;
- uitleg dat werkgever/cao/arbeidsovereenkomst bepaalt wat daadwerkelijk wordt betaald;
- exporteerbaar overzicht voor een gesprek met werkgever of salarisadministratie.

### Acceptatiecriteria

- Thuiswerkdagen verlagen het aantal reisbewegingen correct.
- Een enkele reis wordt voor een retourdag tweemaal geteld.
- Door werkgever verstrekte auto/fiets geeft geen onterechte kilometervergoeding.
- De tool presenteert onbenutte ruimte niet als vordering op de werkgever.

### Agentprompt

> Bouw de **Reiskostenvergoeding-check 2026–2027** volgens sectie 5 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Bereken op basis van afstand, feitelijke reisdagen, thuiswerk, zakelijke ritten, vervoermiddel en werkelijk betaald bedrag de maximale gericht vrijgestelde vergoeding. Modelleer €0,25 per kilometer met terugwerkende kracht vanaf 1 januari 2026 als voorgestelde codificatie en vergelijk met €0,23. Ondersteun werkelijke ov-kosten als alternatief en voorkom dubbeltelling of vergoeding voor een ter beschikking gesteld vervoermiddel. Toon maximaal bedrag, werkelijk bedrag, onbenutte fiscale ruimte en retroactieve 2026-indicatie, met expliciete uitleg dat fiscale ruimte geen betalingsrecht is. Voeg kalender- en grensgevallen, unit tests en end-to-endtests toe. Lever volledige toegankelijke code, bronverwijzingen en documentatie.

---

## 6. Youngtimer of alternatief? TCO-vergelijker

### Productdoel

Een meerjarige total-cost-of-ownershipvergelijking tussen een zakelijke youngtimer, een reguliere zakelijke occasion, een elektrische auto van de zaak en een privéauto met kilometervergoeding.

### Invoer

- scenario’s met aanschafprijs, cataloguswaarde, marktwaarde, leeftijd en aandrijving;
- koop, financial lease of operational lease;
- looptijd en restwaarde;
- zakelijke en privékilometers;
- brandstof- of elektriciteitsverbruik en prijs;
- onderhoud, reparaties, verzekering, MRB, parkeren en overige jaarlijkse kosten;
- rente/financieringskosten;
- btw-aftrekbaarheid en btw-correctie privégebruik, alleen na expliciete keuze;
- rechtsvorm, winst/inkomen en relevant belastingtarief;
- kilometervergoeding bij privéauto;
- bijtellingsregels per kalenderjaar via de rule engine.

### Rekenmodel

- economische kosten: afschrijving plus operationele kosten plus financiering;
- fiscale winstcorrecties afzonderlijk van cashflow;
- bruto en netto bijtelling;
- inkomsten-/vennootschapsbelastingeffect alleen binnen duidelijk gekozen rechtsvorm;
- btw-effect als optionele geavanceerde module;
- tijdsevenredige kalenderjaarberekening;
- scenario’s voor brandstofprijs, onderhoud en restwaarde;
- contante waarde optioneel, met zichtbare disconteringsvoet.

### Uitvoer

- totale netto kosten per maand, jaar en kilometer;
- uitsplitsing cash, belasting en onzekerheid;
- break-evenkilometrage en break-evenmarktwaarde;
- gevoeligheidsanalyse met laag, basis en hoog scenario;
- uitleg waarom het goedkoopste scenario verandert;
- geen enkel “beste keuze”-advies zonder aannames zichtbaar te maken.

### Kritieke risico’s

- btw bij gemengd gebruik is complex;
- onderhoud van oudere auto’s is onzeker;
- bijtelling en kosten lopen niet altijd via dezelfde belastingplichtige;
- privéauto versus auto van de zaak heeft gevolgen buiten de geselecteerde scope;
- subsidies, lokale parkeerregelingen en verzekeringstarieven veranderen.

### Acceptatiecriteria

- Alle scenario’s gebruiken dezelfde kilometer- en prijsbasis.
- Cashflow en fiscaal voordeel worden niet gesaldeerd zonder uitsplitsing.
- Gevoeligheid voor restwaarde en onderhoud is standaard zichtbaar.
- De Youngtimer Check wordt als gedeelde module hergebruikt.

### Agentprompt

> Bouw een productieklare **Youngtimer of alternatief? TCO-vergelijker** volgens sectie 6 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Hergebruik de Youngtimer-rule engine en vergelijk minimaal vier scenario’s: zakelijke youngtimer, reguliere zakelijke occasion, elektrische auto van de zaak en privéauto met kilometervergoeding. Modelleer aanschaf/lease, afschrijving, restwaarde, financiering, energie, onderhoud, verzekering, MRB, zakelijke en privékilometers en bijtelling. Scheid cashflow, economische kosten en belastingeffect zichtbaar. Maak btw een expliciete geavanceerde module en pas die niet stilzwijgend toe. Toon kosten per maand/jaar/km, break-evenpunten en laag/basis/hoog-scenario’s. Voeg tests toe voor gelijke scenario’s, nul privékilometers, overgang tussen kalenderjaren en extreme restwaarde- of onderhoudsaannames. Lever volledige code, bronversies, toegankelijke vergelijkingsweergave en documentatie.

---

## 7. Zorgkostenaftrek Einde-check

### Productdoel

De tool inventariseert het huidige fiscale voordeel van specifieke zorgkosten en laat zien welk voordeel vanaf 2028 verdwijnt. De nog onbekende vervangende ondersteuning wordt niet geschat alsof deze vaststaat.

### Invoer

- belastingjaar 2026 of 2027 voor het referentiejaar;
- inkomen en fiscale partner;
- kosten per officiële categorie, zoals voorgeschreven dieet, vervoer wegens ziekte, bepaalde hulpmiddelen, extra gezinshulp en andere wettelijk toegestane posten;
- vergoedingen van verzekeraar, gemeente of andere partij;
- eigen bijdragen en expliciet uitgesloten kosten;
- leeftijd en eventuele verhogingsfactoren voor lage inkomens, uitsluitend volgens de geldende jaarregels;
- reeds ontvangen of verwachte TSZ-indicatie als afzonderlijk gegeven.

### Rekenmodel

- categorie-validatie met uitleg wat wel en niet in beginsel meetelt;
- aftrek na vergoedingen;
- wettelijke drempel op basis van drempelinkomen en partnersituatie;
- eventuele verhoging van specifieke categorieën;
- belastingvoordeel op basis van het toepasselijke aftrektarief;
- vergelijking met 2028: fiscale aftrek en TSZ op nul onder het voorstel;
- vervangende compensatie als `unknown`, met uitsluitend het gereserveerde beleidsbudget in uitleg en niet in de persoonlijke berekening.

### Privacy en veiligheid

- Geen diagnose, medicijnnaam of vrije medische notities vragen.
- Alles lokaal verwerken en een prominente “wis mijn gegevens”-actie aanbieden.
- Categorieën omschrijven zonder medisch advies te geven.
- Bewijschecklist leveren, maar documenten niet laten uploaden in de MVP.

### Uitvoer

- totaal opgevoerde, mogelijk kwalificerende en aftrekbare kosten;
- drempel en aftrek boven de drempel;
- indicatief belastingvoordeel in 2027;
- verlies van fiscaal voordeel in 2028;
- duidelijk blok: “Nieuwe compensatie voor chronisch zieken is nog niet uitgewerkt”;
- checklist voor administratie en verwijzing naar actuele Belastingdienstinformatie.

### Acceptatiecriteria

- Vergoede en uitgesloten kosten tellen niet mee.
- De tool maakt onderscheid tussen kosten, aftrekbaar bedrag en werkelijk belastingvoordeel.
- Medische details worden niet opgeslagen of geanalyseerd.
- De uitkomst voor 2028 bevat geen fictieve compensatie.

### Agentprompt

> Bouw de privacyvriendelijke **Zorgkostenaftrek Einde-check 2027–2028** volgens sectie 7 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Implementeer de officiële kostencategorieën, uitsluitingen, vergoedingen, drempelberekening, eventuele verhogingsregels en het beperkte aftrektarief als versieerbare fiscale data. Vraag geen diagnoses of vrije medische tekst en reken volledig lokaal. Toon kosten, mogelijk kwalificerende kosten, aftrekbaar bedrag en indicatief belastingvoordeel afzonderlijk. Vergelijk dit met 2028, wanneer aftrek en TSZ volgens het voorstel vervallen. Zet de vervangende compensatie expliciet op onbekend en bereken daarvoor geen bedrag. Voeg tests toe voor volledig vergoede kosten, kosten onder en boven de drempel, partnersituaties en nul belastingcapaciteit. Lever een toegankelijke interface, volledige tests, bronnen, privacytekst en onderhoudsdocumentatie.

---

## 8. Overdrachtsbelasting-check

### Productdoel

De tool bepaalt het waarschijnlijk toepasselijke tarief en bedrag bij aankoop van vastgoed, met nadruk op de nieuwe 7% voor niet-zelfbewoonde woningen vanaf 2027.

### Invoer

- koopsom en indien afwijkend waarde in het economische verkeer;
- datum juridische verkrijging;
- type object: woning, bedrijfspand, bouwgrond, gemengd object of anders;
- gaat de koper de woning duurzaam als hoofdverblijf gebruiken;
- leeftijd koper op verkrijgingsdatum;
- eerder gebruik startersvrijstelling;
- toepasselijke woningwaardegrens voor starters, afgeleid uit rule file;
- aandeel van iedere koper bij meerdere kopers;
- rechtspersoon of natuurlijk persoon;
- bijzondere relatie, doorverkoop of mogelijke vrijstelling via een verdiepende route.

### Regelmodel

- startersvrijstelling 0% alleen wanneer alle wettelijke voorwaarden zijn vervuld;
- 2% voor eigen hoofdverblijf wanneer geen startersvrijstelling geldt;
- 8% voor niet-hoofdverblijfwoningen in 2026;
- voorgesteld 7% voor niet-hoofdverblijfwoningen vanaf 2027;
- 10,4% voor niet-woningen, tenzij een specifieke vrijstelling geldt;
- heffingsgrondslag is niet automatisch alleen de koopsom;
- gemengde objecten kunnen een splitsing vereisen en moeten naar notaris/fiscalist worden verwezen.

### Uitvoer

- waarschijnlijk tarief, grondslag en belastingbedrag;
- vergelijking verkrijging in 2026 en 2027;
- bedrag dat de tariefdaling van 8% naar 7% scheelt;
- voorwaardencheck met groene, oranje en rode uitkomsten;
- waarschuwing bij gemengd gebruik, meerdere kopers of bijzondere vrijstelling;
- notarischecklist.

### Acceptatiecriteria

- €400.000 niet-zelfbewoonde woning geeft €32.000 in 2026 en voorgesteld €28.000 in 2027.
- Een bedrijfspand krijgt niet ten onrechte 7%.
- De waardegrens voor starters is een jaarparameter.
- Per koper kunnen verschillende tarieven gelden.

### Agentprompt

> Bouw de **Overdrachtsbelasting-check 2026–2027** volgens sectie 8 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Maak een beslisboom voor woning versus niet-woning, hoofdverblijf, startersvrijstelling, leeftijd, eerder gebruik, waardegrens, verkrijgingsdatum en meerdere kopers. Implementeer 8% voor niet-hoofdverblijfwoningen in 2026 en voorgesteld 7% vanaf 2027, naast 0%, 2% en 10,4% waar toepasselijk. Gebruik de juiste heffingsgrondslag en waarschuw bij gemengde objecten of bijzondere vrijstellingen. Toon bedrag, voorwaarden, vergelijking en notarische checklist. Voeg unit tests toe voor ieder tarief, grensleeftijden, waardegrens, meerdere kopers en een gemengd object. Houd alle jaarparameters buiten de UI-code en toon voorstelstatus en officiële bronnen. Lever volledige code, tests en documentatie.

---

## 9. EIA Investeringsvoordeel 2027

### Productdoel

De tool helpt ondernemers inschatten wat de verhoging van de energie-investeringsaftrek van 40% naar voorgesteld 45,5% betekent en welke procedurele voorwaarden aandacht vragen.

### Invoer

- rechtsvorm: IB-ondernemer of vennootschapsbelastingplichtige;
- bedrijfsmiddel en eventuele code op de Energielijst;
- investeringsbedrag exclusief btw indien btw aftrekbaar is;
- datum opdracht/verplichting en datum ingebruikname;
- ontvangen of verwachte subsidies;
- aandeel privégebruik;
- fiscale winst en toepasselijk belastingtarief;
- overige investeringen binnen dezelfde EIA-aanvraag/jaargrenzen;
- datum voorgenomen melding bij RVO.

### Regelmodel

- referentie 2026: 40%; voorgesteld 2027: 45,5%;
- alleen kwalificerende investeringskosten en binnen minimum/maximumregels;
- melding bij RVO binnen de geldende termijn, doorgaans drie maanden na het aangaan van de investeringsverplichting, maar exacte route verifiëren per situatie;
- EIA is extra aftrek van fiscale winst, geen subsidie van 45,5% van de aanschafprijs;
- netto voordeel = extra aftrek maal effectief toepasselijk belastingtarief, begrensd door winst en verliesverrekening;
- samenloop met subsidie, KIA, MIA/Vamil of uitgesloten bedrijfsmiddelen signaleren zonder ongeverifieerde combinatie te berekenen.

### Uitvoer

- kwalificerende investeringsgrondslag;
- EIA-aftrek in 2026 en voorgesteld 2027;
- netto indicatief belastingvoordeel en extra voordeel van 5,5 procentpunt;
- deadline voor melding en actielijst;
- onzekerheidsmelding als Energielijstcode niet is bevestigd;
- verschil tussen cash-uitgave, aftrek en netto voordeel.

### Acceptatiecriteria

- De tool noemt 45,5% geen korting op de factuur.
- Een te late melding geeft een duidelijke waarschuwing.
- Een investering zonder bevestigde Energielijstmatch krijgt geen definitief groen oordeel.
- Onvoldoende winst wordt als timing-/verliesverrekeningsvraag getoond.

### Agentprompt

> Bouw de **EIA Investeringsvoordeel 2027**-calculator volgens sectie 9 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Modelleer EIA als extra winstaftrek met 40% in 2026 en voorgesteld 45,5% in 2027. Vraag rechtsvorm, investering, Energielijstcode, datums, subsidie, privégebruik, winst en belastingtarief. Bereken kwalificerende grondslag, aftrek, netto indicatief voordeel en het extra voordeel van de tariefverhoging. Voeg een deadlinefunctie voor de RVO-melding en een expliciete status “Energielijstmatch niet bevestigd” toe. Signaleer samenloop met KIA/MIA/Vamil zonder die ongecontroleerd te salderen. Test minimum- en maximumgrenzen, te late melding, onvoldoende winst, subsidie en gedeeltelijk privégebruik. Lever volledige code, versieerbare regels, officiële RVO- en Rijksoverheidbronnen, toegankelijke UI en documentatie.

---

## 10. Startup-aandelenoptiecalculator

### Productdoel

Een scenario- en educatietool voor werknemers en werkgevers die het huidige aandelenoptieregime vergelijkt met het voorgestelde startup-/scale-upregime. Vanwege de complexiteit is dit geen vervanging van loonbelastingadvies.

### Invoer

- kwalificatiestatus startup/scale-up en geldigheidsperiode van de RVO-beschikking;
- datum toekenning, aantal opties, uitoefenprijs en waarde onderliggende aandelen bij toekenning;
- datum en waarde bij uitoefening;
- datum waarop aandelen verhandelbaar worden;
- datum en opbrengst bij daadwerkelijke verkoop;
- perioden waarin de werkgever wel/niet kwalificeert;
- dienstverbandstatus en eventueel emigratiemoment;
- overname, fusie, splitsing, overlijden of verlies van voorwaarden;
- eventuele dividenden of andere voordelen;
- keuze voor toegestaan alternatief heffingsmoment;
- toepasselijk marginaal loonbelastingtarief voor een indicatie.

### Regelmodel

- onder het voorgestelde regime in beginsel heffing bij vervreemding van optie of verkregen aandeel;
- werknemer kan in toegestane gevallen kiezen voor heffing bij uitoefening of eerste verhandelbaarheid, mits tijdig schriftelijk vastgelegd;
- uitoefenprijs vermindert het voordeel, niet verder dan nihil;
- 65% van het kwalificerende voordeel wordt als loon belast;
- voordeel dat toerekenbaar is aan een periode buiten de kwalificatie kan voor 100% meetellen; implementeer de pro-ratamethode op dagen;
- ingebouwde waarde bij toekenning boven uitoefenprijs kan buiten de 65%-grondslagversmalling vallen;
- aanmerkelijkbelanghouders en lucratief belang vallen buiten het bijzondere regime;
- emigratie en bijzondere gebeurtenissen genereren een escalatie naar adviseur en alleen een scenario als alle vereiste gegevens beschikbaar zijn.

### Uitvoer

- tijdlijn van toekenning tot verkoop;
- heffingsmoment onder huidig en voorgesteld regime;
- bruto voordeel, kwalificerend 65%-deel, eventueel 100%-deel en belastbaar loon;
- indicatieve belasting en liquiditeit op het heffingsmoment;
- vergelijking van keuze-heffingsmomenten;
- werkgeverschecklist voor beschikking, administratie, schriftelijke keuze en transactiegoedkeuring;
- risicovlaggen voor emigratie, overlijden, aanmerkelijk belang, lucratief belang en verlopen beschikking.

### Acceptatiecriteria

- De pro-ratarekensom gebruikt kalenderdagen en schrikkeljaren correct.
- De calculator verwerkt nooit automatisch 65% over de gehele looptijd als kwalificatie tussentijds stopt.
- Het verschil tussen waarde, voordeel, loon en belasting is zichtbaar.
- Complexe events worden niet verborgen achter één eindbedrag.

### Agentprompt

> Bouw een geavanceerde **Startup-aandelenoptiecalculator** volgens sectie 10 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md` en het officiële wetsvoorstel fiscale stimulering start-ups en scale-ups. Implementeer een event-gebaseerde tijdlijn voor toekenning, uitoefening, verhandelbaarheid, verkoop, verlies van RVO-kwalificatie, emigratie, overname, overlijden en dividend. Vergelijk huidig en voorgesteld regime. Bereken uitoefenprijs, bruto voordeel, 65%-grondslagversmalling en een op dagen gebaseerde pro-rata wanneer slechts een deel van de looptijd kwalificeert. Ondersteun de wettelijk toegestane keuze voor een eerder heffingsmoment met vastleggingswaarschuwing. Sluit aanmerkelijk belang en lucratief belang uit van een positieve kwalificatie. Toon liquiditeit en belasting afzonderlijk en label de uitkomst als scenario, niet als loonbelastingadvies. Voeg golden tests toe op de officiële voorbeelden uit de memorie van toelichting en tests voor schrikkeljaar, verlopen beschikking en gemengde kwalificatieperiode. Lever volledige code, bronnen, tests en werkgeversdocumentatie.

---

## 11. Pensioenplafond-check 2027–2032

### Productdoel

De tool laat werknemers en werkgevers zien hoe een zesjarige bevriezing van de aftoppingsgrens op €137.800 doorwerkt bij loonstijging. Hij berekent geen volledige pensioenuitkering, maar het salarisdeel dat buiten fiscaal gefaciliteerde pensioen- of lijfrenteopbouw valt.

### Invoer

- huidig pensioengevend salaris;
- verwacht groeipercentage of salaris per jaar 2027–2032;
- franchise indien een aanvullende bijdrage-indicatie wordt gewenst;
- werknemers- en werkgeverspremiepercentage optioneel;
- huidige grens en een vergelijkingsscenario met loonindexatie;
- bonus en andere pensioengevende componenten afzonderlijk;
- netto pensioen/nettolijfrente als informatieve keuze, niet automatisch berekend.

### Regelmodel

- voorgestelde fiscale aftoppingsgrens: €137.800 van 2027 tot en met 2032;
- scenario zonder bevriezing gebruikt een expliciete, door gebruiker gekozen loonindexatie en wordt als hypothetisch gemarkeerd;
- overschrijding = max(0, pensioengevend loon − grens);
- indicatief gemiste bruto premie/inleg alleen als premiepercentage bekend is;
- netto-effect hangt af van pensioenregeling, werkgeversbijdrage en loonafspraken en mag niet uit alleen de fiscale grens worden afgeleid;
- houd pensioen en lijfrente conceptueel gescheiden in uitleg.

### Uitvoer

- jaartabel 2027–2032 met salaris, grens, overschrijding en hypothetisch geïndexeerde grens;
- cumulatief salarisdeel boven de bevroren grens;
- indicatieve bijdrage-impact bij opgegeven premiepercentages;
- grafiek waarin salaris de bevroren grens passeert;
- vragenlijst voor HR, pensioenuitvoerder of adviseur.

### Acceptatiecriteria

- Onder €137.800 is overschrijding nul.
- Een bonus telt alleen mee als gebruiker deze als pensioengevend markeert.
- Het hypothetische indexatiescenario wordt niet als bestaande wet gepresenteerd.
- Geen pensioenuitkering op pensioendatum zonder actuariële gegevens berekenen.

### Agentprompt

> Bouw de **Pensioenplafond-check 2027–2032** volgens sectie 11 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Gebruik de voorgestelde bevroren fiscale grens van €137.800 voor ieder jaar 2027–2032. Laat gebruikers salarisgroei, bonus, pensioengevende componenten, franchise en optionele premiepercentages invoeren. Toon per jaar het salarisdeel boven de grens en vergelijk dit met een duidelijk hypothetisch geïndexeerd scenario. Bereken alleen een indicatieve bijdrage-impact wanneer premiepercentages zijn opgegeven; bereken geen toekomstige pensioenuitkering. Voeg een toegankelijke grafiek, jaartabel en HR-checklist toe. Test grensbedragen, wisselende bonus, nulgroei, negatieve groei en het jaar waarin de grens voor het eerst wordt overschreden. Lever volledige code, bronnen, tests en heldere scope-uitleg.

---

## 12. Vliegbelasting Afstandscheck

### Productdoel

De tool bepaalt op basis van vertrek en eindbestemming welke voorgestelde vliegbelastingcategorie vanaf 2027 geldt. Hij moet aansluitende vluchten en de wettelijke definitie van eindbestemming correct behandelen.

### Invoer

- Nederlandse vertrekluchthaven;
- eindbestemming via luchthaven- of plaatszoeker;
- eventuele overstapluchthavens;
- enkele reis of retour;
- aantal belaste passagiers;
- passagierscategorie of uitzondering indien de wet daarvoor onderscheid maakt;
- optioneel vergelijking met vertrek uit Duitsland of België uitsluitend als betrouwbare actuele data beschikbaar zijn.

### Datamodel en logica

- beheerde luchthavendataset met IATA/ICAO, coördinaten, land en tijdzone;
- geodetische/grootcirkelafstand volgens de wettelijk voorgeschreven meetmethode, na verificatie van de exacte referentiepunten;
- eindbestemming, niet iedere afzonderlijke vlucht, bepaalt de categorie wanneer de overstap juridisch onderdeel is van dezelfde reis;
- voorgestelde tarieven 2027: €31,04 onder 2.000 km, €49,87 van 2.000 tot en met 5.500 km volgens de precieze wettelijke grensformulering, en €59,43 boven 5.500 km;
- onbekende eindbestemming valt volgens de wet mogelijk onder het hoge tarief; implementeer dit alleen met bronverwijzing;
- belasting is per vertrekkende passagier; retour vanaf het buitenland is niet automatisch nogmaals Nederlandse vliegbelasting;
- transferpassagiers en wettelijke uitzonderingen moeten worden gecontroleerd en niet op basis van alleen routegegevens worden aangenomen.

### Uitvoer

- afstand, tariefzone en belasting per persoon;
- totaal voor het reisgezelschap;
- vergelijking met het eerder voorziene langeafstandstarief van €74,81;
- kaart of eenvoudige routevisualisatie;
- uitleg hoe overstap en eindbestemming zijn behandeld;
- waarschuwing dat ticketprijzen de belasting niet altijd één-op-één tonen.

### Acceptatiecriteria

- Exacte tests op 2.000 en 5.500 km volgens de wettelijke inclusiviteit.
- Retour wordt niet als twee Nederlandse vertrekken belast tenzij beide vluchten vanuit Nederland vertrekken.
- Een overstap verandert de eindbestemming niet zonder reden.
- De luchthavendataset heeft bron, versie en updateprocedure.

### Agentprompt

> Bouw de **Vliegbelasting Afstandscheck 2027** volgens sectie 12 van `BELASTINGTOOLS_2027_BOUWSPECIFICATIES.md`. Gebruik een versieerbare luchthavendataset en implementeer de wettelijk juiste afstandsmethode en definitie van eindbestemming. Ondersteun Nederlandse vertrekluchthaven, eindbestemming, overstappen, reizigersaantal en retour. Bereken de voorgestelde zones en tarieven van €31,04, €49,87 en €59,43, met exact getest grensgedrag op 2.000 en 5.500 km. Toon afstand, zone, bedrag per persoon, totaal, route-uitleg en vergelijking met het eerder voorziene hoge tarief van €74,81. Behandel transferpassagiers en uitzonderingen uitsluitend na verificatie in de officiële wet. Voeg zoekfunctionaliteit, toegankelijke routevisualisatie, unit tests voor grensafstanden en end-to-endtests voor directe vlucht, overstap en retour toe. Lever volledige code, data-updateprocedure, bronnen en documentatie.

---

## 13. Aanbevolen bouwvolgorde en gedeelde architectuur

### Fase 1 — bereik en urgentie

1. Youngtimer Check 2026–2028
2. Persoonlijke wijzigingsscan
3. Startersaftrek Afbouwplanner
4. Netto-inkomen 2026 versus 2027

### Fase 2 — eenvoudige conversietools

5. Reiskostenvergoeding-check
6. Overdrachtsbelasting-check
7. EIA Investeringsvoordeel
8. Vliegbelasting Afstandscheck

### Fase 3 — specialistische of datagevoelige tools

9. Zorgkostenaftrek Einde-check
10. Pensioenplafond-check
11. Youngtimer TCO-vergelijker
12. Startup-aandelenoptiecalculator

### Gedeelde modules

- `@tax/rules`: versiebeheer, bronmetadata en statussen;
- `@tax/money`: veilige geld- en afrondingsfuncties;
- `@tax/dates`: fiscale datum- en tijdsevenredigheidsfuncties;
- `@tax/income`: box 1 en heffingskortingen;
- `@tax/vehicles`: youngtimer, reguliere bijtelling en autoscenario’s;
- `@tax/explain`: gestandaardiseerde rekenstappen en bronuitleg;
- `@tax/ui`: invoervelden, statusbadges, resultaatkaarten, tabellen en disclaimers;
- `@tax/testing`: gedeelde factories, golden cases en grenswaardetests.

### Redactioneel beheer

Maak naast de code een maatregelenregister met eigenaar, bron, laatste controle, volgende parlementaire mijlpaal en tools die door de maatregel worden geraakt. Een wijziging van bijvoorbeeld de youngtimerleeftijd moet automatisch aangeven welke tests en pagina’s opnieuw moeten worden beoordeeld.

### Releasebeleid

- `proposal-preview`: publiek bruikbaar met prominente voorstelstatus;
- `parliament-amended`: bijgewerkt na amendement of nota van wijziging;
- `enacted`: pas na publicatie van de wet en controle van eindejaarsregelingen;
- `archived`: historische jaarversie blijft reproduceerbaar en wordt niet overschreven.
