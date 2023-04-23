import { Zones } from "content/constants/Zones";
import { Coords } from "systems/coords/Coords";
import { MapChoice } from "systems/game-state/GameStateManager";
import { TeamManager } from "systems/team-manager/TeamManager";
import { MapPlayer, Rectangle, Region, Unit } from "w3ts";

export class BattlegroundService {
    
    private activeMapId: string | null = null;
    private zoneRegion: Record<Zones, Region> | null = null;
    private mapChoice: MapChoice | null = null;
    private playArea: Rectangle | null = null;

    constructor(
        private readonly mapChoices: Record<string, MapChoice>,
        private readonly teamManager: TeamManager
    ) {
        
    }

    public SetMap(mapChoiceId: string) {
        this.activeMapId = mapChoiceId;
        this.mapChoice = this.mapChoices[mapChoiceId];

        let zoneRegion: Record<Zones, Region> = {
            [Zones.Lane1]: new Region,
            [Zones.Lane2]: new Region,
            [Zones.Lane3]: new Region,
            [Zones.Lane4]: new Region,
            [Zones.Lane5]: new Region,
            [Zones.Battleground]: new Region(),
        };
        
        for (let zoneIdCode of Object.keys(this.mapChoice.zoneRegions)) {
            let zoneId = <Zones>Number(zoneIdCode);
            let zone = this.mapChoice.zoneRegions[zoneId];
            
            for (let r of zone.rectangles) {
                zoneRegion[zoneId].addRect(Rectangle.fromHandle(r));
            }
        }
        this.zoneRegion = zoneRegion;
        this.playArea = Rectangle.fromHandle(this.mapChoice.playArea);
    }

    public GetUnitZone(unit: Unit) : Zones | null {

        if (!this.activeMapId || !this.mapChoice || !this.zoneRegion) return null;

        let zoneIds = Object.keys(this.mapChoice.zoneRegions);

        for (let zoneIdCode of zoneIds) {
            let zoneId = <Zones>Number(zoneIdCode);
            let zone = this.mapChoice.zoneRegions[zoneId];

            // Check region first
            if (this.zoneRegion[zoneId].containsUnit(unit))
                return zoneId;

            // Then check circles
            for (let c of zone.circles) {
                if (IsUnitInRangeXY(unit.handle, c.x, c.y, c.z))
                    return zoneId;
            }
        }

        return null;
    }

    public GetPlayerZoneCrystal(player: MapPlayer, zone: Zones) : Unit | null {
        if (!this.mapChoice) throw "map choice has not been set";

        const team = this.teamManager.GetPlayerTeam(player);
        for (let crystalUnit of this.mapChoice.zoneCrystals[zone]) {
            if (IsPlayerAlly(GetOwningPlayer(crystalUnit), team.teamOwner.handle))
                return Unit.fromHandle(crystalUnit);
        }

        return null;
    }

    public GetPlayAreaRect(): Rectangle {
        if (!this.playArea) throw "map choice has not been set";
        return this.playArea;
    }

    public UpdateBattleground() {
        
    }
}