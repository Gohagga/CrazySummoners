import { Unit } from "w3ts/handles/unit";

export interface IDummyUnitManager {

    GetDummy(): Unit;

    RecycleDummy(unit: Unit): boolean;
}