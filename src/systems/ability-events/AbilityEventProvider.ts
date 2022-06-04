import { Trigger } from "w3ts/index";
import { InterruptableService } from "../interruptable/InterruptableService";
import { AbilityEventType } from "./AbilityEventType";
import { IAbilityEventHandler } from "./IAbilityEventHandler";

export class AbilityEventProvider {

    spellCastTrigger: Trigger;
    spellEffectTrigger: Trigger;
    spellEndTrigger: Trigger;
    spellFinishTrigger: Trigger;

    constructor(
        private readonly abilityEventHandler: IAbilityEventHandler,
        private readonly interruptableService: InterruptableService,
    ) {
        this.spellCastTrigger = new Trigger();
        this.spellCastTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
        this.spellCastTrigger.addAction(() => {
            this.interruptableService.Fire(GetTriggerUnit(), GetSpellAbilityId());
            this.abilityEventHandler.Raise(AbilityEventType.Cast, GetSpellAbilityId());
        });
        this.spellEffectTrigger = new Trigger();
        this.spellEffectTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_EFFECT);
        this.spellEffectTrigger.addAction(() => {
            this.abilityEventHandler.Raise(AbilityEventType.Effect, GetSpellAbilityId());
        });
        this.spellEndTrigger = new Trigger();
        this.spellEndTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_ENDCAST);
        this.spellEndTrigger.addAction(() => {
            this.abilityEventHandler.Raise(AbilityEventType.End, GetSpellAbilityId());
        });
        this.spellFinishTrigger = new Trigger();
        this.spellFinishTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_FINISH);
        this.spellFinishTrigger.addAction(() => {
            this.abilityEventHandler.Raise(AbilityEventType.Finished, GetSpellAbilityId());
        });
    }
}