import { AbilityBase } from "systems/abilities/AbilityBase";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { Trigger, Unit } from "w3ts";
import { OrderId } from "w3ts/globals/order";

export interface PaladinMasteryAbilityData extends Wc3AbilityData {
    chooseMasterySpellbookCodeId: string;
    choiceSpellCodeIds: {
        restoration: string,
        determination: string,
        repentance: string,
    };
    masteryPassiveCodeIds: {
        restoration: string,
        determination: string,
        repentance: string,
    };
}

export class PaladinMastery extends AbilityBase {

    private readonly chooseMasteryId: number;
    private readonly upgradedAbilities: Record<number, AbilityBase[]> = {};
    private readonly restorationChoiceId: number;
    private readonly determinationChoiceId: number;
    private readonly repentanceChoiceId: number;
    private readonly restorationMasteryId: number;
    private readonly determinationMasteryId: number;
    private readonly repentanceMasteryId: number;
    private readonly abilityUpgrade: Record<number, number> = {};

    constructor(
        data: PaladinMasteryAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        bonusLevelAbilities: {
            restoration: AbilityBase[],
            determination: AbilityBase[],
            repentance: AbilityBase[],
        }
    ) {
        super(data);

        this.chooseMasteryId = FourCC(data.chooseMasterySpellbookCodeId);

        this.restorationChoiceId = FourCC(data.choiceSpellCodeIds.restoration);
        this.determinationChoiceId = FourCC(data.choiceSpellCodeIds.determination);
        this.repentanceChoiceId = FourCC(data.choiceSpellCodeIds.repentance);

        this.restorationMasteryId = FourCC(data.masteryPassiveCodeIds.restoration);
        this.determinationMasteryId = FourCC(data.masteryPassiveCodeIds.determination);
        this.repentanceMasteryId = FourCC(data.masteryPassiveCodeIds.repentance);

        this.upgradedAbilities[this.restorationMasteryId] = bonusLevelAbilities.restoration;
        this.upgradedAbilities[this.determinationMasteryId] = bonusLevelAbilities.determination;
        this.upgradedAbilities[this.repentanceMasteryId] = bonusLevelAbilities.repentance;

        for (let ab of bonusLevelAbilities.restoration) {
            this.abilityUpgrade[ab.id] = this.restorationMasteryId;
        }
        for (let ab of bonusLevelAbilities.determination) {
            this.abilityUpgrade[ab.id] = this.restorationMasteryId;
        }
        for (let ab of bonusLevelAbilities.repentance) {
            this.abilityUpgrade[ab.id] = this.restorationMasteryId;
        }

        let trg = new Trigger();
        trg.registerAnyUnitEvent(EVENT_PLAYER_HERO_SKILL);
        trg.addAction(() => {
            if (GetLearnedSkill() != this.id) return;
            this.OnSkillUp();
        });

        abilityEventHandler.OnAbilityCast(this.restorationChoiceId, e => this.ExecuteOnMasteryChoice(e, this.restorationMasteryId));
        abilityEventHandler.OnAbilityCast(this.determinationChoiceId, e => this.ExecuteOnMasteryChoice(e, this.determinationMasteryId));
        abilityEventHandler.OnAbilityCast(this.repentanceChoiceId, e => this.ExecuteOnMasteryChoice(e, this.repentanceMasteryId));
    }

    AddHeroChooseMastery(u: Unit) {
        u.addAbility(this.chooseMasteryId);
    }

    ExecuteOnMasteryChoice(e: IAbilityEvent, gainedMasteryId: number): boolean {
        
        const caster = e.caster;
        let lvl = caster.getAbilityLevel(this.id);

        caster.issueImmediateOrder(OrderId.Stop);
        caster.removeAbility(this.chooseMasteryId);
        caster.addAbility(gainedMasteryId);

        caster.setAbilityLevel(gainedMasteryId, lvl);
        for (let ab of this.upgradedAbilities[gainedMasteryId]) {  
            caster.setAbilityLevel(ab.id, lvl + 1);
        }

        return true;
    }

    UpdateHeroAbilityLevel(u: Unit, abilityId: number): number {
        let upgradeId = this.abilityUpgrade[abilityId];
        if (!upgradeId) return 0;

        const lvl = u.getAbilityLevel(upgradeId) + 1;
        u.setAbilityLevel(abilityId, lvl);
        return lvl;
    }

    GetHeroAbilityLevel(u: Unit, abilityId: number): number {
        let upgradeId = this.abilityUpgrade[abilityId];
        if (!upgradeId) return 0;

        const lvl = u.getAbilityLevel(upgradeId) + 1;
        return lvl;
    }

    OnSkillUp(): void {

        const caster = Unit.fromEvent();
        let learnedMasteryId: number;
        const lvl = GetLearnedSkillLevel();

        if (caster.getAbilityLevel(this.restorationMasteryId) > 0) learnedMasteryId = this.restorationMasteryId;
        else if (caster.getAbilityLevel(this.determinationMasteryId) > 0) learnedMasteryId = this.determinationMasteryId;
        else if (caster.getAbilityLevel(this.repentanceMasteryId) > 0) learnedMasteryId = this.repentanceMasteryId;
        else return;

        caster.setAbilityLevel(learnedMasteryId, lvl);        
        for (let ab of this.upgradedAbilities[learnedMasteryId]) {  
            caster.setAbilityLevel(ab.id, lvl + 1);
        }
    }
    
    UpdateUnitSkill(unit: Unit): void {

        // let data = this.GetUnitConfig(unit);
//         let lvl = unit.getAbilityLevel(this.id);
//         let name = this.name + ' - ' + lvl;

//         let damageBonus = string.format('%.0f', data.damageBonusPercent * 100);
//         let castTime = string.format('%.1f', data.castTime);
//         let tooltip =
// `PaladinMasteryes units in range raising their damage by #red:${damageBonus}:#.|nLasts #blu:${data.duration}:# seconds

// #acc:Cast time: ${castTime} sec:#`
//         this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
//         this.SetFollowThrough(unit, lvl, data.castTime);
    }
}