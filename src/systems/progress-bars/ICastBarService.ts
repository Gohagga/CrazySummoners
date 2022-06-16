import { Unit, Widget, Point } from "w3ts";
import { IAbilityEvent } from "../ability-events/event-models/IAbilityEvent";
import { CastBar } from "./CastBar";

export interface ICastBarService {
    GetCurrentlyCastingSpell(caster: Unit): number;

    // TryToQueue(caster: Unit, orderId: number, type: 'target' | 'point' | 'immediate', targetWidget?: Widget, targetPoint?: Point): boolean;

    // TryToQueueAbility(caster: Unit, orderId: number, e: IAbilityEvent, abilityEffect: (e: IAbilityEvent) => void): boolean;

    CreateCastBar(unit: Unit, spellId: number, castTime: number, afterFinish: (bar: CastBar) => void): CastBar;
    // {
    //     OnInterrupt: (action: (castBar: CastBar, orderId: number) => 'finishCastBar' | 'destroyCastBar' | 'ignore') => void,
    // };

    OnInterrupt(castBar: CastBar, caster: Unit, action: (castBar: CastBar, orderId: number) => 'finishCastBar' | 'destroyCastBar' | 'ignore'): void;
}