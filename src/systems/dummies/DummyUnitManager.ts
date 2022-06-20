import { Log } from "systems/log/Log";
import { Unit, MapPlayer } from "w3ts";
import { IDummyUnitManager } from "./interfaces/IDummyUnitManager";

export interface DummyUnitManagerConfig {
    dummyUnitCodeId: string,
    dummyUnitOwnerPlayerId: number,
}

export class DummyUnitManager implements IDummyUnitManager {
    
    private readonly dummyPool: Unit[] = [];
    private readonly dummyTypeId: number;
    private readonly dummyOwner: MapPlayer;

    constructor(
        config: DummyUnitManagerConfig,
    ) {
        this.dummyTypeId = FourCC(config.dummyUnitCodeId);
        this.dummyOwner = MapPlayer.fromIndex(config.dummyUnitOwnerPlayerId);
    }

    GetDummy(): Unit {
        let dummy = this.dummyPool.pop();
        if (dummy) return dummy;

        dummy = new Unit(this.dummyOwner, this.dummyTypeId, 0, 0, 0);
        dummy.removeGuardPosition();
        return dummy;
    }

    RecycleDummy(unit: Unit): boolean {
        if (unit.typeId != this.dummyTypeId) {
            Log.Error("Cannot return dummy of typeId", unit.typeId);
            return false;
        }
        this.dummyPool.push(unit);
        return true;
    }
}