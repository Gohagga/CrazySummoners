import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { Level } from "systems/log/Log";
import { MinionSummoningService } from "systems/minion-summoning/MinionSummoningService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Unit } from "w3ts";

type SummonRangedUnitData = {
    level: Record<number, {
        summonedUnitTypeId: number,
    }>;
}

export interface SummonRangedAbilityData extends OrbAbilityData {
    levelSummonedUnitTypeId: Record<number, string>
}

export class SummonRanged extends OrbAbility {

    private unitConfigurable: UnitConfigurable<SummonRangedUnitData>;
    private defaultAbilityData: SummonRangedUnitData = {
        level: {
            1: {
                summonedUnitTypeId: -1,
            },
            2: {
                summonedUnitTypeId: -1,
            },
            3: {
                summonedUnitTypeId: -1,
            },
            4: {
                summonedUnitTypeId: -1,
            },
            5: {
                summonedUnitTypeId: -1,
            },
            6: {
                summonedUnitTypeId: -1,
            },
            7: {
                summonedUnitTypeId: -1,
            },
            8: {
                summonedUnitTypeId: -1,
            },
            9: {
                summonedUnitTypeId: -1,
            },
            10: {
                summonedUnitTypeId: -1,
            }
        }
    }

    constructor(
        data: SummonRangedAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly minionSummoningService: MinionSummoningService,
        private readonly resourceBarManager: ResourceBarManager,
    ) {
        super(data);

        // Setting up the summon data
        this.unitConfigurable = new UnitConfigurable<SummonRangedUnitData>(() => this.defaultAbilityData);
        for (let k of Object.keys(data.levelSummonedUnitTypeId)) {
            let level = Number(k);
            this.defaultAbilityData.level[level].summonedUnitTypeId = FourCC(data.levelSummonedUnitTypeId[level]);
        }

        abilityEventHandler.OnAbilityEffect(this.id, e => this.Execute(e));
    }

    Execute(e: IAbilityEvent): boolean {
        
        let caster = e.caster;
        let target = e.targetUnit;
        if (!target) return false;

        let owner = caster.owner;
        let lvl = caster.getAbilityLevel(this.id);
        let data = this.GetUnitConfig(caster);

        if (false == this.resourceBarManager.Get(owner.id).Consume(this.orbCost))
            return false;

        this.minionSummoningService.Summon(caster, target, [
            {
                unitTypeId: data.summonedUnitTypeId,
                level: lvl,
                ai: () => true,
            }
        ]);

        return true;
    }
    
    public GetUnitConfig = (unit: Unit, lvl?: number) => this.unitConfigurable.GetUnitConfig(unit).level[lvl || unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;
        
        let summonedUnit = GetObjectName(data.summonedUnitTypeId)
        let tooltip =
`Paladin summoning skill. Cast on Crystals to summon a #red:${summonedUnit}:# level #red:${lvl}:# in a chosen lane.`;

        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
    }
}