// import { UnitType } from "content/constants/UnitType";
// import { Log } from "systems/log/Log";
// import { ParentState } from "systems/player-ai/ParentState";

// export interface NeutralizeLaneTacticContext {
//     targetLane: number;

//     enemyUnitCount: number;
//     allyUnitCount: number;
//     enemyTroopPower: number;
//     allyTroopPower: number;
//     currentManeuverStep: number;
//     currentManeuver: number;

//     outputAction: 'wait' | 'continue' | string;
// }

// export interface NeutralizeLaneTacticController {
//     getLaneUnits(lane: number): { isEnemy: boolean, hpPercent: number, lvl: number, unitType: UnitType }[];
//     getTimeUntilLaneManeuverAvailable(lane: number, ...action: string[]): number;
//     getActionValue(action: string, lane?: number): number;
// }

// export class NeutralizeLaneTacticState extends ParentState<NeutralizeLaneTacticContext, NeutralizeLaneTacticController> {
    
//     constructor(context: NeutralizeLaneTacticContext, controller: NeutralizeLaneTacticController,
//         private readonly maneuvers: string[][],
//         name?: string
//     ) {
//         super(name ?? NeutralizeLaneTacticState.name, context, controller);
//     }

//     override onEnter(): void {
//         this.context.currentManeuver = -1;
//         this.context.currentManeuverStep = -1;
//     }
    
//     update(): boolean | void {
//         try {
//         // Gather data
//         const units = this.controller.getLaneUnits(this.context.targetLane);
        
//         this.context.enemyUnitCount = 0;
//         this.context.allyUnitCount = 0;
//         this.context.enemyTroopPower = 0;
//         this.context.allyTroopPower = 0;

//         // Troop power = sum of unit levels reduced up to 60% depending on current health percentage
//         for (let u of units) {
//             if (u.isEnemy) {
//                 this.context.enemyUnitCount++;
//                 this.context.enemyTroopPower += (u.lvl * (0.4 + u.hpPercent * 0.6));
//             } else {
//                 this.context.allyUnitCount++;
//                 this.context.allyTroopPower += (u.lvl * (0.4 + u.hpPercent * 0.6));
//             }
//         }

//         // Finish condition
//         if (this.context.allyTroopPower >= this.context.enemyTroopPower + 1) {
//             this.context.outputAction = 'continue';
//             return true;
//         }

//         // Check resources
//         let x = 0;
//         let potentialManeuvers: Set<number> = new Set<number>();
//         for (let i = 0; i < this.maneuvers.length; i++) {
//             const maneuver = this.maneuvers[i];
//             let cooldown = this.controller.getTimeUntilLaneManeuverAvailable(this.context.targetLane, ...maneuver);
//             if (cooldown <= 3) {
//                 potentialManeuvers.add(i);
//                 x++;
//             }
//         }

//         print("Has Potential maneuvers ", x);

//         let highestValue: number = -1;
//         let highestValueManeuverIndex: number = -1;
//         for (let i = 0; i < this.maneuvers.length; i++) {
//             if (potentialManeuvers.has(i) == false) continue;            

//             let value = 0;
//             for (let action of this.maneuvers[i]) {
//                 value += this.controller.getActionValue(action, this.context.targetLane);
//             }

//             if (value > highestValue) {
//                 highestValue = value;
//                 highestValueManeuverIndex = i;
//             }
//         }

//         if (highestValueManeuverIndex == -1) {
//             this.context.outputAction = 'wait';
//             return super.update();
//         }
//         Log.Debug("highestValueManeuverIndex", highestValueManeuverIndex);
//         const executedManeuver = this.maneuvers[highestValueManeuverIndex];

//         // Check if we are performing the same maneuver
//         if (this.context.currentManeuver != highestValueManeuverIndex) {
//             this.context.currentManeuverStep = 0;
//             this.context.currentManeuver = highestValueManeuverIndex;
//         }

//         // Check if we've executed the whole manuever
//         if (this.context.currentManeuverStep >= executedManeuver.length) {
//             // this.context.outputAction = 'wait';
//             return super.update();
//         }

//         // Set next action
//         Log.Debug("Setting next action", this.maneuvers[this.context.currentManeuver][this.context.currentManeuverStep]);
//         this.context.outputAction = this.maneuvers[this.context.currentManeuver][this.context.currentManeuverStep];
//         this.context.currentManeuverStep++;

//         print("Update");
//         return super.update();
//         } catch (ex: any) { Log.Error(ex); }
//     }

// }