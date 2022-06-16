import { OrbType } from "content/constants/OrbType";
import { IResourceBarModel } from "ui/orbs/interfaces/IResourceBarModel";
import { MapPlayer } from "w3ts";
import { Orb } from "./Orb";
import { OrbFactory } from "./OrbFactory";

export interface ResourceBarConfig {
    summoningOrbCooldown: number,
    coloredOrbCooldown: number,
}

export class ResourceBar implements IResourceBarModel {

    private _orbs: Orb[] = [];
    private coloredOrbCooldown: number;
    private summoningOrbCooldown: number;

    onUpdate = () => {};

    constructor(
        private owner: MapPlayer,
        private orbFactory: OrbFactory,
        config: ResourceBarConfig,
    ) {
        this.coloredOrbCooldown = config.coloredOrbCooldown;
        this.summoningOrbCooldown = config.summoningOrbCooldown;
    }

    public get orbs(): Orb[] {
        return this._orbs;
    }

    public AddOrb(orbType: OrbType): Orb {
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
}