import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Unit } from "w3ts";

type RejuvenateUnitData = {
    level: Record<number, {
        targetCount: number,
        healPercent: number,
        channelTime: number,
    }>;
}

export interface RejuvenateAbilityData extends OrbAbilityData {
}

export class Rejuvenate extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<RejuvenateUnitData>(() => ({
        level: {
            1: {
                targetCount: 1,
                healPercent: 0.25,
                channelTime: 5,
            },
            2: {
                targetCount: 2,
                healPercent: 0.25,
                channelTime: 5,
            }
        }
    }));

    constructor(
        data: RejuvenateAbilityData,
    ) {
        super(data);
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let healPercent = string.format('%.1f', data.healPercent * 100);
        let channelTime = string.format('%.1f', data.channelTime);
        let tooltip =
`Heals #red:${data.targetCount}:# most damaged unit in area for ${healPercent}% their max hp repeatedly.

#acc:Channel time: ${channelTime} sec:#`;

        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
    }
}