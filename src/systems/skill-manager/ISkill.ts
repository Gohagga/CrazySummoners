import { Unit } from "w3ts";

export interface ISkill {

    UpdateUnitSkill(unit: Unit): void;

    AddToUnit(unit: Unit): boolean;

    RemoveFromUnit(unit: Unit): boolean;
}