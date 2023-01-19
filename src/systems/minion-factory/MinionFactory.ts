import { Units } from "content/constants/Units";
import { Coords } from "systems/coords/Coords";
import { Log } from "systems/log/Log";
import { MapPlayer, Unit } from "w3ts";

export interface MinionFactoryConfig {

    gameBalance: Record<string, GameBalanceDataBase>;
    unitBalance: Record<string, UnitBalanceDataBase>;
}

export class MinionFactory {

    private readonly gameBalances: Record<string, GameBalanceData> = {};
    private readonly unitBalances: Record<string, UnitBalanceData> = {};

    private gameBalance: GameBalanceData | null = null;
    private unitBalance: UnitBalanceData | null = null;

    private unitTypeStats: Record<number, Record<number, UnitStats>> = {};

    constructor(
        config: MinionFactoryConfig,
    ) {
        for (let unitBalanceId of Object.keys(config.unitBalance)) {
            let unitBalance: UnitBalanceData = this.unitBalances[unitBalanceId] = {
                unitTypeStatWeight: {}
            };
            let weights = config.unitBalance[unitBalanceId].unitTypeStatWeight;
            for (let unitTypeCode of Object.keys(weights)) {
                let unitTypeId = FourCC(unitTypeCode);
                unitBalance.unitTypeStatWeight[unitTypeId] = weights[<Units>unitTypeCode];
            }
        }

        for (let gameBalanceId of Object.keys(config.gameBalance)) {
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
    
    public CreateMinion(owner: MapPlayer, unitTypeId: number, level: number, location: Coords): Unit {

        if (!this.gameBalance) Log.Error("Game balance not set.");

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

        return u;
    }
    
    public SetGameBalanceSet(id: string): void {
        Log.Info("Setting game balance", id);
        this.gameBalance = this.gameBalances[id];
    }

    public SetUnitBalanceSet(id: string): void {
        Log.Info("Setting unit balance", id);
        this.unitBalance = this.unitBalances[id];
        this.unitTypeStats = {};
    }

    private Calculate(unitTypeId: number, level: number): UnitStats {
        
        if (!this.unitBalance) {
            Log.Error("Unit balance not set.");
            throw "Unit balance not set.";
        }
        if (!this.gameBalance) {
            Log.Error("Game balance not set.");
            throw "Game balance not set.";
        }

        let retVal = this.unitTypeStats[unitTypeId] && this.unitTypeStats[unitTypeId][level];
        if (retVal) return retVal;

        let weights = this.unitBalance.unitTypeStatWeight[unitTypeId];
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
                let avgDps = (this.gameBalance.minDps + (level - 1) * this.gameBalance.dpsPerLevel) * weights.offenseRatio;
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
            let ehp = (this.gameBalance.minEffectiveHp + (level - 1) * this.gameBalance.ehpPerLevel) * weights.defenseRatio;
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