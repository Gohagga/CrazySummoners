import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { BattlegroundService } from "systems/battleground-service/BattlegroundService";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { IGameEffects } from "systems/game-effects/IGameEffects";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Unit } from "w3ts";

type RedemptionUnitData = {
    level: Record<number, {
        healPercent: number,
        revivePercent: number,
        castTime: number,
    }>;
}

export interface RedemptionAbilityData extends OrbAbilityData {
    castSfx: string,
    resurrectSfx: string,
    healSfx: string,
}

export class Redemption extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<RedemptionUnitData>(() => ({
        level: {
            1: {
                healPercent: 0.1,
                revivePercent: 0.25,
                castTime: 3,
            },
            2: {
                healPercent: 0.2,
                revivePercent: 0.35,
                castTime: 2.5,
            },
            3: {
                healPercent: 0.2,
                revivePercent: 0.45,
                castTime: 2,
            },
            4: {
                healPercent: 0.2,
                revivePercent: 0.45,
                castTime: 2,
            }
        }
    }));
    
    private readonly castSfx: string;
    private readonly resurrectSfx: string;
    private readonly healSfx: string;

    constructor(
        data: RedemptionAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        private readonly battlegroundService: BattlegroundService,
        private readonly gameEffects: IGameEffects
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.resurrectSfx = data.resurrectSfx;
        this.healSfx = data.healSfx;
        
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

        let castSfx = new Effect(this.castSfx, caster, 'origin');
        this.spellcastingService.CastSpell(caster, this.id, data.castTime, cb => {
            cb.Finish();
            castSfx.destroy();

            if (false == this.resourceBarManager.Get(ownerId).Consume(this.orbCost)) return;

            let zone = this.battlegroundService.GetUnitZone(crystal);
            if (!zone) return;
            
            let units = this.enumService.EnumUnitsInZone(zone);

            for (let u of units) {
                if (u.life <= 0.405 || u.isUnitType(UNIT_TYPE_DEAD)) {
                    u = this.gameEffects.ReviveUnit(caster, u, owner);
                    this.gameEffects.HealUnit(caster, u, u.maxLife * data.revivePercent);
                    new Effect(this.resurrectSfx, u, 'origin').destroy();
                } else {
                    this.gameEffects.HealUnit(caster, u, u.maxLife * data.healPercent);
                    new Effect(this.healSfx, u, 'origin').destroy();
                }
            }

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

        let damageBonus = string.format('%.0f', data.healPercent * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`Redemptiones units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${0}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetFollowThrough(unit, lvl, data.castTime);
    }
}