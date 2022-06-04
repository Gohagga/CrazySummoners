import { Unit } from "w3ts/handles/unit";

export interface IUnitConfigurable<T> {

    GetUnitConfig(unit: Unit): T;

    UpdateUnitConfig(unit: Unit, cb: (config: T) => void): void;
}