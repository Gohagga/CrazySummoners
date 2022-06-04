import { AbilityEventType } from "./AbilityEventType";
import { AbilityFinishEvent } from "./event-models/AbilityFinishEvent";
import { IAbilityEvent } from "./event-models/IAbilityEvent";

export interface IAbilityEventHandler {

    OnAbilityCast(abilityId: number, callback: (e: IAbilityEvent) => void): void;

    OnAbilityEffect(abilityId: number, callback: (e: IAbilityEvent) => boolean): void;

    OnAbilityEnd(abilityId: number, callback: (e: IAbilityEvent) => void): void;

    OnAbilityFinished(abilityId: number, callback: (e: AbilityFinishEvent) => void): void;

    OnAbilitySuccess(abilityId: number, callback: (e: IAbilityEvent) => void): void;

    Raise(type: AbilityEventType, abilityId: number): void;
}