import { GameBalanceId, UnitBalanceId } from "content/constants/BalanceIds";
import { Units } from "content/constants/Units";
import { ICoords } from "systems/coords/ICoords";
import { Log } from "systems/log/Log";
import { MapPlayer, Unit } from "w3ts";

export interface MinionFactoryConfig {

    gameBalance: Record<GameBalanceId, GameBalanceDataBase>;
    unitBalance: Record<UnitBalanceId, UnitBalanceDataBase>;
    summonLevelAbilityCode: string;
}

export class MinionFactory {

    private readonly gameBalances: Record<string, GameBalanceData> = {};
    private readonly unitBalances: Record<string, UnitBalanceData> = {};
    private readonly summonLevelId: number;

    private _gameBalance: GameBalanceData | null = null;
    private _unitBalance: UnitBalanceData | null = null;

    private unitTypeStats: Record<number, Record<number, UnitStats>> = {};

    constructor(
        config: MinionFactoryConfig,
    ) {
        this.summonLevelId = FourCC(config.summonLevelAbilityCode);
        
        for (let unitBalanceCode of Object.keys(config.unitBalance)) {
            let unitBalanceId = unitBalanceCode as UnitBalanceId;
            let unitBalance: UnitBalanceData = this.unitBalances[unitBalanceId] = {
                unitTypeStatWeight: {}
            };
            let weights = config.unitBalance[unitBalanceId].unitTypeStatWeight;
            for (let unitTypeCode of Object.keys(weights)) {
                let unitTypeId = FourCC(unitTypeCode);
                unitBalance.unitTypeStatWeight[unitTypeId] = weights[<Units>unitTypeCode];
            }
        }

        for (let gameBalanceCode of Object.keys(config.gameBalance)) {
            let gameBalanceId = gameBalanceCode as GameBalanceId;
            let b = config.gameBalance[gameBalanceId];
            
            let minDps = b.minEffectiveHp / b.secondsToDie;
            let hpDifference = b.maxEffectiveHp - b.minEffectiveHp;
            let ehpPerLevel = hpDifference / b.maxLevel;
            let dpsPerLevel = hpDifference / b.secondsToDie / b.maxLevel;

            this.gameBalances[gameBalanceId] = {
                maxLevel: b.maxLevel,
                secondsToDie: b.secondsToDie,
                maxToMinRelativeValue: b.maxToMinRelativeValue,
                minEffectiveHp: b.minEffectiveHp,
                maxEffectiveHp: b.maxEffectiveHp,

                minDps: minDps,
                hpDifference: hpDifference,
                ehpPerLevel: ehpPerLevel,
                dpsPerLevel: dpsPerLevel,
            }
        }
    }

    public get gameBalance(): GameBalanceData {
        if (!this._gameBalance) throw new Error("Game balance has not been set.");
        return this._gameBalance;
    }

    public get unitBalance(): UnitBalanceData {
        if (!this._unitBalance) throw new Error("Game balance has not been set.");
        return this._unitBalance;
    }
    
    public CreateMinion(owner: MapPlayer, unitTypeId: number, level: number, location: ICoords): Unit {

        if (!this._gameBalance) Log.Error("Game balance not set.");

        let u = new Unit(owner, unitTypeId, location.x, location.y, 0);

        // Apply balance data
        let stats = this.Calculate(unitTypeId, level);

        u.name = u.name + ' (' + level + ')';
        u.maxLife = stats.hitPoints;
        u.life = stats.hitPoints;
        BlzSetUnitArmor(u.handle, stats.armor);

        u.setAttackCooldown(stats.attackCooldown, 0);
        u.setBaseDamage(stats.baseDamage, 0);
        u.setDiceNumber(stats.diceCount, 0);
        u.setDiceSides(stats.diceMaxRoll, 0);

        u.removeGuardPosition();

        u.addAbility(this.summonLevelId);
        u.setAbilityLevel(this.summonLevelId, level);

        return u;
    }

    public GetMinionLevel(minion: Unit): number {
        return minion.getAbilityLevel(this.summonLevelId);
    }
    
    public SetGameBalanceSet(id: string): void {
        Log.Info("Setting game balance", id);
        this._gameBalance = this.gameBalances[id];
    }

    public SetUnitBalanceSet(id: string): void {
        Log.Info("Setting unit balance", id);
        this._unitBalance = this.unitBalances[id];
        this.unitTypeStats = {};
    }

    private Calculate(unitTypeId: number, level: number): UnitStats {
        
        if (!this._unitBalance) {
            Log.Error("Unit balance not set.");
            throw "Unit balance not set.";
        }
        if (!this._gameBalance) {
            Log.Error("Game balance not set.");
            throw "Game balance not set.";
        }

        let retVal = this.unitTypeStats[unitTypeId] && this.unitTypeStats[unitTypeId][level];
        if (retVal) return retVal;

        let weights = this._unitBalance.unitTypeStatWeight[unitTypeId];
        let diceCount: number = 3;
        let diceMaxRoll: number = 2;
        let baseDamage: number = 11;
        let attackCooldown: number = 1.5;
        let hitPoints: number = 223;
        let armor: number = 2;

        try {
            if (weights.attack) {
                // Calculate attack first
                // avgDps
                let avgDps = (this._gameBalance.minDps + (level - 1) * this._gameBalance.dpsPerLevel) * weights.offenseRatio;
                Log.Info("avgDps", avgDps);
                // avgDpr
                let avgDpr = avgDps * weights.attack.speed * weights.attack.targetsMultiplier / weights.attack.targetsCount;
                Log.Info("avgDpr", avgDpr);
                // diceCount
                diceCount = math.floor(0.5 + (avgDpr + (weights.attack.diceTweaks[1] || 0)) / ((weights.attack.diceTweaks[0] || 0) + avgDps * (weights.attack.diceTweaks[2] || 1)));
                Log.Info("diceCount", diceCount);
                // diceMaxRoll
                diceMaxRoll = math.floor(0.5 + avgDpr * weights.attack.dpsVariation / diceCount);
                Log.Info("diceMaxRoll", diceMaxRoll);
                // diceDpr
                let diceDpr = (diceMaxRoll + 1) * 0.5 * diceCount;
                Log.Info("diceDpr", diceDpr);
                // baseDmg
                baseDamage = math.floor(0.5 + avgDpr - diceDpr);
                Log.Info("baseDamage", baseDamage);
    
                attackCooldown = weights.attack.speed;
            }
    
            // Calculate effective hp
            let ehp = (this._gameBalance.minEffectiveHp + (level - 1) * this._gameBalance.ehpPerLevel) * weights.defenseRatio;
            Log.Info("ehp", ehp);
    
            // Calculate armor
            armor = math.floor(0.5 + (weights.defense.armorRatio + weights.defense.armorGrowth * (level - 1)) / (0.06 * (1 - weights.defense.armorRatio)));
            Log.Info("armor value", armor);
    
            // absorb ratio
            let absorbRatio = (armor * 0.06) / (1 + 0.06 * armor);
            Log.Info("absorbRatio", absorbRatio);
    
            // Calculate health
            hitPoints = math.floor(0.5 + ehp * (1 - absorbRatio))
            Log.Info("hitPoints", hitPoints);
        } catch (ex: any) {
            Log.Error(ex);
        }

        return (this.unitTypeStats[unitTypeId] ||= {})[level] = {
            baseDamage,
            diceCount,
            attackCooldown,
            diceMaxRoll,
            hitPoints,
            armor,
        }
    }
}

export type GameBalanceDataBase = {
    maxLevel: number,
    secondsToDie: number,
    maxToMinRelativeValue: number,
    minEffectiveHp: number,
    maxEffectiveHp: number,
}

export type UnitBalanceDataBase = {
    unitTypeStatWeight: Record<Units, UnitTypeStatWeight>;
}

export type UnitBalanceData = {
    unitTypeStatWeight: Record<number, UnitTypeStatWeight>;
}

export type GameBalanceData = GameBalanceDataBase & {
    minDps: number,
    hpDifference: number,
    ehpPerLevel: number,
    dpsPerLevel: number,
}

export type UnitTypeStatWeight = {
    offenseRatio: number,
    defenseRatio: number,
    defense: DefenseStats,
    attack: AttackStats,
}

export type DefenseStats = {
    armorRatio: number,
    armorGrowth: number,
}

export type AttackStats = {
    targetsMultiplier: number,
    targetsCount: number,
    speed: number,
    diceTweaks: number[],
    dpsVariation: number,
}

export type UnitStats = {
    baseDamage: number,
    diceCount: number,
    diceMaxRoll: number,
    attackCooldown: number,
    hitPoints: number,
    armor: number,
}