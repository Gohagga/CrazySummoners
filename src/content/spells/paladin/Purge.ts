import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Unit } from "w3ts";

type PurgeUnitData = {
    level: Record<number, {
        holyDamage: number,
        castTime: number,
    }>;
}

export interface PurgeAbilityData extends OrbAbilityData {
}

export class Purge extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<PurgeUnitData>(() => ({
        level: {
            1: {
                holyDamage: 0,
                castTime: 5,
            },
            2: {
                holyDamage: 2,
                castTime: 5,
            }
        }
    }));

    constructor(
        data: PurgeAbilityData,
    ) {
        super(data);
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let channelTime = string.format('%.1f', data.castTime);
        let tooltip =
`Removes effects in a target area and deals ${data.holyDamage} damage to demons and undead.

#acc:Cast time: ${channelTime} sec:#`;

        this.UpdateUnitAbilityBase(unit, tooltip);
    }
}