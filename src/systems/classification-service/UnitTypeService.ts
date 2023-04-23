import { Units } from "content/constants/Units";
import { UnitType } from "content/constants/UnitType";
import { Unit } from "w3ts";
import { ClassificationService } from "./ClassificationService";

export interface UnitTypeServiceConfig {
    unitTypeClass: Record<Units, UnitType>;
}

export class UnitTypeService {

    constructor(
        config: UnitTypeServiceConfig,
        private readonly classificationService: ClassificationService<UnitType>,
    ) {
        this.classificationService = new ClassificationService<UnitType>();
        for (let k of Object.keys(config.unitTypeClass)) {
            let type = FourCC(k);
            this.classificationService.Set(type, config.unitTypeClass[<Units>k]);
        }
    }

    public GetUnitType(unitOrTypeId: Unit | number): UnitType {
        if (typeof(unitOrTypeId) == 'number') return this.classificationService.Get(unitOrTypeId) || UnitType.Untyped;
        return this.classificationService.Get(unitOrTypeId.typeId) || UnitType.Untyped;
    }

    public IsUndead(unit: Unit): boolean;
    public IsUndead(unitTypeId: number): boolean;
    public IsUndead(unitOrTypeId: Unit | number): boolean {
        return UnitType.Undead == (UnitType.Undead & this.GetUnitType(unitOrTypeId));
    }

    public IsDemon(unit: Unit): boolean;
    public IsDemon(unitTypeId: number): boolean;
    public IsDemon(unitOrTypeId: Unit | number): boolean {
        return UnitType.Demon == (UnitType.Demon & this.GetUnitType(unitOrTypeId));
    }

    public IsHuman(unit: Unit): boolean;
    public IsHuman(unitTypeId: number): boolean;
    public IsHuman(unitOrTypeId: Unit | number): boolean {
        return UnitType.Human == (UnitType.Undead & this.GetUnitType(unitOrTypeId));
    }

    public IsHorror(unit: Unit): boolean;
    public IsHorror(unitTypeId: number): boolean;
    public IsHorror(unitOrTypeId: Unit | number): boolean {
        return UnitType.Horror == (UnitType.Horror & this.GetUnitType(unitOrTypeId));
    }

    public IsElemental(unit: Unit): boolean;
    public IsElemental(unitTypeId: number): boolean;
    public IsElemental(unitOrTypeId: Unit | number): boolean {
        return UnitType.Elemental == (UnitType.Elemental & this.GetUnitType(unitOrTypeId));
    }
}