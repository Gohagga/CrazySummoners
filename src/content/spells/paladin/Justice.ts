import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Unit } from "w3ts";

type JusticeUnitData = {
    level: Record<number, {
        damageCoef1: number,
        damageCoef2: number,
        castTime: number,
    }>;
}

export interface JusticeAbilityData extends OrbAbilityData {
    damageSfxModel: string;
    castSfx: string;
}

export class Justice extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<JusticeUnitData>(() => ({
        level: {
            1: {
                damageCoef1: 1.0,
                damageCoef2: 500.0,
                castTime: 3.5,
            },
            2: {
                damageCoef1: 1.0,
                damageCoef2: 400.0,
                castTime: 3.0,
            },
            3: {
                damageCoef1: 1.0,
                damageCoef2: 300.0,
                castTime: 2.5,
            },
            4: {
                damageCoef1: 1.0,
                damageCoef2: 200.0,
                castTime: 2.0,
            }
        }
    }));

    private readonly castSfx: string;
    private readonly damageSfxModel: string;

    constructor(
        data: JusticeAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.damageSfxModel = data.damageSfxModel;

        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }

    Execute(e: IAbilityEvent): void {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);
        const target = e.targetUnit;

        const owner = caster.owner;
        const ownerId = owner.id;
        const data = this.unitConfigurable.GetUnitConfig(caster).level[lvl];
        
        if (!target) throw new Error("This spell must have a target.");
        let life = target.life;        

        let castSfx = new Effect(this.castSfx, caster, 'origin');

        this.spellcastingService.CastSpell(caster, this.id, data.castTime, cb => {
            cb.Finish();
            castSfx.destroy();

            if (false == this.resourceBarManager.Get(ownerId).Consume(this.orbCost)) return;

            let damage = (life * data.damageCoef1) / (life + data.damageCoef2) * life;
            caster.damageTarget(target.handle, damage, true, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_MAGIC, WEAPON_TYPE_WHOKNOWS);

            new Effect(this.damageSfxModel, target, 'origin').destroy();

        }, (orderId, cb) => {
            castSfx.destroy();
            cb.Destroy();

            return false;
        });
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let damagePercent = string.format('%.1f', data.damageCoef1 * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Damages target unit. Damage scales with target's maximum hp.

#acc:Cast time: ${castTime} sec:#`;

        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
    }
}