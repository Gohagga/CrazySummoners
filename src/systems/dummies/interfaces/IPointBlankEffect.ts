import { Coords } from "systems/coords/Coords";
import { MapPlayer } from "w3ts";
import { Unit } from "w3ts/handles/unit";

export interface IPointBlankEffect<Properties> {
    Cast(origin: ICoords, level?: number): void;

    Setup(properties: Properties & EffectProperties): IPointBlankEffect<Properties>;
}

export type ICoords = { x: number, y: number };

export interface EffectProperties {
    origin?: ICoords,
    castingPlayer?: MapPlayer,
    level: number,
}