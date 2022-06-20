import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { ICastBarService } from "systems/progress-bars/ICastBarService";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Unit } from "w3ts";

type BlessUnitData = {
    level: Record<number, {
        damageBonusPercent: number,
        castTime: number,
        duration: number,
        aoe: number,
    }>;
}

export interface BlessAbilityData extends OrbAbilityData {
    castSfx: string,
    dummyBless: {
        spellCodeId: string,
        orderId: number
    }
}

export class Bless extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<BlessUnitData>(() => ({
        level: {
            1: {
                damageBonusPercent: 0.1,
                castTime: 3,
                duration: 10,
                aoe: 250,
            },
            2: {
                damageBonusPercent: 0.2,
                castTime: 2.5,
                duration: 20,
                aoe: 350,
            },
            3: {
                damageBonusPercent: 0.2,
                castTime: 2,
                duration: 20,
                aoe: 450,
            }
        }
    }));
    
    private readonly castSfx: string;
    private readonly blessEffect: ITargetEffect<{ bonus: number }>

    constructor(
        data: BlessAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        dummyAbilityFactory: IDummyAbilityFactory,
    ) {
        super(data);

        this.castSfx = data.castSfx;
        
        let dummyBlessId = FourCC(data.dummyBless.spellCodeId);
        this.blessEffect = dummyAbilityFactory.CreateTargetEffect<{ bonus: number }>(dummyBlessId, data.dummyBless.orderId, (prop, a, lvl) => {

            print("Setting up bless dummy: lvl, bonus", lvl, prop.bonus);
            BlzSetAbilityRealLevelField(a, ABILITY_RLF_DAMAGE_INCREASE_PERCENT_INF1, lvl - 1, prop.bonus);
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
                target.isAlly(owner));

            this.blessEffect.Setup({
                level: lvl,
                bonus: data.damageBonusPercent,
            });

            for (let u of units) {
                print(u.name);
                this.blessEffect.Cast(u);
            }

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

        let damageBonus = string.format('%.0f', data.damageBonusPercent * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Blesses units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetFollowThrough(unit, lvl, data.castTime);
    }
}