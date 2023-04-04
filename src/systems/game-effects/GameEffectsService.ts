import { MapPlayer, Unit } from "w3ts";
import { IGameEffects } from "./IGameEffects";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { TeamManager } from "systems/team-manager/TeamManager";
import { MinionAiManager } from "systems/minion-ai/MinionAiManager";
import { MinionSummoningService } from "systems/minion-summoning/MinionSummoningService";

export class GameEffectsService implements IGameEffects 
{
    constructor(
        private readonly minionSummoningService: MinionSummoningService
    ) {
    }

    HealUnit(caster: Unit, whichUnit: Unit, amount: number): void {
        SetWidgetLife(whichUnit.handle, whichUnit.life + amount);
    }

    ReviveUnit(caster: Unit, whichUnit: Unit, owner?: MapPlayer): Unit {
        return this.minionSummoningService.ReviveSummon(caster, whichUnit, owner);
    }
}