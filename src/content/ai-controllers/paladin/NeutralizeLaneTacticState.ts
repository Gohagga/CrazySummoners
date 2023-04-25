import { UnitType } from "content/constants/UnitType";
import { Log } from "systems/log/Log";
import { ParentState } from "systems/player-ai/ParentState";
import { UpdateResult } from "systems/player-ai/State";
import { IBattlefieldDataController } from "../common/IBattlefieldData";
import { IAiStats } from "../common/IAiStats";
import { PaladinAction } from "../PaladinAiController";

export interface NeutralizeLaneTacticContext extends IAiStats {
    targetLane: number;
    outputLane: string | null;
}

export interface NeutralizeLaneTacticController extends IBattlefieldDataController {
    getTimeUntilLaneManeuverAvailable(lane: number, ...action: string[]): number;
    getActionValue(action: string, lane?: number): number;
    isActionEnabled(action: string): boolean;
}

export class NeutralizeLaneTacticState extends ParentState<NeutralizeLaneTacticContext, NeutralizeLaneTacticController> {

    constructor(context: NeutralizeLaneTacticContext, controller: NeutralizeLaneTacticController,
        name?: string
    ) {
        super(name ?? NeutralizeLaneTacticState.name, context, controller);
    }

    override onEnter(): void {
    }

    update(): UpdateResult {
        try {
            Log.Debug("update", this.name);
            // Gather data
            const laneData = this.controller.getBattlefieldLane(this.context.targetLane);

            let rangedAllyCount = 0;
            let allyUnitCount = laneData.allyUnits.length;
            let enemyUnitCount = laneData.enemyUnits.length;
            const enemyPowerDiff = laneData.enemyTroopPower - laneData.allyTroopPower;

            for (let au of laneData.allyUnits) {
                if (au.isRanged) rangedAllyCount++;
            }

            // Finish condition
            Log.Info("Power", laneData.allyTroopPower, laneData.enemyTroopPower);
            if (laneData.allyTroopPower >= laneData.enemyTroopPower * 0.85) {
                this.context.outputLane = null;
                Log.Debug("update finish", this.name, UpdateResult.RunImmediateUpdate);
                super.update();
                return UpdateResult.RunImmediateUpdate;
            }

            let availableActions: { action: string, value: number }[] = [];
            if (this.controller.isActionEnabled(PaladinAction.rejuvenate) &&
                this.controller.getTimeUntilLaneManeuverAvailable(this.context.targetLane, PaladinAction.rejuvenate) <= 2) {

                let value = this.controller.getActionValue(PaladinAction.rejuvenate, this.context.targetLane);
                Log.Debug("Rejuv", value, enemyPowerDiff);
                if (value >= enemyPowerDiff * 0.5) availableActions.push({
                    action: PaladinAction.rejuvenate,
                    value: value,
                });
            }
            if (this.controller.isActionEnabled(PaladinAction.bless) && 
                this.controller.getTimeUntilLaneManeuverAvailable(this.context.targetLane, PaladinAction.bless) <= 2) {

                let value = this.controller.getActionValue(PaladinAction.bless, this.context.targetLane);
                Log.Debug("Bless", value, enemyPowerDiff);
                if (value >= enemyPowerDiff * 0.5) availableActions.push({
                    action: PaladinAction.bless,
                    value: this.controller.getActionValue(PaladinAction.bless),
                });
            }
            
            let meleeValue = this.controller.getActionValue(PaladinAction.summonMelee);
            let rangedValue = this.controller.getActionValue(PaladinAction.summonRanged);
            if (this.controller.getTimeUntilLaneManeuverAvailable(this.context.targetLane, PaladinAction.summonMelee) <= 2) {

                availableActions.push({
                    action: PaladinAction.summonMelee,
                    value: meleeValue,
                });
                availableActions.push({
                    action: PaladinAction.summonRanged,
                    value: rangedValue,
                });
            }

            availableActions.sort((a, b) => a.value - b.value);
            Log.Info("Considering Actions", availableActions.length);
            for (let a of availableActions) {
                Log.Info("Considering action", a.action, a.value);
            }

            // Check resources
            if (availableActions.length == 0) {
                this.context.outputLane = 'nothing';
                Log.Debug("update resources", this.name, UpdateResult.ContinueProcessing);
                super.update();
                return UpdateResult.ContinueProcessing;
            }

            let best = availableActions[0];
            if (best.action.startsWith('summon')) {
                this.PerformSummoning(allyUnitCount, rangedAllyCount, meleeValue, rangedValue);

            } else {
                this.context.outputLane = best.action;
            }

            super.update();
        } catch (ex: any) { Log.Error(ex); }
        return UpdateResult.ContinueProcessing;
    }

    private PerformSummoning(allyUnitCount: number, rangedAllyCount: number, meleeValue: number, rangedValue: number) {
        let meleeRangedPowerRatio = meleeValue / rangedValue; // Higher than 1 => melee are stronger, lower than 1 => ranged are stronger

        // If hero is focused on leveling one type, keep summoning that
        if (meleeRangedPowerRatio <= 0.5)
            this.context.outputLane = 'summonRanged';
        else if (meleeRangedPowerRatio >= 1.5)
            this.context.outputLane = 'summonMelee';
        else {
            let meleeAllyCount = allyUnitCount - rangedAllyCount;
            let wantedMeleeRatio = 0.5 * meleeRangedPowerRatio;

            // If there are much more melees, summon some ranged
            if (meleeAllyCount > allyUnitCount * wantedMeleeRatio)
                this.context.outputLane = 'summonRanged';

            else
                this.context.outputLane = 'summonMelee';
        }
    }
}