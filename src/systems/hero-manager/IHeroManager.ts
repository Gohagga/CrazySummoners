import { Coords } from "systems/coords/Coords";
import { MapPlayer, Unit } from "w3ts";

export interface IHeroManager {
    
    GetPlayerHero(owner: MapPlayer): Unit | null;

    CreateHeroShop(location: Coords, owner: MapPlayer): Unit;
}