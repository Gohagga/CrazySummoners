import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { IHeroManager } from "systems/hero-manager/IHeroManager";
import { MinionSummoningService, SummonUnitCommand } from "systems/minion-summoning/MinionSummoningService";
import { TeamManager } from "systems/team-manager/TeamManager";
import { MapPlayer, Trigger, Unit } from "w3ts";

export class CheatCommands {

    constructor(
        private readonly enumService: IEnumUnitService,
        private readonly allPlayers: MapPlayer[],
        private readonly teamManager: TeamManager,
        private readonly heroManager: IHeroManager,
        private readonly minionSummoningService: MinionSummoningService,
    ) {
        
    }

    createChatPlayerCommand(chatString: string, exactMatch: boolean, playerIndex?: number): Trigger {
        let t = new Trigger();
        if (playerIndex) {
            t.registerPlayerChatEvent(MapPlayer.fromIndex(playerIndex), chatString, exactMatch);
            return t;
        }
        
        for (let player of this.allPlayers) {
            t.registerPlayerChatEvent(player, chatString, exactMatch);
        }

        return t;
    }

    init() {
        
        const red = MapPlayer.fromIndex(0);

        // Level up 1
        this.createChatPlayerCommand("+1", true, 0).addAction(() => {
            let selected = this.getPlayerSelectedUnits(red)[0];
            if (selected && selected.isHero()) selected.setHeroLevel(selected.getHeroLevel() + 1, true);
        });

        // Level up 20
        this.createChatPlayerCommand("+20", true, 0).addAction(() => {
            let selected = this.getPlayerSelectedUnits(red)[0];
            if (selected && selected.isHero()) selected.setHeroLevel(20, true);
        });

        this.createChatPlayerCommand("-kill", true, 0).addAction(() => {
            let selected = this.getPlayerSelectedUnits(red);
            for (let u of selected) {
                u.kill();
            }
        });

        this.createChatPlayerCommand("-make ", false, 0).addAction(() => {
            let text = GetEventPlayerChatString();
            if (text.startsWith("-make ") == false) return;

            let p = MapPlayer.fromEvent();
            
            let selected = this.getPlayerSelectedUnits(red)[0];
            if (!selected) return;

            let hero = this.heroManager.GetPlayerHero(p);
            if (!hero) return;

            let input = text.substring(6).split(' ');
            let id = FourCC(input[0]);
            let lvl = Number(input[1]);
            let amount = Number(input[2]);
            if (!id || !lvl) return;

            let commands: SummonUnitCommand[] = [];
            for (let i = 0; i < amount; i++) {
                commands.push({
                    unitTypeId: id,
                    level: lvl,
                    ai: () => true,
                });
            }

            this.minionSummoningService.Summon(selected, selected, commands);
        });

        this.createChatPlayerCommand("-camteam", true).addAction(() => {
            let player = MapPlayer.fromEvent();
            let team = this.teamManager.GetPlayerTeam(player);
            let camera = [gg_cam_GameCamera_Red, gg_cam_GameCamera_Blue][team.id];
            CameraSetupApplyForPlayer(true, camera, player.handle, 0.05);
        });

        this.createChatPlayerCommand("-cam", true).addAction(() => {
            let player = MapPlayer.fromEvent();
            CameraSetupApplyForPlayer(true, gg_cam_GameCameraH1, player.handle, 0.05);
        });

        // this.createChatPlayerCommand("-ai", true, 0).addAction(() => {
        //     let selected = this.selectionService.GetPlayerSelectedUnitIds(red);
        //     for (let u of selected) {
        //         u.kill();
        //     }
        // });
        // t = CreateTrigger();
        // TriggerRegisterPlayerChatEvent(t, Player(0), "-ai", true);
        // TriggerAddAction(t, () => {

        //     let p = MapPlayer.fromIndex(1);
        //     // Create a paladin ai for them
        //     IssueNeutralImmediateOrderById(p.handle, GamePlayer.HeroSelect[p.id], Units.Paladin);
        //     let hero = GamePlayer.Hero[p.id];
        //     let ai = new PaladinController(hero, BlueCrystal, GamePlayer.Shop[p.id]);
        //     ai.Start();
        // });
    }

    private readonly group = CreateGroup();
    private getPlayerSelectedUnits(player: MapPlayer) {
        GroupEnumUnitsSelected(this.group, player.handle, null);
        let retVal: Unit[] = [];

        let u: unit | null;
        while ((u = FirstOfGroup(this.group)) != null) {
            GroupRemoveUnit(this.group, u);
            let U = Unit.fromHandle(u);
            retVal.push(U);
        }

        return retVal;
    }
}