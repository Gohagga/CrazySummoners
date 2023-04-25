import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Unit } from "w3ts";

type EndureUnitData = {
    level: Record<number, {
        armorBonusAmount: number,
        castTime: number,
        duration: number,
        aoe: number,
    }>;
}

export interface EndureAbilityData extends OrbAbilityData {
    castSfx: string,
    effectSfxModel: string,
    dummyEndure: {
        spellCodeId: string,
        orderId: number
    }
}

export class Endure extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<EndureUnitData>(() => ({
        level: {
            1: {
                armorBonusAmount: 7,
                castTime: 2,
                duration: 12,
                aoe: 250,
            },
            2: {
                armorBonusAmount: 12,
                castTime: 1,
                duration: 20,
                aoe: 250,
            },
            3: {
                armorBonusAmount: 17,
                castTime: 1,
                duration: 60,
                aoe: 400,
            },
            4: {
                armorBonusAmount: 22,
                castTime: 1,
                duration: 9999,
                aoe: 550,
            }
        }
    }));
    
    private readonly castSfx: string;
    private readonly effectSfxModel: string;
    private readonly EndureEffect: ITargetEffect<{ bonus: number }>

    constructor(
        data: EndureAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        dummyAbilityFactory: IDummyAbilityFactory,
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.effectSfxModel = data.effectSfxModel;
        
        let dummyEndureId = FourCC(data.dummyEndure.spellCodeId);
        this.EndureEffect = dummyAbilityFactory.CreateTargetEffect<{ bonus: number }>(dummyEndureId, data.dummyEndure.orderId, (prop, a, lvl) => {
            BlzSetAbilityRealLevelField(a, ABILITY_RLF_ARMOR_BONUS_UFA2, lvl - 1, prop.bonus);
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

            this.EndureEffect.Setup({
                level: lvl,
                bonus: data.armorBonusAmount,
            });

            for (let u of units) {
                this.EndureEffect.Cast(u);
            }

            let sfx = new Effect(this.effectSfxModel, targetPoint.x, targetPoint.y);
            sfx.scale = (0.0045 * data.aoe);
            sfx.destroy();

        }, (orderId, cb) => {

            castSfx.destroy();
            cb.Destroy();

            return false;
        });

        return true;
    }
    
    public GetUnitConfig = (unit: Unit, lvl?: number) => this.unitConfigurable.GetUnitConfig(unit).level[lvl || unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let damageBonus = string.format('%.0f', data.armorBonusAmount * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Endurees units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetFollowThrough(unit, lvl, data.castTime);
    }
}