import { ICoords } from "systems/coords/ICoords";
import { MapPlayer } from "w3ts";
import { Unit } from "w3ts/handles/unit";

export interface IDummyUnitManager {

    GetDummy(): Unit;

    CreateDummy(x: number, y: number, owner?: MapPlayer, face?: number): Unit;

    RecycleDummy(unit: Unit): boolean;
}