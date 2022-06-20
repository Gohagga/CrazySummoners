import { Destructable, Item, Rectangle, Unit } from "w3ts/index";
import { Coords } from "../coords/Coords";

export interface IEnumUnitService {

    EnumUnitsInRange(origin: ICoords, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    /**Angles are all in radians.*/
    EnumUnitsInCone(origin: ICoords, range: number, angle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    EnumUnitsInLine(origin: ICoords, destination: ICoords, width: number, filter?: (target: Unit, caster: Unit, source?: Unit) => boolean): Unit[];

    EnumDestructablesInRange(originX: number, originY: number, radius: number, filter?: (target: Destructable, caster?: Unit) => boolean, source?: Unit): Destructable[];

    EnumItemsInRange(originX: number, originY: number, radius: number, filter?: (target: Item, caster?: Unit) => boolean, source?: Unit): Item[];

    EnumUnitsInRect(rect: Rectangle, filter?: (target: Unit) => boolean, outResult?: Unit[]): Unit[];
}

export type ICoords = {
    x: number,
    y: number,
}