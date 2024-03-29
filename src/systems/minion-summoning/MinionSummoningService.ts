import { Coords } from "systems/coords/Coords";
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { Log } from "systems/log/Log";
import { AiState } from "systems/minion-ai/AiState";
import { MinionAiManager } from "systems/minion-ai/MinionAiManager";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { TeamManager } from "systems/team-manager/TeamManager";
import { MapPlayer, Rectangle, Timer, Unit } from "w3ts";
import { OrderId } from "w3ts/globals/order";

export interface MinionSummoningServiceConfig {
    summoningCrystals: SummoningCrystal[]
}

export type SummoningCrystal = {
    unit: unit,
    region: rect,
    limit?: number,
    destination: unit,
}

export type SummonUnitCommand = {
    unitTypeId: number,
    level?: number,
    offset?: Coords,
    ai: (unit: Unit) => boolean,
}

export class MinionSummoningService {

    private readonly crystals: Record<number, { unit: Unit, region: Rectangle, limit: number | null, destination: Unit }> = {};

    constructor(
        config: MinionSummoningServiceConfig,
        private readonly minionFactory: MinionFactory,
        private readonly enumService: IEnumUnitService,
        private readonly teamManager: TeamManager,
        private readonly minionAiManager: MinionAiManager,
    ) {
        for (let cry of config.summoningCrystals) {
            let u = Unit.fromHandle(cry.unit);
            this.crystals[u.id] = {
                unit: u,
                region: Rectangle.fromHandle(cry.region),
                limit: cry.limit || null,
                destination: Unit.fromHandle(cry.destination),
            };
        }
    }

    public Summon(summoner: Unit, targetCrystal: Unit, units: SummonUnitCommand[]): boolean {

        let crystal = this.crystals[targetCrystal.id];
        if (!crystal) Log.Error("Target crystal not configured.");

        let out: Unit[] = [];
        this.enumService.EnumUnitsInRect(crystal.region, undefined, out);

        if (crystal.limit && out.length + units.length > crystal.limit)
            return false;

        // Do summon stuff
        let team = this.teamManager.GetPlayerTeam(summoner.owner);
        let owner = (team && team.teamOwner) || summoner.owner;

        let summons: Unit[] = [];

        let x = crystal.region.centerX;
        let y = crystal.region.centerY;
        let crystalPos = Coords.fromUnit(targetCrystal);
        let facing = Atan2(crystalPos.y - y, crystalPos.x - x);

        for (let command of units) {
            let loc = new Coords(x, y);
            if (command.offset) {
                loc.x += command.offset.x;
                loc.y += command.offset.y;
            }
            let minion = this.minionFactory.CreateMinion(owner, command.unitTypeId, command.level || 1, loc);
            this.minionAiManager.Register(this.CreateDefaultAiState(minion, crystalPos, Coords.fromUnit(crystal.destination), u => command.ai(u)));

            summons.push(minion);

            minion.facing = facing;
            this.StartSummoningSickness({
                iterations: 20,
                unit: minion,
            });
        }
        
        return true;
    }

    public ReviveSummon(summoner: Unit, whichUnit: Unit, owner?: MapPlayer): Unit {
        
        if (!owner) owner = whichUnit.owner;

        let team = this.teamManager.GetPlayerTeam(summoner.owner);
        owner = (team && team.teamOwner) || summoner.owner;

        let lvl = this.minionFactory.GetMinionLevel(whichUnit);
        let revived = this.minionFactory.CreateMinion(owner, whichUnit.typeId, lvl, whichUnit.point);
        let flipCrystals = !owner.isPlayerAlly(whichUnit.owner);        

        let aiState = this.minionAiManager.Get(whichUnit.id);
        aiState = {
            destination: aiState.destination,
            origin: aiState.origin,
            unit: revived,
            Update: aiState.Update
        }
        if (flipCrystals) {
            let origin = aiState.origin;
            aiState.origin = aiState.destination;
            aiState.destination = origin;
        }
        
        this.minionAiManager.Register(aiState);
        this.minionAiManager.Unregister(whichUnit.id);

        revived.facing = whichUnit.facing;
        revived.mana = whichUnit.mana;
        revived.life = 1;
        
        whichUnit.destroy();
        return revived;
    }

    CreateDefaultAiState(minion: Unit, origin: Coords, destination: Coords, ai: (unit: Unit) => boolean): AiState {
        let aiState: AiState = {
            unit: minion,
            origin: origin,
            destination: destination,
            Update: (data: AiState) => {

                if (!data.unit.handle) return false;

                // If unit is busy, don't do anything
                if (data.unit.currentOrder != 0) return true;

                // If not feared
                data.unit.issueOrderAt(OrderId.Attack, data.destination.x, data.destination.y);
                // If feared
                // minion.issueOrderAt(OrderId.Move, origin.x, origin.y);

                return ai(data.unit);
            },
        };
        return aiState;
    }

    private StartSummoningSickness(data: UnitSummonData) {
        
        data.unit.setVertexColor(255, 255, 255, 0);
        data.unit.invulnerable = true;

        let timer = new Timer();
        timer.start(0.05, true, () => {
            if (data.iterations > 0) {
                data.iterations--;
                data.unit.setVertexColor(255, 255, 255, 255 - math.floor(data.iterations * 12.5));
            } else {
                data.unit.setVertexColor(255, 255, 255, 255);
                data.unit.paused = false;
                data.unit.invulnerable = false;
                timer.destroy();
            }
        });
    }
}

export type UnitSummonData = {
    unit: Unit,
    iterations: number,

}