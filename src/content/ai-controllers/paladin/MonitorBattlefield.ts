import { State, UpdateResult } from "systems/player-ai/State";

export interface IMonitorBattlefieldContext {
    allyUnitsByLane: number;
    enemyUnitsByLane: number;
    allyUnitsCount: number;
    enemyUnitsCount: number;
    allyUnitsTotalHp: number;
    enemyUnitsTotalHp: number;
}

export interface IMonitorBattlefieldController {
    getAllyUnitsByLane(): number;
    getEnemyUnitsByLane(): number;
    getAllyUnitsCount(): number;
    getEnemyUnitsCount(): number;
    getAllyUnitsTotalHp(): number;
    getEnemyUnitsTotalHp(): number;
}

export class MonitorBattlefield extends State<IMonitorBattlefieldContext, IMonitorBattlefieldController> {

    constructor(context: IMonitorBattlefieldContext, controller: IMonitorBattlefieldController) {
        super(MonitorBattlefield.name, context, controller);
    }

    update(): UpdateResult {
        // Retrieve game state information from the controller
        const allyUnitsByLane = this.controller.getAllyUnitsByLane();
        const enemyUnitsByLane = this.controller.getEnemyUnitsByLane();
        const allyUnitsCount = this.controller.getAllyUnitsCount();
        const enemyUnitsCount = this.controller.getEnemyUnitsCount();
        const allyUnitsTotalHp = this.controller.getAllyUnitsTotalHp();
        const enemyUnitsTotalHp = this.controller.getEnemyUnitsTotalHp();

        // Update context with game state information
        this.context.allyUnitsByLane = allyUnitsByLane;
        this.context.enemyUnitsByLane = enemyUnitsByLane;
        this.context.allyUnitsCount = allyUnitsCount;
        this.context.enemyUnitsCount = enemyUnitsCount;
        this.context.allyUnitsTotalHp = allyUnitsTotalHp;
        this.context.enemyUnitsTotalHp = enemyUnitsTotalHp;

        return UpdateResult.ContinueProcessing;
    }
}
