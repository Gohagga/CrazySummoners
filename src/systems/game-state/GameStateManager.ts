import { Coords } from "systems/coords/Coords"
import { IHeroManager } from "systems/hero-manager/IHeroManager"
import { Log } from "systems/log/Log";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { TeamManager } from "systems/team-manager/TeamManager";
import { VoteDialogButtonInfo, VoteDialogService } from "systems/vote-dialog-service/VoteDialogService";
import { Camera, CameraSetup, Dialog, MapPlayer, Rectangle, Region, Timer, Trigger, Unit } from "w3ts";

type GameState = 'balanceDialog' | 'unitBalanceDialog' | 'mapDialog' | 'setup' | 'playing' | 'roundEnd';

export interface GameStateManagerConfig {
    // First, select game balance set
    balanceSetChoices: Record<string, { text: string, hotkey: number }>,
    // Then unit balance
    unitBalanceSetChoices: Record<string, { text: string, hotkey: number }>,
    // Then select map
    mapChoices: Record<string, MapChoice>,

    // Damage Regions
    teamDamageRegion: Record<number, rect[]>,
}

export class GameStateManager {
    
    private readonly balanceSetChoices: Record<string, { text: string, hotkey: number }>;
    private readonly unitBalanceSetChoices: Record<string, { text: string, hotkey: number }>;
    private readonly mapChoices: Record<string, MapChoice>;
    private readonly teamDamageRegions: Record<number, Region> = {};

    
    private gameState: GameState = 'balanceDialog';
    private choiceBalanceSet: string | null = null;
    private choiceUnitBalanceSet: string | null = null;
    private choiceMap: MapChoice | null = null;
    private teamDamageTriggers: Record<number, Trigger> = {};

    private teamDamage: Record<number, number> = {};

    constructor(
        config: GameStateManagerConfig,
        private readonly heroManager: IHeroManager,
        private readonly minionFactory: MinionFactory,
        private readonly teamManager: TeamManager,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly voteDialogService: VoteDialogService,
    ) {
        this.balanceSetChoices = config.balanceSetChoices;
        this.unitBalanceSetChoices = config.unitBalanceSetChoices;
        this.mapChoices = config.mapChoices;

        let dialogChoiceTrigger = new Trigger();

        // Setup regions
        for (let k of Object.keys(config.teamDamageRegion)) {
            let teamId = Number(k);
            let region = new Region();
            for (let rect of config.teamDamageRegion[teamId]) {
                region.addRect(Rectangle.fromHandle(rect));
            }
            this.teamDamageRegions[teamId] = region;
        }
        
        new Timer().start(1, false, () => {

            Log.Info("Entering Game State: BalanceDialog");
            this.gameState = 'balanceDialog';
            this.ExecuteGameState();
        });
    }

    private ShowDialog(dialog: Dialog, show: boolean) {
        for (let p of this.teamManager.players) {
            dialog.display(p, show);
        }
    }

    private state: Record<GameState, () => void> = {
        balanceDialog: () => this.ExecuteBalanceDialog(),
        unitBalanceDialog: () => this.ExecuteUnitBalanceDialog(),
        mapDialog: () => this.ExecuteMapDialog(),
        setup: () => this.ExecuteSetup(),
        playing: () => this.ExecutePlaying(),
        roundEnd: () => this.ExecuteRoundEnd(),
    }

    private ExecuteGameState() {
        this.state[this.gameState]();
    }

    private balanceDialog: Dialog | null = null;
    private ExecuteBalanceDialog(): void {
        // If choiceBalanceSet is null, we have to show and select it
        if (this.choiceBalanceSet == null) {
            if (this.balanceDialog == null) {
                this.balanceDialog = new Dialog();
                this.balanceDialog.setMessage("Choose Game Balance Set");
                for (let k of Object.keys(this.unitBalanceSetChoices)) {
                    let choice = this.unitBalanceSetChoices[k];
                    let button = this.balanceDialog.addButton(choice.text, choice.hotkey, false, false);
                    
                    let balanceSetId = k;
                    let t = new Trigger();
                    t.registerDialogButtonEvent(button);
                    t.addAction(() => {
                        this.choiceBalanceSet = balanceSetId;
                        this.ExecuteGameState();
                    });
                }
            }

            this.ShowDialog(this.balanceDialog, true);
            return;
        }

        // If choiceBalanceSet is selected, we enter next state
        this.minionFactory.SetGameBalanceSet(this.choiceBalanceSet);
        this.resourceBarManager.SetGameBalanceSet(this.choiceBalanceSet);

        this.gameState = 'unitBalanceDialog';
        Log.Info("Entering Game State: UnitBalanceDialog");
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceBalanceSet = null;
    }

    private ExecuteUnitBalanceDialog(): void {
        // If choiceBalanceSet is null, we have to show and select it
        if (this.choiceUnitBalanceSet == null) {
            
            let buttons: VoteDialogButtonInfo<string>[] = [];
            for (let k of Object.keys(this.balanceSetChoices)) {
                let choice = this.balanceSetChoices[k];
                buttons.push({
                    text: choice.text,
                    value: k,
                });
            }

            this.voteDialogService.ShowDialog<string>([MapPlayer.fromIndex(0)], {
                title: "Choose Unit Balance Set",
                buttons: buttons,
                timeout: 0
            }, result => {
                this.choiceUnitBalanceSet = result;
                this.ExecuteGameState();
            });
            return;
        }

        // If choiceBalanceSet is selected, we enter next state
        this.minionFactory.SetUnitBalanceSet(this.choiceUnitBalanceSet);

        this.gameState = "mapDialog";
        Log.Info("Entering Game State: MapDialog");
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceUnitBalanceSet = null;
    }

    private mapDialog: Dialog | null = null;
    private ExecuteMapDialog(): void {
        // If choiceMap is null, we have to show and select it
        if (this.choiceMap == null) {
            if (Object.keys(this.mapChoices).length == 1) {
                this.choiceMap = this.mapChoices[0];
                this.ExecuteGameState();
                return;
            }
            if (this.mapDialog == null) {
                this.mapDialog = new Dialog();
                this.mapDialog.setMessage("Choose Map");
                for (let k of Object.keys(this.mapChoices)) {
                    let choice = this.mapChoices[k];
                    let button = this.mapDialog.addButton(k, undefined, false, false);

                    let mapChoice = choice;
                    let t = new Trigger();
                    t.registerDialogButtonEvent(button);
                    t.addAction(() => {
                        this.choiceMap = mapChoice;
                        this.ExecuteGameState();
                    });
                }
            }

            this.ShowDialog(this.mapDialog, true);
            return;
        }

        // If choiceBalanceSet is selected, we enter next state
        // Set up map (this.choiceMap);
        
        this.gameState = "setup";
        Log.Info("Entering Game State: Setup");
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceMap = null;
    }

    ExecuteSetup(): void {
        if (!this.choiceMap) return;

        for (let team of this.teamManager.teams) {
            let loc = this.choiceMap.teamStartingPosition[team.id];
            const heroShop = this.heroManager.CreateHeroShop(loc, team.teamOwner);

            let camera = this.choiceMap.teamCamera[team.id];
            for (let p of team.teamMembers) {
                if (p.isLocal()) {
                    print("Setting camera", team.id, p.id, camera.id);
                    camera.applyForceDuration(true, 0.05);
                }
                ClearSelectionForPlayer(p.handle);
                SelectUnitForPlayerSingle(heroShop.handle, p.handle);
            }
        }
        
        this.teamDamage = {};
        for (let t of this.teamManager.teams) {
        
            print("Team", t.id);
            let team = t; // Need for closure
            this.teamDamage[team.id] = 0;
            if (this.teamDamageTriggers[team.id]) this.teamDamageTriggers[team.id].destroy();
            
            print("Registering damage region event", this.teamDamageRegions[team.id].id);
            let trg = new Trigger();
            trg.registerEnterRegion(this.teamDamageRegions[team.id].handle, null);
            trg.addAction(() => {

                let unit = Unit.fromEvent();
                print("Unit entering damage area");
                this.teamDamage[team.id]++;
                print("Team damage", this.teamDamage[team.id]);
                this.ExecuteGameState();
                
                unit.destroy();
            });
            
            this.teamDamageTriggers[team.id] = trg;
        }

        this.gameState = 'playing';
    }

    ExecutePlaying(): void {

        Log.Info("Execute Game State: Playing");

        for (let team of this.teamManager.teams) {

            let damage = this.teamDamage[team.id];
            print("Damage?", damage);
            
            let totalHp = 0;
            for (let member of team.teamMembers) {

                let hero = this.heroManager.GetPlayerHero(member);
                if (!hero) continue;

                totalHp += hero.life;
                if (damage == 0) continue;

                hero.damageTarget(hero.handle, damage, false, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_UNIVERSAL, WEAPON_TYPE_WHOKNOWS);
                totalHp -= damage;
            }

            // Check for victory condition
            if (totalHp == 0) {
                Log.Message("Team " + team.id + " was victorious.");
                this.gameState = 'roundEnd';
                this.ExecuteGameState();
            }
        }
    }

    ExecuteRoundEnd(): void {
        new Timer().start(5.0, false, () => {
            Timer.fromExpired().destroy();

            // Remove all heroes
            for (let team of this.teamManager.teams) {
                for (let member of team.teamMembers) {    
                    let hero = this.heroManager.GetPlayerHero(member);
                    if (hero) hero.destroy();                    
                }
            }

            this.gameState = 'balanceDialog';
            this.ExecuteGameState();
        });
    }
    
}

export type MapChoice = {
    teamStartingPosition: Record<number, Coords>,
    teamCamera: Record<number, CameraSetup>
}