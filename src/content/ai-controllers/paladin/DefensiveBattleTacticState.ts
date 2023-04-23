import { UnitType } from "content/constants/UnitType";
import { Log } from "systems/log/Log";
import { ParentState } from "systems/player-ai/ParentState";
import { UpdateResult } from "systems/player-ai/State";
import { BattlefieldLane, IBattlefieldDataController } from "../common/IBattlefieldData";

export interface DefensiveBattleTacticContext {
    targetLane: number;
    outputLane: string | null;
}

export interface DefensiveBattleTacticController extends IBattlefieldDataController {

}

export class DefensiveBattleTacticState extends ParentState<DefensiveBattleTacticContext, DefensiveBattleTacticController> {

    constructor(context: DefensiveBattleTacticContext, controller: DefensiveBattleTacticController,
        name?: string
    ) {
        super(name ?? DefensiveBattleTacticState.name, context, controller);
    }

    override onEnter(): void {
        Log.Debug("onEnter", this.name);
        this.context.outputLane = null;
    }

    update(): UpdateResult {
        try {
            Log.Debug("update", this.name);

            // Gather data
            const battleData = this.controller.getBattlefieldData();

            if (this.context.outputLane != null) {
                Log.Debug("ContinueProcessing", this.name, this.context.outputLane);
                super.update();
                return UpdateResult.ContinueProcessing;
            }

            // If there is nothing to defend, we should switch to another battle tactic
            Log.Debug("lowestPowerRatio", this.name, battleData.lowestPowerRatio);
            if (battleData.lowestPowerRatio >= 1) {
                return UpdateResult.RunImmediateUpdate;
            }

            Log.Debug("update Calculating lane to defend");
            let worstLane: BattlefieldLane | null = null;
            let worstLaneDiff: number = 99;
            for (let laneData of battleData.laneData) {
                const powerDiff = laneData.allyTroopPower - laneData.enemyTroopPower;
                if (powerDiff < worstLaneDiff) {
                    worstLaneDiff = powerDiff;
                    worstLane = laneData;
                }
            }
            Log.Debug("update TargetLane", worstLane && worstLane.laneId);

            if (worstLane == null) {
                return UpdateResult.ContinueProcessing;
            }

            this.context.targetLane = worstLane.laneId;
            super.update();

            return UpdateResult.RunImmediateUpdate;
        } catch (ex: any) { Log.Error(ex); }
        return UpdateResult.ContinueProcessing;
    }

}