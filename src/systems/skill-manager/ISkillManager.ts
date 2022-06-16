import { Unit } from "w3ts";
import { ISkill } from "./ISkill";

export interface ISkillManager {
    
    UnitAddSkill(unit: Unit, skill: ISkill): boolean;

    UnitRemoveSkill(unit: Unit, skill: ISkill): boolean;

    UpdateUnitSkills(unit: Unit): void;
}