import { Coords } from "systems/coords/Coords";
import { MapPlayer, Unit } from "w3ts";

export interface IHeroManager {
    CreateHeroShop(location: Coords, owner: MapPlayer): Unit;
}