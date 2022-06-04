import { Unit } from "w3ts/index";
import { AbilityEvent } from "./AbilityEvent";

export class AbilityFinishEvent extends AbilityEvent {
    public get caster(): Unit { return Unit.fromEvent(); }
    public get targetUnit(): Unit | null {
        let unit = GetSpellTargetUnit();
        return unit == null ? null : Unit.fromHandle(unit);
    }
    
    public get abilityId(): number { return GetSpellAbilityId(); }
    public get abilityLevel(): number { return GetUnitAbilityLevel(GetTriggerUnit(), GetSpellAbilityId()); }
}