import { MapPlayer, Unit } from "w3ts";
import { IRequirement } from "./IRequirement";

export class UnitRequirement implements IRequirement {

    private readonly unitTypeIds: number[];

    private readonly instances: Record<number, UnitReqInstance> = {};
    private readonly subscriptions: ((player: MapPlayer) => void)[] = [];

    constructor(
        private name: string,
        unitTypeCodes: string[],
    ) {
        this.unitTypeIds = [];
        for (let i = 0; i < unitTypeCodes.length; i++) {
            this.unitTypeIds[i + 1] = FourCC(unitTypeCodes[i]);
        }
    }

    Get(player: MapPlayer): number {
        let req = this.instances[player.id];
        if (!req) return 0;
        return req.level || 0;
    }

    Increase(player: MapPlayer, amount: number = 1): number {
        
        const playerId = player.id;
        const instance: UnitReqInstance = this.instances[playerId] || {
            level: 0,
            unit: []
        };

        const targetLvl = instance.level + amount;
        if (targetLvl < instance.level) return 0;
        for (let i = instance.level + 1; i <= targetLvl; i++) {
            instance.level++;
        }

        this.instances[playerId] = instance;
        this.RunSubscriptions(player);

        return targetLvl;
    }

    Decrease(player: MapPlayer, amount: number = 1): number {
        
        const playerId = player.id;
        const instance: UnitReqInstance = this.instances[playerId] || {
            level: 0,
            unit: []
        };

        const targetLvl = instance.level - amount;

        if (targetLvl > instance.level) return 0;

        for (let i = instance.level; i > targetLvl; i--) {
            instance.level--;
        }

        this.instances[playerId] = instance;
        this.RunSubscriptions(player);
        return targetLvl;
    }

    Set(player: MapPlayer, amount: number): boolean {
        throw new Error("Method not implemented.");
    }

    OnChange(callback: (player: MapPlayer) => void): void {
        this.subscriptions.push(callback);
    }

    private RunSubscriptions(player: MapPlayer) {
        for (let sub of this.subscriptions) {
            sub(player);
        }
    }
}

type UnitReqInstance = {
    level: number,
    unit: Unit[]
}