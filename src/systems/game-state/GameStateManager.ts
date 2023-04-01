import { Zones } from "content/constants/Zones";
import { Coords } from "systems/coords/Coords"
import { IEnumUnitService } from "systems/enum-service/IEnumUnitService";
import { IHeroManager } from "systems/hero-manager/IHeroManager"
import { Log } from "systems/log/Log";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { TeamManager } from "systems/team-manager/TeamManager";
import { VoteDialogButtonInfo, VoteDialogService } from "systems/vote-dialog-service/VoteDialogService";
import { Camera, CameraSetup, Dialog, FogModifier, MapPlayer, Rectangle, Region, Timer, Trigger, Unit } from "w3ts";

type GameState = 'balanceDialog' | 'unitBalanceDialog' | 'mapDialog' | 'setup' | 'heroSelection' | 'playing' | 'roundEnd';

export interface GameStateManagerConfig {
    // First, select game balance set
    balanceSetChoices: Record<string, { text: string, hotkey: number }>,
    // Then unit balance
    unitBalanceSetChoices: Record<string, { text: string, hotkey: number }>,
    // Then select map
    mapChoices: Record<string, MapChoice>,

    // Damage Regions
    teamDamageRegion: Record<number, rect[]>,
    // Minion clear regions
    playingBoard: rect[],
}

export class GameStateManager {
    
    private readonly balanceSetChoices: Record<string, { text: string, hotkey: number }>;
    private readonly unitBalanceSetChoices: Record<string, { text: string, hotkey: number }>;
    private readonly mapChoices: Record<string, MapChoice>;
    private readonly teamDamageRegions: Record<number, Region> = {};
    private readonly playingBoard: Rectangle[] = [];
    private readonly unitsNotToRemove: Set<number> = new Set<number>();
    private readonly mapPlayerFogModifier: Record<string, Record<number, FogModifier[]>> = {};
    private readonly heroSelectorUnits: Unit[] = [];
    
    private gameState: GameState = 'balanceDialog';
    private choiceBalanceSet: string | null = null;
    private choiceUnitBalanceSet: string | null = null;
    private choiceMap: MapChoice | null = null;
    private choiceMapId: string | null = null;
    private teamDamageTriggers: Record<number, Trigger> = {};

    private teamDamage: Record<number, number> = {};

    constructor(
        config: GameStateManagerConfig,
        private readonly heroManager: IHeroManager,
        private readonly minionFactory: MinionFactory,
        private readonly teamManager: TeamManager,
        private readonly resourceBarManager: ResourceBarManager,
        private readonly voteDialogService: VoteDialogService,
        private readonly enumService: IEnumUnitService,
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

        for (let b of config.playingBoard) {
            this.playingBoard.push(Rectangle.fromHandle(b));
        }
        
        new Timer().start(1, false, () => {

            Log.Info("Entering Game State: BalanceDialog");
            this.gameState = 'balanceDialog';
            
            this.ExecuteGameState();
            // Timer.fromExpired().destroy();
        });

        this.heroManager.OnPlayerSelected(() => {
            if (this.gameState == 'heroSelection') this.ExecuteGameState();
        });
    }

    private SetEnabledFogModifierForPlayer(choiceMapId: string | null, p: MapPlayer, enabled: boolean) {
        if (!choiceMapId) return;

        let mapFogmos = this.mapPlayerFogModifier[choiceMapId];
        if (!mapFogmos) {
            this.mapPlayerFogModifier[choiceMapId] = mapFogmos = {};
        }
        
        let playerFogmos = mapFogmos[p.id];
        if (!playerFogmos) {
            playerFogmos = mapFogmos[p.id] = [];

            let map = this.mapChoices[choiceMapId];
            for (let rect of map.visibility) {
                let fogmo = FogModifier.fromRect(p, FOG_OF_WAR_VISIBLE, Rectangle.fromHandle(rect), true, true);
                playerFogmos.push(fogmo);
            }
        }
        
        for (let fogmo of playerFogmos) {
            if (enabled) fogmo.start();
            else fogmo.stop();
        }
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
        heroSelection: () => this.ExecuteHeroSelection(),
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

            // If there is only one choice, automatically choose
            let balanceChoices = Object.keys(this.balanceSetChoices);
            if (balanceChoices.length < 2) {
                this.choiceBalanceSet = balanceChoices[0];
                this.ExecuteGameState();
                return;
            }
            
            if (this.balanceDialog == null) {
                this.balanceDialog = new Dialog();
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

            this.balanceDialog.setMessage("Choose Game Balance Set");
            this.ShowDialog(this.balanceDialog, true);
            return;
        }

        // If choiceBalanceSet is selected, we enter next state
        this.minionFactory.SetGameBalanceSet(this.choiceBalanceSet);
        this.resourceBarManager.SetGameBalanceSet(this.choiceBalanceSet);

        this.gameState = 'unitBalanceDialog';
        Log.Info("Entering Game State: UnitBalanceDialog");
        Log.Message("Game balance chosen: " + this.balanceSetChoices[this.choiceBalanceSet].text);
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceBalanceSet = null;
    }

    private ExecuteUnitBalanceDialog(): void {
        // If choiceBalanceSet is null, we have to show and select it
        if (this.choiceUnitBalanceSet == null) {
            
            // If there is only one choice, automatically choose
            let unitBalanceChoices = Object.keys(this.unitBalanceSetChoices);
            if (unitBalanceChoices.length < 2) {
                this.choiceUnitBalanceSet = unitBalanceChoices[0];
                this.ExecuteGameState();
                return;
            }

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
        Log.Message("Unit balance chosen: " + this.unitBalanceSetChoices[this.choiceUnitBalanceSet].text);
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceUnitBalanceSet = null;
    }

    private mapDialog: Dialog | null = null;
    private ExecuteMapDialog(): void {

        // If choiceMap is null, we have to show and select it
        if (this.choiceMap == null) {

            // If there is only one choice, automatically choose
            let mapChoices = Object.keys(this.mapChoices);
            if (mapChoices.length < 2) {
                this.choiceMapId = mapChoices[0];
                this.choiceMap = this.mapChoices[this.choiceMapId];
                this.ExecuteGameState();
                return;
            }

            if (this.mapDialog == null) {
                this.mapDialog = new Dialog();
                for (let k of Object.keys(this.mapChoices)) {
                    let mapId = k;
                    let choice = this.mapChoices[mapId];
                    let button = this.mapDialog.addButton(k, undefined, false, false);

                    let mapChoice = choice;
                    let t = new Trigger();
                    t.registerDialogButtonEvent(button);
                    t.addAction(() => {
                        this.choiceMapId = mapId;
                        this.choiceMap = mapChoice;
                    this.ExecuteGameState();
                    });
                }
            }

            this.mapDialog.setMessage("Choose Map");
            this.ShowDialog(this.mapDialog, true);
            return;
        }

        // If choiceBalanceSet is selected, we enter next state
        // Set up map (this.choiceMap);
        
        this.gameState = "setup";
        Log.Info("Entering Game State: Setup");
        Log.Message("Map chosen: " + this.choiceMap.name);
        this.ExecuteGameState();

        // Reset balance choice
        this.choiceMap = null;
    }

    ExecuteSetup(): void {
        if (!this.choiceMap) return;

        // Saving the units not to remove on board reset
        this.unitsNotToRemove.clear();
        let unitsInPlayArea: Unit[] = [];
        for (let rect of this.playingBoard) {
            this.enumService.EnumUnitsInRect(rect, undefined, unitsInPlayArea);
        }
        for (let u of unitsInPlayArea) {
            this.unitsNotToRemove.add(u.id);
        }

        // Creating hero shop
        for (let team of this.teamManager.teams) {
            let loc = this.choiceMap.teamStartingPosition[team.id];
            const heroShop = this.heroManager.CreateHeroShop(loc, team.teamOwner);
            this.heroSelectorUnits.push(heroShop);

            let camera = this.choiceMap.teamCamera[team.id];
            for (let p of team.teamMembers) {
                if (p.isLocal()) {
                    camera.applyForceDuration(true, 0.05);
                    // PanCameraToTimedForPlayer(p.handle, camera.destPoint.x, camera.destPoint.y, 0.05);
                }
                this.SetEnabledFogModifierForPlayer(this.choiceMapId, p, true);
                ClearSelectionForPlayer(p.handle);
                SelectUnitForPlayerSingle(heroShop.handle, p.handle);
            }
        }

        // Binding camera to play area
        let playArea = this.choiceMap.playArea;
        new Timer().start(0.1, false, () => {
            SetCameraBoundsToRect(playArea);
            DestroyTimer(GetExpiredTimer());
        });

        // Setting up lanes
        for (let laneId of Object.keys(this.choiceMap.laneZones)) {
            let zoneId = <Zones>Number(laneId);
            let lane = this.choiceMap.laneZones[zoneId];
            let rects: Rectangle[] = [];
            for (let r of lane.rectangles) {
                rects.push(Rectangle.fromHandle(r));
            }
            this.enumService.RegisterZone(zoneId, rects, lane.circles);
        }

        this.teamDamage = {};
        for (let t of this.teamManager.teams) {
        
            let team = t; // Need for closure
            this.teamDamage[team.id] = 0;
            if (this.teamDamageTriggers[team.id]) this.teamDamageTriggers[team.id].destroy();
            
            let trg = new Trigger();
            trg.registerEnterRegion(this.teamDamageRegions[team.id].handle, null);
            trg.addAction(() => {

                if (this.gameState != 'playing') return;
                
                let unit = Unit.fromEvent();

                if (!unit.isEnemy(t.teamOwner)) return;

                this.teamDamage[team.id]++;
                this.ExecuteGameState();
                
                unit.destroy();
            });
            
            this.teamDamageTriggers[team.id] = trg;
        }

        Log.Info("Entering Game State: HeroSelection");
        this.gameState = 'heroSelection';
        // this.ExecuteGameState();
    }

    ExecuteHeroSelection(): void {

        // Check if all heroes have chosen
        for (let p of this.teamManager.players) {
            if (p.slotState != PLAYER_SLOT_STATE_PLAYING || p.controller != MAP_CONTROL_USER) continue;

            let hero = this.heroManager.GetPlayerHero(p);
            if (!hero) return;
        }

        // All heroes have been selected
        Log.Info("All heroes have been selected.");
        let countdown = 5;
        
        // Reset resource bars
        for (let p of this.teamManager.players) {
            this.resourceBarManager.Get(p.id).ResetCooldowns(countdown);
        }

        // Remove hero selectors
        for (let hs of this.heroSelectorUnits) {
            hs.kill();
        }

        new Timer().start(1, true, () => {

            countdown--;
            Log.Message(countdown + "...");
            if (countdown == 0) {
                Timer.fromExpired().destroy();

                Log.Info("Entering Game State: Playing");
                Log.Message("Battle!");
                this.gameState = 'playing';
                // It will be executed when minion enters damage area
                // this.ExecuteGameState();

                // Reset board
                let unitsInPlayArea: Unit[] = [];
                for (let rect of this.playingBoard) {
                    this.enumService.EnumUnitsInRect(rect, u =>
                        this.unitsNotToRemove.has(u.id) == false, unitsInPlayArea);
                }
                for (let u of unitsInPlayArea) {
                    u.destroy();
                }

                // Reset player mana/hp
                for (let p of this.teamManager.players) {
                    let hero = this.heroManager.GetPlayerHero(p);
                    if (!hero) continue;
                    hero.life = hero.maxLife;
                    hero.mana = 0;
                }
            }
        });
    }
    
    ExecutePlaying(): void {

        Log.Info("Execute Game State: Playing");

        for (let team of this.teamManager.teams) {

            let damage = this.teamDamage[team.id];
            
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
                    this.heroManager.RemoveHero(member);
                    this.SetEnabledFogModifierForPlayer(this.choiceMapId, member, false);
                    this.resourceBarManager.Get(member.id).ResetOrbs();
                }
            }

            // Reset board
            let unitsInPlayArea: Unit[] = [];
            for (let rect of this.playingBoard) {
                this.enumService.EnumUnitsInRect(rect, u =>
                    this.unitsNotToRemove.has(u.id) == false, unitsInPlayArea);
            }
            for (let u of unitsInPlayArea) {
                u.destroy();
            }

            this.gameState = 'balanceDialog';
            this.ExecuteGameState();
        });
    }
    
}

export type MapChoice = {
    name: string,
    teamStartingPosition: Record<number, Coords>,
    teamCamera: Record<number, CameraSetup>,
    visibility: rect[],
    playArea: rect,
    laneZones: Record<Zones, {
        rectangles: rect[],
        circles: Coords[]
    }>
}