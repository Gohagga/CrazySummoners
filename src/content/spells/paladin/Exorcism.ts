import { Zones } from "content/constants/Zones";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { BattlegroundService } from "systems/battleground-service/BattlegroundService";
import { UnitTypeService } from "systems/classification-service/UnitTypeService";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { IDummyUnitManager } from "systems/dummies/interfaces/IDummyUnitManager";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { IGameEffects } from "systems/game-effects/IGameEffects";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Timer, Unit } from "w3ts";
import { OrderId } from "w3ts/globals/order";

type ExorcismUnitData = {
    level: Record<number, {
        hpPerTick: number,
        hitsPerTick: number,
        minimumHealth: number,
        duration: number,
        channelTime: number,
    }>;
}

export interface ExorcismAbilityData extends OrbAbilityData {
    castSfx: string,
    killSfx: string,
    damageSfx: string,
    damageTickDuration: number,
}

export class Exorcism extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<ExorcismUnitData>(() => ({
        level: {
            1: {
                hpPerTick: 1,
                hitsPerTick: 1,
                minimumHealth: 4,
                duration: 5.0,
                channelTime: 3.25,
            },
            2: {
                hpPerTick: 0.5,
                hitsPerTick: 2,
                minimumHealth: 4,
                duration: 7.0,
                channelTime: 2.5,
            },
            3: {
                hpPerTick: 0.25,
                hitsPerTick: 2,
                minimumHealth: 4,
                duration: 9.0,
                channelTime: 1.75,
            },
            4: {
                hpPerTick: 0,
                hitsPerTick: 3,
                minimumHealth: 4,
                duration: 11.0,
                channelTime: 1,
            }
        }
    }));
    
    private readonly castSfx: string;
    private readonly killSfx: string;
    private readonly damageSfx: string;
    private readonly damageTickDuration: number;

    constructor(
        data: ExorcismAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        private readonly unitTypeService: UnitTypeService
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.killSfx = data.killSfx;
        this.damageSfx = data.damageSfx;
        this.damageTickDuration = data.damageTickDuration;
        
        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }

    Execute(e: IAbilityEvent): boolean {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);
        let target = e.targetUnit;
        let targetPoint = e.targetPoint;
        if (!target) return false;

        const crystal = target;
        const owner = caster.owner;
        const ownerId = owner.id;
        const data = this.unitConfigurable.GetUnitConfig(caster).level[lvl];

        if (false == this.resourceBarManager.Get(ownerId).Consume(this.orbCost)) return false;

        let castSfx = new Effect(this.castSfx, caster, 'origin');
        
        let hitBuffer = 0;
        let exorcismPeriodic = new Timer().start(this.damageTickDuration, true, () => {

            print("tick")
            let unitWasKilled = false;
            if (hitBuffer <= 0) {
                hitBuffer += data.hitsPerTick;
            }

            let units: Unit[] = [];
            try {
                units = this.enumService.EnumUnitsInZone(Zones.Battleground, target =>
                    (this.unitTypeService.IsDemon(target)
                        || this.unitTypeService.IsHorror(target)
                        || this.unitTypeService.IsUndead(target))
                    && target.isUnitType(UNIT_TYPE_STRUCTURE) == false
                    && target.isUnitType(UNIT_TYPE_MAGIC_IMMUNE) == false
                    && target.isUnitType(UNIT_TYPE_MECHANICAL) == false
                    && GetWidgetLife(target.handle) > 0.405);
                    
            } catch (ex) {
                print(ex);
            }
                
            print("found units", units.length);

            while (hitBuffer > 0) {
                let u = units.pop();
                if (!u) break;

                new Effect(this.damageSfx, u.x, u.y).destroy();
                u.applyTimedLife(FourCC('B000'), 0.6);
                new Effect(this.killSfx, u, 'chest').destroy();

                unitWasKilled = true;
                hitBuffer--;
            }

            if (unitWasKilled) {
                caster.damageTarget(caster.handle, data.hpPerTick, false, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_MAGIC, WEAPON_TYPE_WHOKNOWS);
            }
            if (GetWidgetLife(caster.handle) < data.minimumHealth) {
                caster.issueImmediateOrder(OrderId.Stop);
            }
        });

        this.spellcastingService.ChannelSpell(caster, this.id, data.channelTime, cb => {
            castSfx.destroy();

            exorcismPeriodic.destroy();

        }, (orderId, cb) => {

            castSfx.destroy();
            cb.Destroy();
            exorcismPeriodic.destroy();

            return false;
        });

        return true;
    }
    
    public GetUnitConfig = (unit: Unit, lvl?: number) => this.unitConfigurable.GetUnitConfig(unit).level[lvl || unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let damageBonus = string.format('%.0f', data.duration * 100);
        let castTime = string.format('%.1f', data.channelTime);
        let tooltip =
`Exorcismes units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetFollowThrough(unit, lvl, data.channelTime);
    }
}