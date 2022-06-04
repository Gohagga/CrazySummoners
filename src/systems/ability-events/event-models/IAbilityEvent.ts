import { Destructable, Point, Unit } from "w3ts";

export interface IAbilityEvent {

    caster: Unit;
    targetUnit: Unit | null;
    targetDestructable: Destructable | null;
    targetPoint: Point;
    abilityId: number;
    summonedUnit: Unit | null;
}