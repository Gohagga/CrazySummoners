import { Coords } from "systems/coords/Coords";
import { Unit } from "w3ts/handles/unit";

export interface IDelayedTargetEffect<ContextType> {
    Cast(origin: ICoords, target: Unit, level: number, context: ContextType, effect: (context: ContextType) => void): void;
}

export type ICoords = { x: number, y: number };