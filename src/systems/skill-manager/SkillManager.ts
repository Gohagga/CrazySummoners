import { Trigger, Unit } from "w3ts";
import { ISkill } from "./ISkill";
import { ISkillManager } from "./ISkillManager";

export class SkillManager implements ISkillManager {

    private readonly heroSkills: Record<number, ISkill[]> = {};

    constructor() {
        const abilityLevelUpTrigger = new Trigger();
        abilityLevelUpTrigger.registerAnyUnitEvent(EVENT_PLAYER_HERO_SKILL);
        abilityLevelUpTrigger.addAction(() => {
            this.UpdateUnitSkills(Unit.fromEvent());
        });
    }

    UnitAddSkill(unit: Unit, skill: ISkill) {
        
        const unitId = unit.id;
        if (unitId in this.heroSkills == false)
            this.heroSkills[unitId] = [];

        this.heroSkills[unitId].push(skill);
        return skill.AddToUnit(unit);
    }

    UnitRemoveSkill(unit: Unit, skill: ISkill) {
        
        const unitId = unit.id;
        if (unitId in this.heroSkills && this.heroSkills[unitId].length > 0) {

            for (let i = 0; i < this.heroSkills[unitId].length; i++) {
                if (this.heroSkills[unitId][i] == skill) {
                    this.heroSkills[unitId][i] = this.heroSkills[unitId][this.heroSkills[unitId].length - 1];
                    this.heroSkills[unitId].pop();
                }
            }
        }
        
        return skill.RemoveFromUnit(unit);
    }

    UpdateUnitSkills(unit: Unit) {
        const unitId = unit.id;
        if (unitId in this.heroSkills == false || this.heroSkills[unitId].length == 0) return;
        
        for (let i = 0; i < this.heroSkills[unitId].length; i++) {
            this.heroSkills[unitId][i].UpdateUnitSkill(unit);
        }
    }
}

