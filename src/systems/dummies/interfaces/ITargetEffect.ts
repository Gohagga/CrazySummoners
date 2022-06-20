import { Coords } from "systems/coords/Coords";
import { Unit } from "w3ts/handles/unit";

export interface ITargetEffect<Properties> {
    Cast(target: Unit, level?: number, origin?: ICoords): void;

    Setup(properties: Properties & TargetEffectProperties): ITargetEffect<Properties>;
}

export type ICoords = { x: number, y: number };

export interface TargetEffectProperties {
    level: number,
    origin?: ICoords,
}