import { RecordEventHandler } from "../events/generic/RecordEventHandler";
import { AbilityEventType } from "./AbilityEventType";
import { AbilityEvent } from "./event-models/AbilityEvent";
import { AbilityFinishEvent } from "./event-models/AbilityFinishEvent";
import { IAbilityEventHandler } from "./IAbilityEventHandler";

export class AbilityEventHandler implements IAbilityEventHandler {

    private readonly handles: Record<AbilityEventType, RecordEventHandler<(e: any) => any>> = {
        [AbilityEventType.Cast]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Effect]: new RecordEventHandler<(e: AbilityEvent) => boolean>(),
        [AbilityEventType.End]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Finished]: new RecordEventHandler<(e: AbilityFinishEvent) => void>(),
        [AbilityEventType.Success]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Order]: new RecordEventHandler<(e: AbilityEvent) => void>(),
    }

    private Subscribe(type: AbilityEventType, abilityId: number, callback: (e: AbilityEvent) => void) {
        this.handles[type].Subscribe(abilityId, callback);
    }

    public OnAbilityCast(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.Cast, abilityId, callback);
    }

    public OnAbilityEffect(abilityId: number, callback: (e: AbilityEvent) => boolean | undefined) {
        this.Subscribe(AbilityEventType.Effect, abilityId, callback);
    }

    public OnAbilityEnd(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.End, abilityId, callback);
    }

    public OnAbilityFinished(abilityId: number, callback: (e: AbilityFinishEvent) => void) {
        this.Subscribe(AbilityEventType.Finished, abilityId, callback);
    }

    public OnAbilitySuccess(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.Success, abilityId, callback);
    }

    public Raise(type: AbilityEventType, abilityId: number) {
        let event: any;
        if (type == AbilityEventType.Finished) event = new AbilityFinishEvent();
        else event = new AbilityEvent();

        if (abilityId in this.handles[type].Subscriptions) {
            let result = this.handles[type].Subscriptions[abilityId](event);

            if (type == AbilityEventType.Effect &&
                result === true &&
                abilityId in this.handles[AbilityEventType.Success].Subscriptions)
                this.handles[AbilityEventType.Success].Subscriptions[abilityId](event);
        }
    }
}