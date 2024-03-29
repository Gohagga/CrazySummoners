import { Coords } from "systems/coords/Coords";
import { MapPlayer } from "w3ts";
import { Unit } from "w3ts/handles/unit";

export interface IPointEffect<Properties> {
    Cast(targetPoint: ICoords, level?: number, origin?: ICoords): void;

    Setup(properties: Properties & EffectProperties): IPointEffect<Properties>;
}

export type ICoords = { x: number, y: number };

export interface EffectProperties {
    level: number,
    origin?: ICoords,
    castingPlayer?: MapPlayer,
}