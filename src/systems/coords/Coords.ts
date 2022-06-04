import { Point, Unit } from "w3ts";

export class Coords {

    private _point: Point | null = null;

    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) {
    }

    static fromUnit(unit: Unit) {
        return new Coords(unit.x, unit.y);
    }

    static fromWc3Unit(unit: unit) {
        return new Coords(GetUnitX(unit), GetUnitY(unit));
    }

    get point(): Point {
        if (!this._point) this._point = new Point(this.x, this.y);
        return this._point;
    }
}