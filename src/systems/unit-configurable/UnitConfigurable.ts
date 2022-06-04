import { Unit } from "w3ts/handles/unit";
import { IUnitConfigurable } from "./IUnitConfigurable";

export class UnitConfigurable<T> implements IUnitConfigurable<T>{

    private instances: Record<number, T> = {};

    constructor(
        private readonly defaultValue: () => T
    ) { }

    public GetUnitConfig(unit: Unit): T {
        const id = unit.id;
        if (id in this.instances == false) {
            this.instances[id] = this.defaultValue();
        }
        return this.instances[id];
    }

    public UpdateUnitConfig(unit: Unit, cb: (config: T) => void) {
        const id = unit.id;
        let config: T;
        if (id in this.instances == false) {
            config = this.defaultValue();
        } else {
            config = this.instances[id];
        }
        cb(config);
        this.instances[id] = config;
    }
}