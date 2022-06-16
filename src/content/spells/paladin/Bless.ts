import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Unit } from "w3ts";

type BlessUnitData = {
    level: Record<number, {
        damageBonusPercent: number,
        castTime: number,
        duration: number,
    }>;
}

export interface BlessAbilityData extends OrbAbilityData {
}

export class Bless extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<BlessUnitData>(() => ({
        level: {
            1: {
                damageBonusPercent: 0.1,
                castTime: 1,
                duration: 10,
            },
            2: {
                damageBonusPercent: 0.2,
                castTime: 2,
                duration: 20,

            }
        }
    }));

    constructor(
        data: BlessAbilityData,
    ) {
        super(data);
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let damageBonus = string.format('%.0f', data.damageBonusPercent * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Blesses units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip);
    }
}