import { Destructable, Point, Unit } from "w3ts";
import { IAbilityEvent } from "./IAbilityEvent";

export class AbilityEvent implements IAbilityEvent {

    public get caster(): Unit { return Unit.fromEvent(); }
    public get targetUnit(): Unit | null {
        let unit = GetSpellTargetUnit();
        return unit == null ? null : Unit.fromHandle(unit);
    }
    
    public get targetDestructable(): Destructable | null {
        let dest = GetSpellTargetDestructable();
        return dest == null ? null : Destructable.fromHandle(GetSpellTargetDestructable());
    }

    public get targetPoint(): Point { return Point.fromHandle(GetSpellTargetLoc()); }
    public get abilityId(): number { return GetSpellAbilityId(); }
    public get abilityLevel(): number { return GetUnitAbilityLevel(GetTriggerUnit(), GetSpellAbilityId()); }
    public get summonedUnit(): Unit | null {
        let unit = GetSummonedUnit();
        return unit == null ? null : Unit.fromHandle(unit);
    }
}
