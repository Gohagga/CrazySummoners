import { UnitType } from "content/constants/UnitType";
import { Log } from "systems/log/Log";
import { ParentState } from "systems/player-ai/ParentState";
import { UpdateResult } from "systems/player-ai/State";
import { IBattlefieldDataController } from "../common/IBattlefieldData";

export interface NeutralizeLaneTacticContext {
    targetLane: number;

    enemyUnitCount: number;
    allyUnitCount: number;
    enemyTroopPower: number;
    allyTroopPower: number;
    currentManeuverStep: number;
    currentManeuver: number;

    outputLane: string | null;
}

export interface NeutralizeLaneTacticController extends IBattlefieldDataController {
    getTimeUntilLaneManeuverAvailable(lane: number, ...action: string[]): number;
    getActionValue(action: string, lane?: number): number;
}

export class NeutralizeLaneTacticState extends ParentState<NeutralizeLaneTacticContext, NeutralizeLaneTacticController> {

    constructor(context: NeutralizeLaneTacticContext, controller: NeutralizeLaneTacticController,
        name?: string
    ) {
        super(name ?? NeutralizeLaneTacticState.name, context, controller);
    }

    override onEnter(): void {
        this.context.currentManeuver = -1;
        this.context.currentManeuverStep = -1;
    }

    update(): UpdateResult {
        try {
            // Gather data
            const laneData = this.controller.getBattlefieldLane(this.context.targetLane);

            this.context.enemyUnitCount = laneData.enemyUnits.length;
            this.context.allyUnitCount = laneData.allyUnits.length;
            this.context.enemyTroopPower = laneData.enemyTroopPower;
            this.context.allyTroopPower = laneData.allyTroopPower;

            let rangedAllyCount = 0;
            for (let au of laneData.allyUnits) {
                if (au.isRanged) rangedAllyCount++;
            }

            // Finish condition
            Log.Info("Power", this.context.allyTroopPower, this.context.enemyTroopPower);
            if (this.context.allyTroopPower >= this.context.enemyTroopPower * 0.85) {
                this.context.outputLane = null;
                return UpdateResult.RunImmediateUpdate;
            }

            // Check resources
            let cooldown = this.controller.getTimeUntilLaneManeuverAvailable(this.context.targetLane, 'summonMelee');
            if (cooldown > 0) {
                this.context.outputLane = 'nothing';
                return UpdateResult.ContinueProcessing;
            }

            let melee = this.controller.getActionValue('summonMelee', this.context.targetLane);
            let ranged = this.controller.getActionValue('summonRanged', this.context.targetLane);
            let meleeRangedPowerRatio = melee / ranged; // Higher than 1 => melee are stronger, lower than 1 => ranged are stronger

            // If hero is focused on leveling one type, keep summoning that
            if (meleeRangedPowerRatio <= 0.5) this.context.outputLane = 'summonRanged';
            else if (meleeRangedPowerRatio >= 1.5) this.context.outputLane = 'summonMelee';
            else {
                let meleeAllyCount = this.context.allyUnitCount - rangedAllyCount;
                let wantedMeleeRatio = 0.5 * meleeRangedPowerRatio;

                // If there are much more melees, summon some ranged
                if (meleeAllyCount > this.context.allyUnitCount * wantedMeleeRatio) this.context.outputLane = 'summonRanged';
                else this.context.outputLane = 'summonMelee';
            }

            super.update();
        } catch (ex: any) { Log.Error(ex); }
        return UpdateResult.ContinueProcessing;
    }

}