import { MapPlayer } from "w3ts";
import { IRequirement } from "./IRequirement";

export interface Upgrade<RequirementType> {
    id: number,
    checks: { reqType: RequirementType, level: number }[];
}

export class RequirementTracker<RequirementType extends number> {

    private readonly reqTypes: RequirementType[];
    private readonly subscriptions: Map<RequirementType, Upgrade<RequirementType>[]> = new Map<RequirementType, Upgrade<RequirementType>[]>();

    constructor(
        private readonly requirements: Record<RequirementType, IRequirement>
    ) {
        this.reqTypes = [];
        let keys = Object.keys(requirements) as unknown as RequirementType[];
        for (let k of keys) {
            this.reqTypes.push(k);
            let type = k;
            requirements[k].OnChange(player => {
                
                let subs = this.subscriptions.get(type);
                if (!subs) return;

                // CHECK FOR STUFF HERE
                for (let checks of subs) {
                    this.Resolve(player, checks);
                }
            });
        }
    }

    Register(upgradeCode: string, cost: RequirementType[]) {

        let upgradeId: number = FourCC(upgradeCode);
        let costs: Record<number, number> = {};
        for (let i = 0; i < cost.length; i++) {
            let type = cost[i];
            let current = costs[type] || 0;
            costs[type] = current + 1;
        }

        const upgrade: Upgrade<RequirementType> = {
            id: upgradeId,
            checks: [],
        };

        for (let type of this.reqTypes) {
            if (costs[type] && costs[type] > 0) {
                // Create the check
                upgrade.checks.push({
                    level: costs[type],
                    reqType: type
                });
            }
        }

        // Register the upgrade object to all the type changes
        for (let check of upgrade.checks) {
            let subs = this.subscriptions.get(check.reqType) || [];
            subs.push(upgrade);
            this.subscriptions.set(check.reqType, subs);
        }
    }

    Resolve(player: MapPlayer, upgrade: Upgrade<RequirementType>): boolean {

        // Check if any of the levels is below the required
        for (let check of upgrade.checks) {
            let req = this.requirements[check.reqType];
            if (req) {
                if (req.Get(player) < check.level) {
                    player.decTechResearched(upgrade.id, GetPlayerTechCountSimple(upgrade.id, player.handle));
                    return false;
                }
            }
        }

        // We haven't returned yet, it means the requirements are fulfilled
        player.addTechResearched(upgrade.id, 1);
        return true;
    }
}