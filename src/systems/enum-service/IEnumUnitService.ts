import { Destructable, Item, Rectangle, Unit } from "w3ts/index";
import { Coords } from "../coords/Coords";

export interface IEnumUnitService {

    EnumUnitsInRange(origin: Coords, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    /**Angles are all in radians.*/
    EnumUnitsInCone(origin: Coords, range: number, angle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    EnumUnitsInLine(origin: Coords, destination: Coords, width: number, filter?: (target: Unit, caster: Unit, source?: Unit) => boolean): Unit[];

    EnumDestructablesInRange(originX: number, originY: number, radius: number, filter?: (target: Destructable, caster?: Unit) => boolean, source?: Unit): Destructable[];

    EnumItemsInRange(originX: number, originY: number, radius: number, filter?: (target: Item, caster?: Unit) => boolean, source?: Unit): Item[];

    EnumUnitsInRect(rect: Rectangle, filter?: (target: Unit) => boolean, outResult?: Unit[]): Unit[];
}