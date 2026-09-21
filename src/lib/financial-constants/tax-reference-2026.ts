import type { TaxParameter } from "./tax-proposals";

export const TRANSFER_SOURCE = "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/";
export const EIA_SOURCE = "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/investeringsaftrek_en_desinvesteringsbijtelling/energie_investeringsaftrek_eia";
function reference(value: number, unit: TaxParameter["unit"], sourceUrl: string, locator: string, explanation: string): TaxParameter {
  return {value,unit,effectiveFrom:"2026-01-01",effectiveUntil:"2026-12-31",status:"enacted",sourceUrl,sourceTitle:"Belastingdienst — jaarregels 2026",sourceDate:"2026-01-01",lastVerifiedAt:"2026-09-18",locator,explanation,change:"Vastgelegde referentie 2026; geen automatische extrapolatie naar 2027."};
}
export const TAX_REFERENCE_2026 = {
  starterPropertyLimit:reference(55500000,"cents",TRANSFER_SOURCE,"Voorwaarden startersvrijstelling","Grens voor de volledige woningwaarde, niet per kopersdeel."),
  ownHomeRate:reference(20000,"ppm",TRANSFER_SOURCE,"Verlaagd tarief","Eigen hoofdverblijf zonder startersvrijstelling."),
  nonHousingRate:reference(104000,"ppm","https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/tarieven_overdrachtsbelasting/","Tarieven","Algemeen tarief voor niet-woningen."),
  eiaMinimum:reference(250000,"cents",EIA_SOURCE,"Voorwaarden","Minimaal 2.500 euro per bedrijfsmiddel."),
  eiaMaximum:reference(15300000000,"cents",EIA_SOURCE,"Maximumbedrag en samentelbepaling","Jaarmaximum 2026: 153 miljoen euro."),
};
