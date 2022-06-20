import { Log } from "systems/log/Log";
import { MapPlayer } from "w3ts";
import { OrbFactory } from "./OrbFactory";
import { ResourceBar, ResourceBarConfig } from "./ResourceBar";

export interface ResourceBarManagerConfig {
    gameBalance: Record<string, ResourceBarConfig>
}

export class ResourceBarManager {
    
    private instances: Record<number, ResourceBar> = {};

    private gameBalances: Record<string, ResourceBarConfig>;
    private gameBalance: ResourceBarConfig = {
        coloredOrbCooldown: 20,
        summoningOrbCooldown: 20,
        coloredMaxCount: 12,
        summoningMaxCount: 6,
    }

    constructor(
        private orbFactory: OrbFactory,
        config: ResourceBarManagerConfig,
    ) {
        this.gameBalances = config.gameBalance;
    }

    public SetGameBalanceSet(id: string): void {
        Log.Info("Setting resource bar balance", id);
        this.gameBalance = this.gameBalances[id];
    }

    public Create(player: MapPlayer): ResourceBar {
        const playerId = player.id;

        if (this.instances[playerId]) {    
            this.instances[playerId].ResetOrbs();
        }
        this.instances[playerId] = new ResourceBar(player, this.orbFactory, this.gameBalance);

        // Orb View register
        for (let c of this.onCreate) {
            c(player, this.instances[playerId]);
        }

        return this.instances[playerId];
    }

    public Get(playerId: number): ResourceBar {
        let rb = this.instances[playerId];
        if (!rb) return this.Create(MapPlayer.fromIndex(playerId));
        return rb;
    }

    private readonly onCreate: ((owner: MapPlayer, resourceBar: ResourceBar) => void)[] = [];
    public OnCreate(action: (owner: MapPlayer, resourceBar: ResourceBar) => void) {
        this.onCreate.push(action);
    }
}