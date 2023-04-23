import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { UnitTypeService } from "systems/classification-service/UnitTypeService";
import { IGameEffects } from "systems/game-effects/IGameEffects";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Timer, Unit } from "w3ts";

type PerseveranceUnitData = {
    level: Record<number, {
        maxLifeBonus: number,
        healing: number,
        cooldown: number,
    }>;
}

export interface PerseveranceAbilityData extends OrbAbilityData {
    // castSfx: string,
    auraCodeId: string,
}

export class Perseverance extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<PerseveranceUnitData>(() => ({
        level: {
            1: {
                maxLifeBonus: 35,
                healing: 2,
                cooldown: 60,
            },
            2: {
                maxLifeBonus: 36,
                healing: 2,
                cooldown: 53,
            },
            3: {
                maxLifeBonus: 37,
                healing: 2,
                cooldown: 46,
            },
            4: {
                maxLifeBonus: 38,
                healing: 2,
                cooldown: 39,
            },
            5: {
                maxLifeBonus: 39,
                healing: 2,
                cooldown: 32,
            },
            6: {
                maxLifeBonus: 40,
                healing: 2,
                cooldown: 25,
            }
        }
    }));
    
    private readonly auraSpellId: number;

    private readonly instances: Record<number, Timer> = {};

    constructor(
        data: PerseveranceAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly gameEffect: IGameEffects,
        private readonly unitTypesService: UnitTypeService
    ) {
        super(data);
        this.auraSpellId = FourCC(data.auraCodeId);
        
        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }
    
    Execute(e: IAbilityEvent): boolean {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);
        const target = e.targetUnit;
        if (!target) return false;
        
        let data = this.unitConfigurable.GetUnitConfig(caster).level[lvl];
        
        let maxLife = target.maxLife;
        let life = GetWidgetLife(target.handle);
        if (maxLife < data.maxLifeBonus) {
            target.addAbility(this.auraSpellId);
            target.setAbilityLevel(this.auraSpellId, 2);
            target.removeAbility(this.auraSpellId);
            SetWidgetLife(target.handle, life);
        } else if (this.unitTypesService.IsUndead(target)) {
            caster.damageTarget(target.handle, data.healing, false, false, ATTACK_TYPE_MAGIC, DAMAGE_TYPE_MAGIC, WEAPON_TYPE_WHOKNOWS);
        } else {
            this.gameEffect.HealUnit(caster, target, data.healing);
        }

        return true;
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let tooltip =
`Perseverancees

#acc:Cooldown: ${data.cooldown} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetCooldown(unit, lvl, data.cooldown);
    }
}