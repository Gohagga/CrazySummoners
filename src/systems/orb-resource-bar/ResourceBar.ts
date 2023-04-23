import { OrbType } from "content/constants/OrbType";
import { IResourceBarModel } from "ui/orbs/interfaces/IResourceBarModel";
import { MapPlayer } from "w3ts";
import { Orb } from "./Orb";
import { OrbFactory } from "./OrbFactory";

export interface ResourceBarConfig {
    summoningOrbCooldown: number,
    coloredOrbCooldown: number,
    coloredMaxCount: number,
    summoningMaxCount: number,
}

export class ResourceBar implements IResourceBarModel {

    private _orbs: Orb[] = [];
    private coloredOrbCooldown: number;
    private summoningOrbCooldown: number;
    private coloredMaxCount: number;
    private summoningMaxCount: number;

    onUpdate = () => {};

    constructor(
        private owner: MapPlayer,
        private orbFactory: OrbFactory,
        config: ResourceBarConfig,
    ) {
        this.coloredOrbCooldown = config.coloredOrbCooldown;
        this.summoningOrbCooldown = config.summoningOrbCooldown;
        this.coloredMaxCount = config.coloredMaxCount;
        this.summoningMaxCount = config.summoningMaxCount;
    }

    public get orbs(): Orb[] {
        return this._orbs;
    }

    public AddOrb(orbType: OrbType): Orb | null {

        // Validation
        let summ = 0;
        let col = 0;
        for (let o of this._orbs) {
            if (o.orbTypeId == OrbType.Summoning) summ++;
            else col++;
        }

        if (orbType == OrbType.Summoning && summ >= this.summoningMaxCount) return null;
        if (orbType != OrbType.Summoning && col >= this.coloredMaxCount) return null;

        // Create
        let orb = this.orbFactory.Create(orbType, this.owner);

        this._orbs.push(orb);
        this.onUpdate();

        return orb;
    }

    public Consume(cost: OrbType[] | null = null): boolean {
        
        if (!cost) return true;

        let usedOrbs: Set<number> = new Set<number>();
        let orbsToConsume: number[] = [];

        for (let i = 0; i < cost.length; i++) {
            let hasMat = false;
            let costOrbType = cost[i];

            for (let j = 0; j < this._orbs.length; j++) {
                let consume = false;
                if (usedOrbs.has(j) == false) {
                    let itOrb = this._orbs[j];
                    if (itOrb.orbTypeId == costOrbType && itOrb.isAvailable) {
                        usedOrbs.add(j);
                        orbsToConsume.push(j);
                        hasMat = true;
                        break;
                    }
                }
            }

            if (hasMat == false) return false
        }

        // We have all the materials available
        for (let i of orbsToConsume) {
            if (this._orbs[i].orbTypeId == OrbType.Summoning)
                this._orbs[i].Consume(this.summoningOrbCooldown);
            else
                this._orbs[i].Consume(this.summoningOrbCooldown);
        }

        return true;
    }

    public CalculateCooldown(cost: OrbType[] | null = null): number {
        
        if (!cost) return 0;

        let cooldown = 0;
        let usedOrbs: Set<number> = new Set<number>();
        let orbsToConsume: number[] = [];

        for (let i = 0; i < cost.length; i++) {
            let costOrbType = cost[i];

            let lowestCooldown: number | null = null;
            let bestOrbIndex: number = -1;

            for (let j = 0; j < this._orbs.length; j++) {
                if (usedOrbs.has(j)) continue;

                let itOrb = this._orbs[j];
                if (itOrb.orbTypeId != costOrbType) continue;

                if (itOrb.isAvailable) {
                    lowestCooldown = 0;
                    bestOrbIndex = j;
                    break;
                    
                } else if (lowestCooldown == null || itOrb.cooldownRemaining < lowestCooldown) {
                    lowestCooldown = itOrb.cooldownRemaining;
                    bestOrbIndex = j;
                }
            }

            if (bestOrbIndex > -1) {
                usedOrbs.add(bestOrbIndex);
                orbsToConsume.push(bestOrbIndex);

                if (lowestCooldown != null && lowestCooldown > cooldown) {
                    cooldown = lowestCooldown;
                }
            } else {
                // If the resource bar doesn't even have all the orbs
                return -1;
            }
        }
        
        return cooldown;
    }

    public ResetCooldowns(cooldown: number): void {
        for (let orb of this._orbs) {
            if (!orb) continue;

            orb.Consume(cooldown);
        }
    }

    public ResetOrbs(): void {
        for (let i = 0; i < this._orbs.length; i++) {
            let orb = this._orbs[i];
            orb.Destroy();
        }
        this._orbs = [];
        this.onUpdate();
    }
}