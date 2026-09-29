# Hypotheekvergelijking: 10 testcases

Datum: 29 september 2026  
Eigen tool: `apps/annuitair-lineair` op `https://oli4vos.github.io/tooling-site/apps/annuitair-lineair/`  
Status: handmatige black-box audit, geen adviesberekening

## Testopzet

De tien scenario’s variëren bedrag, rente en looptijd. De eigen tool is telkens leeg geopend, de drie kernvelden zijn ingevuld en de zichtbare uitkomst is vastgelegd. De rente van 0% is bewust als grensgeval opgenomen; de eigen tool geeft daar terecht een foutmelding omdat de huidige validatie een rente groter dan 0 verwacht.

Voor de externe vergelijking zijn dezelfde drie kerninvoeren gebruikt in:

1. [berekenen.nl – Annuïteit berekenen](https://www.berekenen.nl/hypotheek/annuiteit-berekenen) — live getest; bruto maandlast.
2. [BerekenHet – Kosten verschillende hypotheekvormen](https://www.berekenhet.nl/hypotheek/kosten-hypotheekvormen.html) — live getest; totale bruto/netto kosten voor annuïtair en lineair. Voor de netto-uitkomst is aanvullend een bruto jaarinkomen van €80.000 en een WOZ-waarde gelijk aan de hypotheek ingevoerd, omdat deze tool dat verplicht vraagt.
3. [Vereniging Eigen Huis – Rekenmodule annuïteiten en lineaire hypotheek](https://www.eigenhuis.nl/huis-kopen/hypotheek/hypotheekvormen/rekenmodule-annuiteiten-en-lineaire-hypotheek) — gecontroleerd op invoervelden en scope. De module beschrijft bruto maandlasten, maar leverde in deze sessie geen zichtbaar resultaat na invoer; daarom zijn daar geen cijfers aan toegeschreven.

## A. Eerste maand: eigen tool versus berekenen.nl

De eigen tool gebruikt zonder eigenwoningprofiel de transparante vaste netto-rentefactor 0,6303. De bruto annuïteit is onafhankelijk van die factor. `Δ` is het absolute verschil in bruto annuïteit.

| Case | Hypotheek | Rente | Looptijd | Eigen bruto annuïtair | berekenen.nl bruto | Δ | Eigen netto annuïtair | Eigen bruto lineair | Eigen netto lineair |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| H01 | €300.000 | 4,00% | 30 jaar | €1.432,25 | €1.432,25 | €0,00 | €1.062,55 | €1.833,33 | €1.463,63 |
| H02 | €500.000 | 3,50% | 30 jaar | €2.245,22 | €2.245,22 | €0,00 | €1.706,08 | €2.847,22 | €2.308,08 |
| H03 | €200.000 | 5,50% | 20 jaar | €1.375,77 | €1.375,77 | €0,00 | €1.036,88 | €1.750,00 | €1.411,11 |
| H04 | €150.000 | 2,50% | 15 jaar | €1.000,18 | €1.000,18 | €0,00 | €884,65 | €1.145,83 | €1.030,30 |
| H05 | €750.000 | 4,20% | 30 jaar | €3.667,63 | €3.667,63 | €0,00 | €2.697,17 | €4.708,33 | €3.737,87 |
| H06 | €250.000 | 6,00% | 30 jaar | €1.498,88 | €1.498,88 | €0,00 | €1.036,75 | €1.944,44 | €1.482,32 |
| H07 | €400.000 | 4,75% | 25 jaar | €2.280,47 | €2.280,47 | €0,00 | €1.695,11 | €2.916,67 | €2.331,31 |
| H08 | €100.000 | 1,50% | 10 jaar | €897,91 | €897,91 | €0,00 | €851,70 | €958,33 | €912,12 |
| H09 | €350.000 | 3,80% | 20 jaar | €2.084,23 | €2.084,23 | €0,00 | €1.674,48 | €2.566,67 | €2.156,92 |
| H10 | €300.000 | 0,00% | 30 jaar | foutmelding | niet berekend | — | — | — | — |

### Beoordeling A

De negen geldige bruto annuïteiten zijn exact gelijk aan berekenen.nl, tot op de cent. Dat bevestigt de kernformule en de maandelijkse renteconversie. De netto kolommen zijn alleen een uitkomst van de eigen scenariofactor; ze zijn niet rechtstreeks vergelijkbaar met een fiscale aangifte.

## B. Totale kosten: eigen rekenlogica versus BerekenHet

De eigen tool toont op het scherm vooral de rente- en maandlastvergelijking. De totale bruto bedragen hieronder zijn onafhankelijk nagerekend uit dezelfde aflossingsschema’s. BerekenHet geeft deze totalen direct terug. Bij BerekenHet is de lineaire kolom steeds goedkoper door sneller aflossen.

| Case | Eigen totaal bruto annuïtair | BerekenHet totaal bruto annuïtair | Eigen totaal bruto lineair | BerekenHet totaal bruto lineair | Verschil BerekenHet netto annuïtair − lineair |
|---|---:|---:|---:|---:|---:|
| H01 | €515.609 | €515.609 | €480.500 | €480.500 | €19.511 |
| H02 | €808.280 | €808.280 | €763.229 | €763.229 | €24.987 |
| H03 | €330.186 | €330.186 | €310.458 | €310.458 | €10.903 |
| H04 | €180.033 | €180.033 | €178.281 | €178.281 | €1.037 |
| H05 | €1.320.346 | €1.320.346 | €1.223.813 | €1.223.813 | €53.297 |
| H06 | €539.595 | €539.595 | €475.625 | €475.625 | €35.349 |
| H07 | €684.141 | €684.141 | €638.292 | €638.292 | €25.464 |
| H08 | €107.750 | €107.750 | €107.563 | €107.563 | €118 |
| H09 | €500.215 | €500.215 | €483.554 | €483.554 | €9.307 |
| H10 | niet berekend | niet berekend | niet berekend | niet berekend | — |

BerekenHet-netto is geen één-op-één referentie voor de eigen tool: de externe tool rekent over de gehele looptijd met eigenwoningforfait, hypotheekrenteaftrek, tariefsaanpassing, Hillen en een expliciet inkomen/WOZ-profiel. De eigen tool rekent hier zonder profiel met een vaste netto-rentefactor. Dat verklaart de verschillen en is geen rekenfout op zichzelf.

## Fouten en opvallende punten

- H10 wordt door de eigen tool geblokkeerd met: “Gebruik een rente tussen 0 en 25 procent.” Dat is consistent met de huidige validatieregel, maar betekent dat een renteloze lening niet als scenario kan worden onderzocht.
- De eigen tool rekent zonder profiel bewust niet met volledige HRA. Dat staat zichtbaar vermeld als “Vaste scenariofactor”.
- Berekenen.nl toont bruto annuïteit en maakt expliciet dat HRA en kosten buiten beschouwing blijven. Daardoor is dit een goede formule-/regressiereferentie, niet een fiscale netto-referentie.
- BerekenHet vraagt extra fiscale invoer. De netto-uitkomsten zijn daardoor rijker, maar alleen vergelijkbaar wanneer inkomen, WOZ, startjaar, AOW-status, partnerverdeling en Box 1-aannames exact gelijk worden gezet.
- Vereniging Eigen Huis positioneert de module als bruto maandlastmodule. In deze test kon de pagina wel worden gevuld, maar verscheen geen resultaat in de geautomatiseerde zichtbare pagina; daarom is geen waarde ingevuld die niet is waargenomen.

## Conclusie

De kernberekening voor annuïtair en lineair is gevalideerd tegen een onafhankelijke bruto-formuletool: alle negen geldige cases matchen tot op de cent. De grote resterende vergelijkbaarheidskwestie zit niet in de annuïteitsformule, maar in netto/fiscale aannames. Voor een volgende audit moeten beide tools hetzelfde centrale HRA-profiel krijgen (inkomen, WOZ, eigenwoningforfait, Hillen, fiscale partner, AOW/IACK en aftrekbaarheid). Pas dan is een netto-verschil inhoudelijk te beoordelen.
