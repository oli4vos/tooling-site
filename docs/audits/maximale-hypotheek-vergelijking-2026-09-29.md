# Audit maximale hypotheek — 10 scenario's

**Datum:** 29 september 2026  
**Tool:** [IPC Ole — maximale hypotheek](https://oli4vos.github.io/tooling-site/apps/artifact-hypotheek-wonen-maximale-hypotheek/)  
**Doel:** controleren of de maximale-hypotheektool plausibele uitkomsten geeft en verschillen verklaren ten opzichte van twee publieke rekentools.

## 1. Onderzoeksopzet

De eigen tool is tien keer getest met vaste invoer voor bruto inkomen, partnerinkomen, rente, koopprijs, marktwaarde, eigen middelen en maandelijkse schulden. De testset bevat onder andere een alleenverdiener, twee inkomens, hoge rente, een bestaande schuld, een woningwaarde die lager is dan de koopprijs, een NHG-situatie en een nulrente-randgeval.

Dezelfde inkomens- en rentecombinaties zijn daarna ingevoerd bij:

1. [Berekenen.nl — maximale hypotheek](https://www.berekenen.nl/hypotheek/maximale-hypotheek-berekenen). Deze calculator vraagt zelf om één toetsinkomen en een woonquote. Voor de vergelijking is de totale inkomensom gebruikt en is de woonquote constant op 24,6% gezet. Dit is dus een formule-referentie, geen volledige banktoets.
2. [ZelfRekenen — maximale hypotheek 2026](https://zelfrekenen.nl/maximale-hypotheek-berekenen/). Deze tool vermeldt dat hij de 2026-financieringslasttabellen gebruikt, rekent met één inkomensveld en bevat standaard alleenstaandenruimte. Voor een reproduceerbare vergelijking zijn de totale inkomensom, energielabel E/F/G en 10+ jaar rentevast gebruikt. Partnerinkomen, woningwaarde, NHG en overige schulden zijn daar niet één-op-één als afzonderlijke velden ingevoerd.

De externe tools zijn indicaties. De eigen tool doet bewust méér begrenzingen: inkomen/norm, NHG, woningwaarde/LTV, eigen middelen en schulden. Een afwijking is daarom niet automatisch een fout.

## 2. Resultaten

Bedragen zijn maximale hypotheek in euro’s. `Δ` is externe uitkomst minus eigen tool.

| Case | Kernscenario | Eigen tool | Berekenen.nl | Δ | ZelfRekenen | Δ |
|---|---|---:|---:|---:|---:|---:|
| M01 | €80k inkomen, 4,5%, koop/waarde €350k | €346.039 | €323.672 | -€22.367 | €363.040 | +€17.001 |
| M02 | €80k + €40k partner, 4,5%, koop/waarde €500k | €470.000 | €485.508 | +€15.508 | €571.585 | +€101.585 |
| M03 | €50k inkomen, 4,5%, koop/waarde €300k | €194.071 | €202.295 | +€8.224 | €211.072 | +€17.001 |
| M04 | €100k inkomen, 4,5%, koop/waarde €600k | €445.707 | €404.590 | -€41.117 | €462.707 | +€17.000 |
| M05 | €45k + €45k partner, 3,5%, koop/waarde €450k | €412.542 | €410.872 | -€1.670 | €429.542 | +€17.000 |
| M06 | €80k inkomen, 6%, €500 p/m schuld | €237.957 | €273.538 | +€35.581 | €338.352 | +€100.395 |
| M07 | €80k inkomen, waarde €250k, koopprijs €280k | €250.000 | €323.672 | +€73.672 | €363.040 | +€113.040 |
| M08 | €80k inkomen, koop/waarde €700k, €150k eigen geld | €346.039 | €323.672 | -€22.367 | €363.040 | +€17.001 |
| M09 | €70k + €30k partner, 5,5%, €250 p/m schuld | €380.129 | €361.050 | -€19.079 | €441.160 | +€61.031 |
| M10 | €80k inkomen, rente 0% (randgeval) | €350.000 | €1.025* | -€348.975* | €494.600 | +€144.600 |

`*` Berekenen.nl accepteert 0% niet als een betekenisvolle toetsrente; de pagina viel terug op een maandlast/standaardwaarde. M10 is daarom alleen een robuustheidstest en geen inhoudelijke vergelijking.

## 3. Duiding per verschil

### M01, M03, M04, M05 en M08 — inkomensnorm versus woonquote

De verschillen van grofweg €2k–€41k ontstaan doordat de eigen tool de centrale norm-/toetsrente-logica gebruikt, terwijl Berekenen.nl één handmatig gekozen woonquote van 24,6% toepast. ZelfRekenen voegt bij een alleenstaande standaard €17.000 extra leenruimte toe; dat verklaart exact de terugkerende plus van circa €17.000 in M01, M03, M04, M05 en M08.

### M02 — NHG-plafond en partnerbehandeling

De eigen tool stopt op €470.000 door de ingestelde NHG-/woninggrens. De externe tools kennen in deze invoer geen identieke combinatie van NHG-keuze, marktwaarde en koopprijs. ZelfRekenen is bovendien met één totaal inkomen gedraaid, waardoor de partnerbehandeling niet gelijk is aan de eigen persoonsgerichte invoer.

### M06 en M09 — bestaande maandlasten

De eigen tool verlaagt de leencapaciteit voor €500 respectievelijk €250 maandelijkse verplichtingen. De externe tools hebben in deze test geen gelijkwaardig veld voor alle schulden; hun uitkomst is daardoor structureel te hoog voor dit scenario. Dit is een belangrijke reden om de eigen schuldlaag niet weg te abstraheren.

### M07 — woningwaarde/LTV

De eigen uitkomst is correct begrensd op €250.000 omdat de marktwaarde €250.000 is. De koopprijs is €280.000, maar meer dan 100% van de woningwaarde financieren mag niet. Beide externe tools zijn zonder marktwaarde ingevoerd en signaleren deze LTV-begrenzing dus niet.

### M10 — invoervalidatie

De eigen tool begrenst het resultaat op de woningwaarde (€350.000). Berekenen.nl levert bij 0% geen vergelijkbare hypotheekuitkomst. ZelfRekenen rekent wel door, maar dit randgeval is economisch en fiscaal niet representatief. De productkeuze moet zijn: rente 0% toestaan als technische test, maar in de gebruikersinterface duidelijk waarschuwen dat het geen realistische actuele rente is.

## 4. Auditconclusie

De eigen tool gedraagt zich inhoudelijk consistenter voor de scope waarvoor hij is gebouwd: hij combineert inkomensnorm, rente, schulden, NHG en woningwaarde. De grootste verschillen met publieke tools zijn verklaarbaar door ontbrekende invoervelden bij die tools, de alleenstaanden-extra in 2026 en de handmatig gekozen woonquote bij Berekenen.nl.

Er is geen aanwijzing dat de eigen uitkomsten systematisch verkeerd zijn. Wel zijn drie verbeteringen wenselijk:

1. Toon naast het bedrag altijd de beperkende factor en de gebruikte norm/woonquote.
2. Maak partnerinkomen, studieschuld, private lease en overige maandlasten zichtbaar in de resultaat-uitleg, zodat een gebruiker begrijpt waarom de uitkomst afwijkt van een simpele online calculator.
3. Geef bij 0% rente een waarschuwing en voorkom dat een externe fallbackwaarde als valide vergelijking wordt geïnterpreteerd.

## 5. Bronnen en reikwijdte

De officiële hypotheeknormen veranderen per jaar. Publieke calculators beschrijven zelf dat inkomen, rente, schulden, energielabel, partnerinkomen en de woningwaarde de uitkomst beïnvloeden. Voor een formele adviesberekening blijft een geldverstrekker of hypotheekadviseur leidend; dit rapport is een reproduceerbare product- en rekenlaagtest, geen hypotheekadvies.
