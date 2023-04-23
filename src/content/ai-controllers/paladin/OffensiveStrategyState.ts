// import { State } from "systems/player-ai/State";

// export interface IOffensiveStrategyContext extends IMonitorBattlefieldContext {
//     r1: number; // Resource for summoning units
//     r2: number; // Resource for casting spells
// }

// export interface IOffensiveStrategyController extends IMonitorBattlefieldController {
//     getResourceR1(): number;
//     getResourceR2(): number;
// }

// export class OffensiveStrategyState extends State<IOffensiveStrategyContext, IOffensiveStrategyController> {

//     constructor(context: IOffensiveStrategyContext, controller: IOffensiveStrategyController) {
//         super(context, controller);
//     }

//     update(): boolean {
//         if (super.update()) return true;

//         const allyUnitsByLane = this.controller.getAllyUnitsByLane();
//         const enemyUnitsByLane = this.controller.getEnemyUnitsByLane();
//         const allyUnitsTotalHp = this.controller.getAllyUnitsTotalHp();
//         const enemyUnitsTotalHp = this.controller.getEnemyUnitsTotalHp();
//         const r1 = this.controller.getResourceR1();
//         const r2 = this.controller.getResourceR2();

//         // Evaluate the value of summoning a unit based on the state of the lanes, units' HP, and available resources
//         const summonValue = this.evaluateSummonValue(allyUnitsByLane, enemyUnitsByLane, allyUnitsTotalHp, enemyUnitsTotalHp, r1);

//         // Evaluate the value of casting a spell based on the state of the lanes, units' HP, and available resources
//         const castValue = this.evaluateCastValue(allyUnitsByLane, enemyUnitsByLane, allyUnitsTotalHp, enemyUnitsTotalHp, r2);

//         // Decide between summoning a unit or casting a spell based on the calculated values
//         if (summonValue > castValue) {
//             // Set the necessary input for SummonUnitState on the context
//             this.context.unitType = /* chosen unit type based on the evaluation */;
//             this.context.lane = /* chosen lane based on the evaluation */;
//             this.controller.changeState(/* SummonUnitState instance */);
//         } else {
//             // Set the necessary input for CastSpellState on the context
//             this.context.spellName = /* chosen spell name based on the evaluation */;
//             this.context.position = /* chosen position based on the evaluation */;
//             this.controller.changeState(/* CastSpellState instance */);
//         }

//         return true;
//     }

//     private evaluateSummonValue(
//         allyUnitsByLane: number, enemyUnitsByLane: number,
//         allyUnitsTotalHp: number, enemyUnitsTotalHp: number, r1: number): number {
//         // Calculate the value of summoning a unit based on the state of the lanes, units' HP, and available resources
//         // Replace this with your game-specific logic
//         return /* calculated summon value */;
//     }

//     private evaluateCastValue(
//         allyUnitsByLane: number, enemyUnitsByLane: number,
//         allyUnitsTotalHp: number, enemyUnitsTotalHp: number, r2: number): number {
//         // Calculate the value of casting a spell based on the state of the lanes, units' HP, and available resources
//         // Replace this with your game-specific logic
//         return /* calculated cast value */;
//     }
// }