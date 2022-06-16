import { Log } from "systems/log/Log";
import { Destructable, Item, Rectangle, Unit } from "w3ts/index";
import { Coords } from "../coords/Coords";
import { IEnumUnitService } from "./IEnumUnitService";

export class EnumUnitService implements IEnumUnitService {

    group: group = CreateGroup();
    rect: Rectangle = new Rectangle(0, 0, 100, 100);

    EnumItemsInRange(originX: number, originY: number, radius: number, filter?: (target: Item, caster?: Unit) => boolean, source?: Unit): Item[] {
        
        const retVal: Item[] = [];
        const radiusSq = radius * radius;

        this.rect.setRect(0, 0, radius, radius);
        this.rect.move(originX, originY);
        EnumItemsInRect(this.rect.handle, null, () => {
            const item = Item.fromHandle(GetEnumItem());
            const x = item.x;
            const y = item.y;
            let distanceSq = (x-originX)*(x-originX) + (y-originY)*(y-originY);
            if (distanceSq < radiusSq) {
                if (!filter || filter(item, source)) {
                    retVal.push(item);
                }
            }
        });

        return retVal;
    }

    EnumDestructablesInRange(originX: number, originY: number, radius: number, filter?: (target: Destructable, caster?: Unit) => boolean, source?: Unit): Destructable[] {
        
        const retVal: Destructable[] = [];
        const radiusSq = radius * radius;

        this.rect.setRect(0, 0, radius, radius);
        this.rect.move(originX, originY);
        EnumDestructablesInRect(this.rect.handle, null, () => {
            const destr = Destructable.fromHandle(GetEnumDestructable());
            const x = destr.x;
            const y = destr.y;
            let distanceSq = (x-originX)*(x-originX) + (y-originY)*(y-originY);
            if (distanceSq < radiusSq) {
                if (!filter || filter(destr, source)) {
                    retVal.push(destr);
                }
            }
        });

        return retVal;
    }
    
    EnumUnitsInRange(origin: Coords, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[] {
        GroupEnumUnitsInRange(this.group, origin.x, origin.y, radius, null);
        const units: Unit[] = [];
        let u: unit;
        while ((u = FirstOfGroup(this.group)) != null) {
            GroupRemoveUnit(this.group, u);
            let U = Unit.fromHandle(u);
            if (!filter || filter(U, source)) {
                units.push(U);
            }
        }
        return units;
    }

    EnumUnitsInCone(origin: Coords, range: number, targetAngle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[] {
        
        const { x, y } = origin;
        const targets = this.EnumUnitsInRange(origin, range, filter, source);
        Log.Info("Found", targets.length, "viable targets");

        // type SortData = { index: number, angle: number, angleToTarget: number };
        // let sorted: SortData[] = [];
        let units: Unit[] = [];
        Log.Info("Angle range", targetAngle * bj_RADTODEG);

        for (let i = 0; i < targets.length; i++) {
            let unit = targets[i];
            let angle = math.atan(y - unit.y, x - unit.x) + math.pi;
            let angleNormalized = (angle + (math.pi - targetAngle)) % (math.pi*2);
            let min = math.abs(angleNormalized - math.pi);// math.pi - math.abs(math.abs(angle - angleTarget) - math.pi);
            if (min <= angleRange) {
                units.push(unit);
                // sorted.push({
                //     index: i,
                //     angle: angleNormalized,
                //     angleToTarget: min
                // });
            }
        }
        return units;
    }

    EnumUnitsInLine(origin: Coords, destination: Coords, width: number, filter?: (target: Unit, caster: Unit) => boolean): Unit[] {
        return [];
    }

    EnumUnitsInRect(rect: Rectangle, filter?: (target: Unit) => boolean, outResult?: Unit[]): Unit[] {
        if (!outResult) outResult = [];

        GroupEnumUnitsInRect(this.group, rect.handle, null);
        let u: unit | null;
        while ((u = FirstOfGroup(this.group)) != null) {
            GroupRemoveUnit(this.group, u);
            let U = Unit.fromHandle(u);
            if (!filter || filter(U)) {
                outResult.push(U);
            }
        }
        return outResult;
    }
}