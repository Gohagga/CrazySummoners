import { Log } from "systems/log/Log";
import { State, UpdateResult } from "systems/player-ai/State";
import { Unit } from "w3ts";

export interface ISummonUnitContext {
    targetLane: number;
    isSummonUnitDone: boolean;
}

export interface ISummonUnitController {
    issueSummonUnitCommand(unitType: string, lane: number): number;
    getCommandStatus(id: number): 'notStarted' | 'started' | 'done';
}

export class SummonUnitState extends State<ISummonUnitContext, ISummonUnitController> {
    private commandId: number = 0;
    private unitType: string;

    constructor(context: ISummonUnitContext, controller: ISummonUnitController, unitType: string, name?: string) {
        super(name || SummonUnitState.name, context, controller);
        this.unitType = unitType;
    }

    update(): UpdateResult {
        if (this.commandId == 0) {
            this.commandId = this.controller.issueSummonUnitCommand(this.unitType, this.context.targetLane);
        } else {
            const status = this.controller.getCommandStatus(this.commandId);

            if (status == 'notStarted') {
                this.commandId = 0;
            }

            this.context.isSummonUnitDone = status == 'done';
            Log.Debug("update Setting isSummonUnitDone", this.context.isSummonUnitDone);
        }

        if (this.context.isSummonUnitDone) return UpdateResult.RunImmediateUpdate;
        return UpdateResult.ContinueProcessing;
    }

    override onEnter(): void {
        // const { unitType, lane } = this.context;
        // this.commandId = this.controller.issueSummonUnitCommand(unitType, lane);
        this.context.isSummonUnitDone = false;
        this.commandId = 0;
        Log.Debug("onEnter Setting isSummonUnitDone", this.context.isSummonUnitDone);
    }
}