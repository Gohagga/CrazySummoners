import { UnitType } from "content/constants/UnitType";
import { Zones } from "content/constants/Zones";
import { Unit } from "w3ts";

export interface IBattlefieldDataController {
    getBattlefieldData(): BattlefieldData;
    getBattlefieldLane(laneId: number): BattlefieldLane;
}

export type BattlefieldLane = {
    laneId: Zones;
    allyUnits: BattlefieldUnit[];
    enemyUnits: BattlefieldUnit[];
    enemyTroopPower: number;
    allyTroopPower: number;
    /**Less than 1 means losing, more than 1 means winning*/
    powerRatio: number;
}

export type BattlefieldData = {
    laneData: BattlefieldLane[];
    highestPowerRatio: number;
    lowestPowerRatio: number;
    averagePowerRatio: number;
}

export type BattlefieldUnit = {
    unit: Unit;
    hpPercent: number;
    lvl: number;
    unitType: UnitType;
    isRanged: boolean;
    troopPower: number;
}