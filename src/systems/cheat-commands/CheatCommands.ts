import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { PlayerSelectionService } from "systems/enum-service/PlayerSelectionService";
import { IHeroManager } from "systems/hero-manager/IHeroManager";
import { MinionSummoningService } from "systems/minion-summoning/MinionSummoningService";
import { TeamManager } from "systems/team-manager/TeamManager";
import { MapPlayer, Trigger } from "w3ts";

export class CheatCommands {

    constructor(
        private readonly enumService: IEnumUnitService,
        private readonly allPlayers: MapPlayer[],
        private readonly teamManager: TeamManager,
        private readonly heroManager: IHeroManager,
        private readonly selectionService: PlayerSelectionService,
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
            let selected = this.selectionService.GetPlayerSelectedUnitIds(red)[0];
            if (selected && selected.isHero()) selected.setHeroLevel(selected.getHeroLevel() + 1, true);
        });

        // Level up 20
        this.createChatPlayerCommand("+20", true, 0).addAction(() => {
            let selected = this.selectionService.GetPlayerSelectedUnitIds(red)[0];
            if (selected && selected.isHero()) selected.setHeroLevel(20, true);
        });

        this.createChatPlayerCommand("-kill", true, 0).addAction(() => {
            let selected = this.selectionService.GetPlayerSelectedUnitIds(red);
            for (let u of selected) {
                u.kill();
            }
        });

        this.createChatPlayerCommand("-make ", false, 0).addAction(() => {
            let text = GetEventPlayerChatString();
            if (text.startsWith("-make ") == false) return;

            let p = MapPlayer.fromEvent();
            let selected = this.selectionService.GetPlayerSelectedUnitIds(p)[0];
            if (!selected) return;
            print("selected", selected.id, selected.name);
            DestroyEffect(AddSpecialEffectTarget('StormfallOrange.mdl', selected.handle, "origin"));
            let hero = this.heroManager.GetPlayerHero(p);
            if (!hero) return;

            let input = text.substring(6).split(' ');
            let id = FourCC(input[0]);
            let lvl = Number(input[input.length - 1]);
            if (!id || !lvl) return;

            this.minionSummoningService.Summon(selected, selected, [
                {
                    unitTypeId: id,
                    level: lvl,
                    ai: () => true,
                }
            ])
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
}