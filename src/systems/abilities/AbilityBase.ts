import { Log } from "systems/log/Log";
import { ISkill } from "systems/skill-manager/ISkill";
import { Unit } from "w3ts";
import { Wc3AbilityData } from "./Wc3AbilityData";

export abstract class AbilityBase implements ISkill {

    public readonly id: number;
    public readonly codeId: string;
    public readonly name: string;
    public readonly orderId: number;
    
    public readonly addId: number;
    public readonly addCode?: string;

    constructor(data: Wc3AbilityData) {

        this.id = FourCC(data.abilityCode);
        this.codeId = data.abilityCode;

        this.name = data.name;
        this.orderId = data.orderId;
        
        this.addId = FourCC(data.addAbilityCode || data.abilityCode);
        this.addCode = data.addAbilityCode;

        if (!this.id) Log.Error(this.name, "Failed to translate Ability Id", data.abilityCode);
        
        BlzSetAbilityTooltip(this.id, data.name, 0);
        if (data.tooltip) BlzSetAbilityExtendedTooltip(this.id, data.tooltip, 0);
    }

    abstract UpdateUnitSkill(unit: Unit): void;

    protected UpdateUnitAbilityBase(unit: Unit, tooltip?: string, cost?: number, cooldown?: number, name?: string, castTime?: number) {
        let lvl = unit.getAbilityLevel(this.id) - 1;
        let ab: ability;
        if (cost) unit.setAbilityManaCost(this.id, lvl, cost);
        if (cooldown) unit.setAbilityCooldown(this.id, lvl, cooldown);
        if (tooltip) BlzSetAbilityStringLevelField((ab ||= unit.getAbility(this.id)), ABILITY_SLF_TOOLTIP_NORMAL_EXTENDED, lvl, tooltip);
        if (name) BlzSetAbilityStringLevelField((ab ||= unit.getAbility(this.id)), ABILITY_SLF_TOOLTIP_NORMAL, lvl, name);
        if (castTime) BlzSetAbilityRealLevelField((ab ||= unit.getAbility(this.id)), ABILITY_RLF_CASTING_TIME, lvl, castTime);
    }

    AddToUnit(unit: Unit): boolean {
        let added = unit.addAbility(this.addId);
        if (added) this.UpdateUnitSkill(unit);
        return added;
    }

    RemoveFromUnit(unit: Unit): boolean {
        return unit.removeAbility(this.addId);
    }
}