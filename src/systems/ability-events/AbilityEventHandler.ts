import { RecordEventBusHandler } from "systems/events/generic/RecordEventBusHandler";
import { AbilityEventType } from "./AbilityEventType";
import { IAbilityEventHandler } from "./IAbilityEventHandler";
import { AbilityEvent } from "./event-models/AbilityEvent";
import { AbilityFinishEvent } from "./event-models/AbilityFinishEvent";
import { Log } from "systems/log/Log";

export class AbilityEventHandler implements IAbilityEventHandler {

    private readonly handles: Record<AbilityEventType, RecordEventBusHandler<(e: any) => any>> = {
        [AbilityEventType.Cast]: new RecordEventBusHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Effect]: new RecordEventBusHandler<(e: AbilityEvent) => boolean>(),
        [AbilityEventType.End]: new RecordEventBusHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Finished]: new RecordEventBusHandler<(e: AbilityFinishEvent) => void>(),
        [AbilityEventType.Success]: new RecordEventBusHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Order]: new RecordEventBusHandler<(e: AbilityEvent) => void>(),
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
            let subs = this.handles[type].Subscriptions[abilityId];

            let result = true;
            for (let sub of subs) {
                result &&= sub(event);
            }

            Log.Debug("AbilityEvent", type, "result", result);
            
            if (type == AbilityEventType.Effect && result === true && abilityId in subs) {

                const successSubs = this.handles[AbilityEventType.Success].Subscriptions[abilityId];
                for (let successSub of successSubs) {
                    Log.Debug("AbilityEvent Finished Sub", type, "result", result);
                    successSub(event);
                }
            }
        }
    }
}