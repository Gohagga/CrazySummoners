import { MapPlayer, Unit } from "w3ts";

export interface IGameEffects
{
    HealUnit(caster: Unit, whichUnit: Unit, amount: number): void;
    ReviveUnit(caster: Unit, whichUnit: Unit, owner?: MapPlayer): Unit;
    // FearUnit(caster: Unit, whichUnit: Unit): void;
    // UnfearUnit(caster: Unit, whichUnit: Unit): void;
}