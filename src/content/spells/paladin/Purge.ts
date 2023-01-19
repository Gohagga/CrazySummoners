import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { UnitTypeService } from "systems/classification-service/UnitTypeService";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { IPointEffect } from "systems/dummies/interfaces/IPointEffect";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Unit } from "w3ts";

type PurgeUnitData = {
    level: Record<number, {
        holyDamage: number,
        aoe: number,
        castTime: number,
    }>;
}

export interface PurgeAbilityData extends OrbAbilityData {
    castSfx: string,
    damageSfxModel: string,
    effectSfxModel: string,
    dummyPurge: {
        spellCodeId: string,
        orderId: number
    },
}

export class Purge extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<PurgeUnitData>(() => ({
        level: {
            1: {
                holyDamage: 150,
                castTime: 1.5,
                aoe: 300,
            },
            2: {
                holyDamage: 200,
                castTime: 1.2,
                aoe: 350,
            },
            3: {
                holyDamage: 250,
                castTime: 0.9,
                aoe: 400,
            }
        }
    }));

    
    private readonly castSfx: string;
    private readonly damageSfxModel: string;
    private readonly effectSfxModel: string;
    private readonly purgeEffect: IPointEffect<{}>

    constructor(
        data: PurgeAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        dummyAbilityFactory: IDummyAbilityFactory,
        private readonly unitTypeService: UnitTypeService,
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.damageSfxModel = data.damageSfxModel;
        this.effectSfxModel = data.effectSfxModel;

        let dummyBlessId = FourCC(data.dummyPurge.spellCodeId);
        this.purgeEffect = dummyAbilityFactory.CreatePointEffect<{}>(dummyBlessId, data.dummyPurge.orderId, (prop, a, lvl) => {
            // BlzSetAbilityRealLevelField(a, ABILITY_RLF_DAMAGE_INCREASE_PERCENT_INF1, lvl - 1, prop.bonus);
        });

        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }

    Execute(e: IAbilityEvent): boolean {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);
        const targetPoint = e.targetPoint;

        const owner = caster.owner;
        const ownerId = owner.id;
        const data = this.unitConfigurable.GetUnitConfig(caster).level[lvl];

        let castSfx = new Effect(this.castSfx, caster, 'origin');

        this.spellcastingService.CastSpell(caster, this.id, data.castTime, cb => {
            cb.Finish();
            castSfx.destroy();

            if (false == this.resourceBarManager.Get(ownerId).Consume(this.orbCost)) return;

            let units = this.enumService.EnumUnitsInRange(targetPoint, data.aoe, target =>
                target.isAlive());

            this.purgeEffect.Setup({
                level: lvl,
            });

            for (let u of units) {
                let typeId = u.typeId;
                if ((this.unitTypeService.IsUndead(typeId) || this.unitTypeService.IsDemon(typeId))
                    && !u.isUnitType(UNIT_TYPE_MAGIC_IMMUNE) && u.isEnemy(owner)) {
                    
                    caster.damageTarget(u.handle, data.holyDamage, true, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_DIVINE, WEAPON_TYPE_WHOKNOWS);
                    new Effect(this.damageSfxModel, u, 'origin').destroy();
                }

                // TODO: Dispel unit
            }

            this.purgeEffect.Cast(targetPoint);
            
        }, (orderId, cb) => {

            castSfx.destroy();
            cb.Destroy();

            return false;
        });

        return true;
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Removes effects in a target #blu:${data.aoe}:# area and deals #red:${data.holyDamage}:# damage to demons and undead.

#acc:Cast time: ${castTime} sec:#`;

        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
    }
}