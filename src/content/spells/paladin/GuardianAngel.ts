import { Zones } from "content/constants/Zones";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { BattlegroundService } from "systems/battleground-service/BattlegroundService";
import { IDummyAbilityFactory } from "systems/dummies/interfaces/IDummyAbilityFactory";
import { IDummyUnitManager } from "systems/dummies/interfaces/IDummyUnitManager";
import { ITargetEffect } from "systems/dummies/interfaces/ITargetEffect";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { IGameEffects } from "systems/game-effects/IGameEffects";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Effect, Timer, Unit } from "w3ts";

type GuardianAngelUnitData = {
    level: Record<number, {
        duration: number,
        castTime: number,
    }>;
}

export interface GuardianAngelAbilityData extends OrbAbilityData {
    castSfx: string,
    effectSfx: string,
    auraArmorCodeId: string,
    auraArmorBuffCodeId: string,
}

export class GuardianAngel extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<GuardianAngelUnitData>(() => ({
        level: {
            1: {
                duration: 5.0,
                castTime: 3.25,
            },
            2: {
                duration: 7.0,
                castTime: 2.5,
            },
            3: {
                duration: 9.0,
                castTime: 1.75,
            },
            4: {
                duration: 11.0,
                castTime: 1,
            }
        }
    }));
    
    private readonly effectSfx: string;
    private readonly castSfx: string;
    private readonly auraArmorSpellId: number;
    private readonly auraArmorBuffId: number;

    constructor(
        data: GuardianAngelAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly spellcastingService: SpellcastingService,
        private readonly enumService: IEnumUnitService,
        private readonly battlegroundService: BattlegroundService,
        private readonly gameEffects: IGameEffects,
        private readonly dummyUnitManager: IDummyUnitManager
    ) {
        super(data);

        this.effectSfx = data.effectSfx;
        this.castSfx = data.castSfx;
        this.auraArmorSpellId = FourCC(data.auraArmorCodeId);
        this.auraArmorBuffId = FourCC(data.auraArmorBuffCodeId);
        
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

            let playArea = this.battlegroundService.GetPlayAreaRect();
            let {centerX, centerY } = playArea;

            let auraDummy = this.dummyUnitManager.CreateDummy(centerX, centerY, owner);
            auraDummy.addAbility(this.auraArmorSpellId);
            auraDummy.applyTimedLife(FourCC('B000'), data.duration);
            auraDummy.setScale(10, 10, 1);
            
            let units = this.enumService.EnumUnitsInZone(Zones.Battleground, target =>
                   (target.isUnitType(UNIT_TYPE_STRUCTURE) == false)
                && (target.isUnitType(UNIT_TYPE_MAGIC_IMMUNE) == false)
                && (target.isUnitType(UNIT_TYPE_MECHANICAL) == false)
                && (target.isAlly(owner)
                && (target.isAlive()
                && (GetWidgetLife(target.handle) > 0.405))));

            for (let u of units) {
                new Effect(this.effectSfx, u, 'origin');
            }

            new Timer().start(data.duration, false, () => {
                Timer.fromExpired().destroy();
                for (let u of units) {
                    if (u.isAlive()) u.removeAbility(this.auraArmorBuffId);
                } 
            });

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

        let damageBonus = string.format('%.0f', data.duration * 100);
        let castTime = string.format('%.1f', data.castTime);
        let tooltip =
`GuardianAngeles units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

#acc:Cast time: ${castTime} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetFollowThrough(unit, lvl, data.castTime);
    }
}