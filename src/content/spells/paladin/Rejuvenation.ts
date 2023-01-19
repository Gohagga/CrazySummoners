import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { IUnitConfigurable } from "systems/unit-configurable/IUnitConfigurable";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Timer, Unit } from "w3ts";

type RejuvenateUnitData = {
    level: Record<number, {
        targetCount: number,
        healPercent: number,
        channelTime: number,
        healInterval: number,
        aoe: number,
    }>;
}

export interface RejuvenateAbilityData extends OrbAbilityData {
    healSfxModel: string;
    castSfx: string;
}

export class Rejuvenate extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<RejuvenateUnitData>(() => ({
        level: {
            1: {
                targetCount: 1,
                healPercent: 0.25,
                channelTime: 5,
                healInterval: 1.2,
                aoe: 300,
            },
            2: {
                targetCount: 2,
                healPercent: 0.25,
                channelTime: 5,
                healInterval: 1.2,
                aoe: 400,
            },
            3: {
                targetCount: 3,
                healPercent: 0.25,
                channelTime: 5,
                healInterval: 1.2,
                aoe: 400,
            }
        }
    }));

    private readonly castSfx: string;
    private readonly healSfxModel: string;

    constructor(
        data: RejuvenateAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
    ) {
        super(data);

        this.castSfx = data.castSfx;
        this.healSfxModel = data.healSfxModel;

        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }

    Execute(e: IAbilityEvent): void {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);
        const targetPoint = e.targetPoint;

        const owner = caster.owner;
        const ownerId = owner.id;
        const data = this.unitConfigurable.GetUnitConfig(caster).level[lvl];

        if (false == this.resourceBarManager.Get(ownerId).Consume(this.orbCost)) return;

        let castSfx = new Effect(this.castSfx, caster, 'origin');
        let healTimer = new Timer();
        healTimer.start(data.healInterval, true, () => {

            let units = this.enumService.EnumUnitsInRange(targetPoint, data.aoe, target =>
                target.isAlly(owner));

            units.sort((a: Unit, b: Unit) => a.life - b.life);

            for (let i = 0; i < units.length && i < data.targetCount; i++) {
                let u = units[i];
                SetWidgetLife(u.handle, u.life + data.healPercent * u.maxLife);
                new Effect(this.healSfxModel, u, 'origin').destroy();
            }
        });

        this.spellcastingService.CastSpell(caster, this.id, data.channelTime, cb => {
            cb.Finish();
            castSfx.destroy();
            healTimer.destroy();

        }, (orderId, cb) => {
            castSfx.destroy();
            cb.Destroy();
            healTimer.destroy();

            return false;
        });
    }
    
    public GetUnitConfig = (unit: Unit) => this.unitConfigurable.GetUnitConfig(unit).level[unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let healPercent = string.format('%.1f', data.healPercent * 100);
        let channelTime = string.format('%.1f', data.channelTime);
        let tooltip =
`Heals #red:${data.targetCount}:# most damaged unit in area for ${healPercent}% their max hp repeatedly.

#acc:Channel time: ${channelTime} sec:#`;

        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
    }
}