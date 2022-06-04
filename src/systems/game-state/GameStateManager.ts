import { Coords } from "systems/coords/Coords"
import { IHeroManager } from "systems/hero-manager/IHeroManager"
import { Log } from "systems/log/Log";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { TeamManager } from "systems/team-manager/TeamManager";
import { Camera, CameraSetup, Dialog, MapPlayer, Timer, Trigger } from "w3ts";

type GameState = 'balanceDialog' | 'mapDialog' | 'setup' | 'playing' | 'roundEnd';

export class GameStateManager {
        
    private gameState: GameState = 'balanceDialog';
    private choiceBalanceSet: string | null = null;
    private choiceMap: MapChoice | null = null;

    constructor(
        // First, select balance set
        private readonly balanceSetChoices: Record<string, { text: string, hotkey: number }>,
        // Then select map
        private readonly mapChoices: Record<string, MapChoice>,

        private readonly heroManager: IHeroManager,
        private readonly minionFactory: MinionFactory,
        private readonly teamManager: TeamManager,
    ) {
        let dialogChoiceTrigger = new Trigger();
        
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
        mapDialog: () => this.ExecuteMapDialog(),
        setup: () => this.ExecuteSetup(),
        playing: function (): void {
            throw new Error("Function not implemented.");
        },
        roundEnd: function (): void {
            throw new Error("Function not implemented.");
        }
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
                this.balanceDialog.setMessage("Choose Balance Set");
                for (let k of Object.keys(this.balanceSetChoices)) {
                    let choice = this.balanceSetChoices[k];
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
        this.minionFactory.SetBalanceSet(this.choiceBalanceSet);

        this.gameState = "mapDialog";
        Log.Info("Entering Game State: MapDialog");
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceBalanceSet = null;
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
    }
}

export type MapChoice = {
    teamStartingPosition: Record<number, Coords>,
    teamCamera: Record<number, CameraSetup>
}