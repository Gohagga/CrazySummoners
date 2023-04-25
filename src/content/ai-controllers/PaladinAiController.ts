import { PaladinAbilities } from "content/class-progression/PaladinProgression";
import { Zones } from "content/constants/Zones";
import { AbilityBase } from "systems/abilities/AbilityBase";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { BattlegroundService } from "systems/battleground-service/BattlegroundService";
import { PlayerController } from "systems/player-ai/PlayerController";
import { StateTransitionBuilder } from "systems/player-ai/StateTransitionBuilder";
import { MapPlayer, Timer, Unit } from "w3ts";
import { CastSpellState, ICastSpellContext, ICastSpellController } from "./common/CastSpell";
import { ISummonUnitContext, ISummonUnitController, SummonUnitState } from "./common/SummonUnit";
import { IMonitorBattlefieldContext, IMonitorBattlefieldController } from "./paladin/MonitorBattlefield";
import { Log } from "systems/log/Log";
import { GameStateEventType, IGameStateEventHandler } from "systems/game-state/IGameStateEventHandler";
import { NeutralizeLaneTacticContext as INeutralizeLaneTacticContext, NeutralizeLaneTacticController as INeutralizeLaneTacticController, NeutralizeLaneTacticState } from "./paladin/NeutralizeLaneTacticState";
import { UnitType } from "content/constants/UnitType";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { UnitTypeService } from "systems/classification-service/UnitTypeService";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { OrbType } from "content/constants/OrbType";
import { OrbAbility } from "systems/abilities/OrbAbility";
import { IdleState } from "systems/player-ai/IdleState";
import { BattlefieldData, BattlefieldLane, BattlefieldUnit } from "./common/IBattlefieldData";
import { DefensiveBattleTacticContext as IDefensiveBattleTacticContext, DefensiveBattleTacticState, DefensiveBattleTacticController as IDefensiveBattleTacticController } from "./paladin/DefensiveBattleTacticState";
import { IAiStats } from "./common/IAiStats";
import { OrderId } from "w3ts/globals/order";

interface IPaladinAiContext extends
    IMonitorBattlefieldContext,
    ISummonUnitContext,
    ICastSpellContext,
    INeutralizeLaneTacticContext,
    IDefensiveBattleTacticContext,
    IAiStats {};

export const enum PaladinAction {
    summonMelee = 'summonMelee',
    summonRanged = 'summonRanged',
    rejuvenate = 'rejuvenate',
    bless = 'bless',
    purge = 'purge',
    invigorate = 'invigorate',
    endure = 'endure',
    justice = 'justice',
    redemption = 'redemption',
    guardianAngel = 'guardianAngel',
    exorcism = 'exorcism',
}

export class PaladinAiController extends PlayerController implements
    IMonitorBattlefieldController,
    ISummonUnitController,
    ICastSpellController,
    INeutralizeLaneTacticController,
    IDefensiveBattleTacticController {
        
    constructor(
        private readonly player: MapPlayer,
        private readonly hero: Unit,
        private readonly abilities: PaladinAbilities,
        private readonly battlegroundService: BattlegroundService,
        private readonly enumUnitService: IEnumUnitService,
        private readonly minionFactory: MinionFactory,
        private readonly unitTypeService: UnitTypeService,
        private readonly resourceBarManager: ResourceBarManager,
        abilityEvent: IAbilityEventHandler,
        gameStateEvent: IGameStateEventHandler) {
        super();
        
        // FSM - Create states
        const idle = new IdleState(this.context, this);
        
        // Level 3 - DefensiveBattleTactic
        const defensiveBattleTactic = new DefensiveBattleTacticState(this.context, this);

        // Level 2 - NeutralizeLaneTactic, DefensiveBattleTacticIdle
        const neutralizeLaneTactic = new NeutralizeLaneTacticState(this.context, this);
        const defensiveBattleTacticIdle = new IdleState(this.context, this);

        // Level 1 - SummonMelee, SummonRanged, NeutralizeLaneTacticIdle
        const summonMelee = new SummonUnitState(this.context, this, 'summonMelee', 'summonMeleeState');
        const summonRanged = new SummonUnitState(this.context, this, 'summonRanged', 'summonRangedState');
        const castRejuvenate = new CastSpellState(this.context, this, PaladinAction.rejuvenate, 'rejuvenateState');
        const castBless = new CastSpellState(this.context, this, PaladinAction.bless, 'blessState');
        const neutralizeLaneTacticIdle = new IdleState(this.context, this);

        // FSM - Set child states and initial state
        neutralizeLaneTactic.setInitialState(neutralizeLaneTacticIdle);
        defensiveBattleTactic.setInitialState(defensiveBattleTacticIdle);

        // FSM - State transitions
        this.transitionFrom<IDefensiveBattleTacticContext>(defensiveBattleTacticIdle)
            .to(neutralizeLaneTactic).when(c => c.targetLane != null);

        this.transitionFrom<IDefensiveBattleTacticContext>(neutralizeLaneTactic)
            .to(defensiveBattleTacticIdle).when(c => c.targetLane == null);

        this.transitionFrom<any>(defensiveBattleTactic)
            .to(idle).when(c => this.getBattlefieldData().lowestPowerRatio >= 1);

        this.transitionFrom<any>(idle)
            .to(defensiveBattleTactic).when(c => this.getBattlefieldData().lowestPowerRatio < 1);

        this.transitionFrom<INeutralizeLaneTacticContext>(neutralizeLaneTacticIdle)
            .to(summonMelee).when(c => c.outputLane == 'summonMelee')
            .to(summonRanged).when(c => c.outputLane == 'summonRanged')
            .to(castRejuvenate).when(c => c.outputLane == PaladinAction.rejuvenate)
            .to(castBless).when(c => c.outputLane == PaladinAction.bless);

        this.transitionFrom<any>(summonMelee)
            .to(neutralizeLaneTacticIdle).when(c => this.context.isSummonUnitDone)
            .to(summonRanged).when(c => this.context.outputLane == 'summonRanged')
            .to(summonMelee).when(c => this.context.outputLane == 'summonMelee')
            .to(castRejuvenate).when(c => c.outputLane == PaladinAction.rejuvenate)
            .to(castBless).when(c => c.outputLane == PaladinAction.bless);

        this.transitionFrom<any>(summonRanged)
            .to(neutralizeLaneTacticIdle).when(c => this.context.isSummonUnitDone)
            .to(summonMelee).when(c => this.context.outputLane == 'summonMelee')
            .to(summonRanged).when(c => this.context.outputLane == 'summonRanged')
            .to(castRejuvenate).when(c => c.outputLane == PaladinAction.rejuvenate)
            .to(castBless).when(c => c.outputLane == PaladinAction.bless);

        this.transitionFrom<any>(castRejuvenate)
            .to(neutralizeLaneTacticIdle).when(c => { print("CHECKING REJUV", this.context.isCastSpellDone); return this.context.isCastSpellDone; })
            .to(summonMelee).when(c => this.context.outputLane == 'summonMelee')
            .to(summonRanged).when(c => this.context.outputLane == 'summonRanged')
            .to(castBless).when(c => c.outputLane == PaladinAction.bless);

        this.transitionFrom<any>(castBless)
            .to(neutralizeLaneTacticIdle).when(c => this.context.isCastSpellDone)
            .to(summonMelee).when(c => this.context.outputLane == 'summonMelee')
            .to(summonRanged).when(c => this.context.outputLane == 'summonRanged')
            .to(castRejuvenate).when(c => c.outputLane == PaladinAction.rejuvenate);

        this.transitionFrom<INeutralizeLaneTacticContext>(neutralizeLaneTactic)
            .to(defensiveBattleTacticIdle).when(c => c.outputLane == 'continue');
        
        this.context.targetLane = 3;

        // Set initial state when the round starts
        gameStateEvent.Subscribe(GameStateEventType.RoundStarted, () => new Timer().start(1, false, () => 
        {
            this.changeState(idle);
        }));

        this.hero.removeAbility(FourCC('A03H'));

        // Set up ability event listeners for command fulfillment tracking
        for (let key of Object.keys(abilities)) {
            let ab = (<Record<string, AbilityBase>>abilities)[key];

            if (key == PaladinAction.rejuvenate || key == PaladinAction.exorcism) {
                abilityEvent.OnAbilityEnd(ab.id, e => {
                    if (e.caster != this.hero) return true;
    
                    for (let commandId of Object.keys(this._commandOrderIds)) {
                        if (this._commandOrderIds[Number(commandId)] == ab.orderId) {
                            Log.Debug("Command fulfilled", commandId);
                            delete this._commandOrderIds[Number(commandId)];
                            // Call update immediately
                            new Timer().start(0, false, () => {
                                Timer.fromExpired().destroy();
                                this.update();
                            });
                        }
                    }
                    return true;
                });
            } else {
                abilityEvent.OnAbilityEffect(ab.id, e => {
                    if (e.caster != this.hero) return true;
    
                    for (let commandId of Object.keys(this._commandOrderIds)) {
                        if (this._commandOrderIds[Number(commandId)] == ab.orderId) {
                            Log.Debug("Command fulfilled", commandId);
                            delete this._commandOrderIds[Number(commandId)];
                            // Call update immediately
                            new Timer().start(0, false, () => {
                                Timer.fromExpired().destroy();
                                this.update();
                            });
                        }
                    }
                    return true;
                });
            }
        }
    }
    
    //#region Context fields
    public context: IPaladinAiContext = {
        allyUnitsByLane: 0,
        enemyUnitsByLane: 0,
        allyUnitsCount: 0,
        enemyUnitsCount: 0,
        allyUnitsTotalHp: 0,
        enemyUnitsTotalHp: 0,
        targetLane: 0,
        isSummonUnitDone: false,
        isCastSpellDone: false,
        outputLane: "",
        stat: {
            desperation: 0.5,
            preservation: 0.5,
            vengeance: 0.5,
        },
    };
    //#endregion

    //#region Internal fields
    private _commandIdCounter: number = 1;
    private _commandOrderIds: Record<number, number> = {};
    private _cachedLaneData: Record<number, BattlefieldLane> = {};
    private _cachedBattlefieldData: BattlefieldData | null = null;
    private _cachedActionEnabled: Record<string, boolean> = {};
    private _orbCost: Record<PaladinAction, OrbType[]> = {
        'summonMelee': (<OrbAbility>this.abilities.summonMelee).orbCost,
        'summonRanged': (<OrbAbility>this.abilities.summonRanged).orbCost,
        'rejuvenate': (<OrbAbility>this.abilities.rejuvenate).orbCost,
        'bless': (<OrbAbility>this.abilities.bless).orbCost,
        'purge': (<OrbAbility>this.abilities.purge).orbCost,
        'invigorate': (<OrbAbility>this.abilities.invigorate).orbCost,
        'endure': (<OrbAbility>this.abilities.endure).orbCost,
        'justice': (<OrbAbility>this.abilities.justice).orbCost,
        'redemption': (<OrbAbility>this.abilities.redemption).orbCost,
        'guardianAngel': (<OrbAbility>this.abilities.guardianAngel).orbCost,
        'exorcism': (<OrbAbility>this.abilities.exorcism).orbCost,
    };
    //#endregion

    getAllyUnitsByLane(): number {
        throw new Error("Method not implemented.");
    }
    getEnemyUnitsByLane(): number {
        throw new Error("Method not implemented.");
    }
    getAllyUnitsCount(): number {
        throw new Error("Method not implemented.");
    }
    getEnemyUnitsCount(): number {
        throw new Error("Method not implemented.");
    }
    getAllyUnitsTotalHp(): number {
        throw new Error("Method not implemented.");
    }
    getEnemyUnitsTotalHp(): number {
        throw new Error("Method not implemented.");
    }
    issueSummonUnitCommand(unitType: string, lane: number): number {

        Log.Debug("issueSummonUnitCommand", unitType, lane);

        const crystalUnit = this.battlegroundService.GetPlayerZoneCrystal(this.player, lane as Zones);
        if (!crystalUnit) throw new Error("AI cannot issue summon command.");

        let orderId = 0;
        if (unitType == 'summonMelee') {
            orderId = this.abilities.summonMelee.orderId;
        } else if (unitType == 'summonRanged') {
            print("ASDIOWJED2O 3IJ290 3I2 3I2EJKR 2O3I R")
            orderId = this.abilities.summonRanged.orderId;
        }
        const result = this.hero.issueTargetOrder(orderId, crystalUnit);
        const commandId = this._commandIdCounter++;

        if (!result) {
            this._commandOrderIds[commandId] = 0;
            return 0;
        }

        this._commandOrderIds[commandId] = orderId;
        return commandId;
    }
    getCommandStatus(id: number): 'notStarted' | 'started' | 'done' {
        // let status: 'notStarted' | 'started' | 'done' = 'done';

        if (id == 0) {
            Log.Debug("isSummonUnitCommandDone A", id, '', 'notStarted');
            return 'notStarted';
        }

        const orderId = this._commandOrderIds[id];

        if (orderId == 0) {
            Log.Debug("isSummonUnitCommandDone B", id, orderId, 'notStarted');
            return 'notStarted'
        }
        if (id in this._commandOrderIds == false) {
            Log.Debug("isSummonUnitCommandDone C", id, orderId, 'done');
            return 'done';
        }
        if (this.hero.currentOrder != orderId) {
            Log.Debug("isSummonUnitCommandDone D", id, orderId, 'notStarted', this.hero.currentOrder);
            return 'notStarted';
        }
        Log.Debug("isSummonUnitCommandDone E", id, orderId, 'started', this.hero.currentOrder);
        return 'started';
    }

    issueCastSpellCommand(action: string, lane: number): number {
        Log.Debug("issueCastSpellCommand", action, lane);

        // const crystalUnit = this.battlegroundService.GetPlayerZoneCrystal(this.player, lane as Zones);
        // if (!crystalUnit) throw new Error("AI cannot issue summon command.");

        let orderId = 0;
        const paladinAction = action as PaladinAction;
        let result = false;
        switch (paladinAction) {
            case PaladinAction.rejuvenate: {
                Log.Debug("Performing rejuvenate");
                orderId = this.abilities.rejuvenate.orderId;
                let mostDamaged: BattlefieldUnit | null = null;
                let laneData = this.getBattlefieldLane(lane);
                for (let au of laneData.allyUnits) {
                    if (!mostDamaged || au.hpPercent < mostDamaged.hpPercent) {
                        mostDamaged = au;
                    }
                }
                if (!mostDamaged) return 0;
                Log.Debug("mostDamaged", mostDamaged.hpPercent, orderId);

                let { x, y } = mostDamaged.unit;
                result = this.hero.issueOrderAt(orderId, x, y);
                break;
            };
            case PaladinAction.bless: {
                orderId = this.abilities.bless.orderId;
                // Pick the unit with highest level and then highest hp%
                let highestLvl: BattlefieldUnit | null = null;
                let laneData = this.getBattlefieldLane(lane);
                for (let au of laneData.allyUnits) {
                    if (au.unit.getAbilityLevel(this.abilities.bless.dummyBlessBuffId)) continue;

                    if (!highestLvl || highestLvl.lvl < au.lvl) {
                        highestLvl = au;
                    } else if (highestLvl.lvl == au.lvl && highestLvl.hpPercent < au.hpPercent) {
                        highestLvl = au;
                    }
                }
                if (!highestLvl) return 0;

                let { x, y } = highestLvl.unit;
                result = this.hero.issueOrderAt(orderId, x, y);
                break;
            };
            default: {
            }
        };

        const commandId = this._commandIdCounter++;

        if (!result) {
            this._commandOrderIds[commandId] = 0;
            return 0;
        }

        this._commandOrderIds[commandId] = orderId;
        return commandId;
    }

    getLaneUnits(lane: number): { isEnemy: boolean; hpPercent: number; lvl: number; unitType: UnitType; isRanged: boolean; }[] {
        Log.Debug("getLaneUnits", lane);

        let result: { isEnemy: boolean; hpPercent: number; lvl: number; unitType: UnitType; isRanged: boolean; }[] = [];
        
        
        return result;
    }
    getTimeUntilLaneManeuverAvailable(lane: number, ...actions: string[]): number {
        Log.Debug("getTimeUntilLaneManeuverAvailable", lane);

        let bar = this.resourceBarManager.Get(this.player.id);
        let orbCosts: Record<string, OrbType[]> = {
            'summonMelee': (<OrbAbility>this.abilities.summonMelee).orbCost,
            'summonRanged': (<OrbAbility>this.abilities.summonRanged).orbCost,
            'rejuvenate': (<OrbAbility>this.abilities.rejuvenate).orbCost,
            'bless': (<OrbAbility>this.abilities.bless).orbCost,
            'purge': (<OrbAbility>this.abilities.purge).orbCost,
        }

        let totalCost: OrbType[] = [];
        for (let action of actions) {
            totalCost.push(...orbCosts[action]);
        }
        let x = bar.CalculateCooldown(totalCost);
        return x;
    }
    getActionValue(action: string, lane?: number | undefined): number {
        Log.Debug("getActionValue", action, lane);

        if (action == 'summonMelee') {
            return this.hero.getAbilityLevel(this.abilities.summonMelee.id);
        } else if (action == 'summonRanged') {
            return this.hero.getAbilityLevel(this.abilities.summonRanged.id);
        }

        let value = 0;

        if (action == PaladinAction.rejuvenate) {
            // Pick the unit with lowest hp % and highest level and enum units around it
            if (!lane) return 0;

            let mostDamaged: BattlefieldUnit | null = null;
            let laneData = this.getBattlefieldLane(lane);
            for (let au of laneData.allyUnits) {
                if (!mostDamaged || au.hpPercent < mostDamaged.hpPercent) {
                    mostDamaged = au;
                }
            }

            if (mostDamaged != null) {
                let lvl = this.abilities.paladinMastery.GetHeroAbilityLevel(this.hero, this.abilities.rejuvenate.id);
                Log.Debug("lvl", lvl);
                const data = this.abilities.rejuvenate.GetUnitConfig(this.hero, lvl);
                const healPercentPerTick = data.healPercent * data.channelTime / data.healInterval;
                let unitsAround = this.enumUnitService.EnumUnitsInRange(mostDamaged.unit, data.aoe, target =>
                    target.isAlly(this.player) && target.isAlive())
                    .sort((a, b) => (a.life / a.maxLife) - (b.life / b.maxLife));
                
                let count = data.targetCount;
                for (let u of unitsAround) {
                    if (count-- == 0) break;
                    let lvl = this.minionFactory.GetMinionLevel(u);
                    let maxHealed = (1 - GetWidgetLife(u.handle) / u.maxLife);
                    let unitValue = lvl * healPercentPerTick;
                    if (unitValue > maxHealed) unitValue = maxHealed;
                    value += unitValue;
                }
            }

            return value;
        }

        else if (action == PaladinAction.bless) {
            if (!lane) return 0;
            // value = 0;

            // Pick the unit with highest level and then highest hp%
            let highestLvl: BattlefieldUnit | null = null;
            let laneData = this.getBattlefieldLane(lane);
            for (let au of laneData.allyUnits) {
                if (au.unit.getAbilityLevel(this.abilities.bless.dummyBlessBuffId) > 0) continue;

                if (!highestLvl || highestLvl.lvl < au.lvl) {
                    highestLvl = au;
                } else if (highestLvl.lvl == au.lvl && highestLvl.hpPercent < au.hpPercent) {
                    highestLvl = au;
                }
            }

            if (highestLvl != null) {
                let lvl = this.abilities.paladinMastery.GetHeroAbilityLevel(this.hero, this.abilities.bless.id);
                Log.Debug("lvl", lvl);
                const data = this.abilities.bless.GetUnitConfig(this.hero);
                //               0.4                        10s                                         25
                const hpPcPer100BonusPerCast = data.duration / this.minionFactory.gameBalance.secondsToDie;
                //               2                      0.4                   5
                const powerPer100PercentCast = hpPcPer100BonusPerCast * highestLvl.lvl;
                //         0.2                 2                             0.1
                const powerPerCast = powerPer100PercentCast * data.damageBonusPercent;

                let unitsAround = this.enumUnitService.EnumUnitsInRange(highestLvl.unit, data.aoe, target =>
                    target.isAlly(this.player) && target.isAlive());
                
                for (let u of unitsAround) {
                    const hp = GetWidgetLife(u.handle);
                    const maxHp = u.maxLife;
                    let hpPercent = (hp / maxHp);
                    let lvl = this.minionFactory.GetMinionLevel(u);

                    let lifeExpectancyFactor = 1;
                    if (hp < 0.99 * u.maxLife) {
                        // If unit is damaged, should assume its buff might not be fully utilized.
                        let secondsToDie = hpPercent * this.minionFactory.gameBalance.secondsToDie / laneData.powerRatio;
                        if (secondsToDie < data.duration) {
                            lifeExpectancyFactor = secondsToDie / data.duration;
                        }
                    }

                    // One whole lvl = 25 seconds worth of 100% buff
                    let durationFactor = data.duration / this.minionFactory.gameBalance.secondsToDie;
                    let unitValue = lvl * durationFactor * lifeExpectancyFactor * data.damageBonusPercent;
                    value += unitValue;
                }
            }
            
            return value;
        }

        return 0;
    }

    
    getBattlefieldData(): BattlefieldData {
        if (this._cachedBattlefieldData) return this._cachedBattlefieldData;

        const battlefieldData: BattlefieldData = this._cachedBattlefieldData = {
            laneData: [],
            lowestPowerRatio: 1,
            averagePowerRatio: 1,
            highestPowerRatio: 1,
        };
        
        let lanePowerRatioSum = 0;
        for (let i = 1; i <= 5; i++) {
            let laneData = this.getBattlefieldLane(i);
            battlefieldData.laneData.push(laneData);
            
            lanePowerRatioSum += laneData.powerRatio;
            if (laneData.powerRatio <= battlefieldData.lowestPowerRatio)
                battlefieldData.lowestPowerRatio = laneData.powerRatio;

            if (laneData.powerRatio >= battlefieldData.highestPowerRatio)
                battlefieldData.highestPowerRatio = laneData.powerRatio;
        }

        battlefieldData.averagePowerRatio = lanePowerRatioSum / battlefieldData.laneData.length;
        return battlefieldData;
    }
    
    getBattlefieldLane(laneId: number): BattlefieldLane {
        if (laneId in this._cachedLaneData) return this._cachedLaneData[laneId];
        
        const zone = <Zones>laneId;
        const laneData: BattlefieldLane = this._cachedLaneData[laneId] = {
            laneId: zone,
            allyUnits: [],
            enemyUnits: [],
            allyTroopPower: 0,
            enemyTroopPower: 0,
            powerRatio: 1,
        }
        
        let units = this.enumUnitService.EnumUnitsInZone(<Zones>laneId, target => target.isAlive());
        if (units.length == 0) return laneData;

        for (let u of units) {
            const lvl = this.minionFactory.GetMinionLevel(u);
            const hpPercent = GetWidgetLife(u.handle) / u.maxLife;
            const troopPower = lvl * (0.6 + hpPercent * 0.4);
            const unitType = this.unitTypeService.GetUnitType(u);
            const isRanged = u.isUnitType(UNIT_TYPE_RANGED_ATTACKER)

            const unitData: BattlefieldUnit = {
                unit: u,
                hpPercent,
                lvl,
                unitType,
                isRanged,
                troopPower
            };

            if (u.isAlly(this.player)) {
                laneData.allyUnits.push(unitData);
                laneData.allyTroopPower += troopPower;
            } else {
                laneData.enemyUnits.push(unitData);
                laneData.enemyTroopPower += troopPower;
            }
        }

        if (laneData.enemyTroopPower > 0)
            laneData.powerRatio = laneData.allyTroopPower / laneData.enemyTroopPower;

        return laneData;
    }

    
    isActionEnabled(action: PaladinAction): boolean {
        if (action in this._cachedActionEnabled) return this._cachedActionEnabled[action];

        let bar = this.resourceBarManager.Get(this.player.id);
        let orbCost = this._orbCost[action];
        let enabled = bar.HasOrbs(orbCost);

        this._cachedActionEnabled[action] = enabled;
        return enabled;
    }
    prepareAction(action: string): void {
        Log.Debug("prepareAction", action);
        let ab = (<Record<string, AbilityBase>>this.abilities)[action];
        ab.AddToUnit(this.hero);
        this.abilities.paladinMastery.UpdateHeroAbilityLevel(this.hero, ab.id);
    }
    unprepareAction(action: string): void {
        Log.Debug("unprepareAction", action);
        let ab = (<Record<string, AbilityBase>>this.abilities)[action];
        ab.RemoveFromUnit(this.hero);
    }

    private resetCachedData() {
        this._cachedLaneData = {};
        this._cachedActionEnabled = {};
        this._cachedBattlefieldData = null;
    }

    override update(): void {
        this.resetCachedData();
        super.update();
    }
}