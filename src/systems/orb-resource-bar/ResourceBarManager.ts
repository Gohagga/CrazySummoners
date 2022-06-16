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

        if (!this.instances[playerId])
            this.instances[playerId] = new ResourceBar(player, this.orbFactory, this.gameBalance);

        // Orb View register
        return this.instances[playerId];
    }

    public Get(playerId: number): ResourceBar {
        let rb = this.instances[playerId];
        if (!rb) return this.Create(MapPlayer.fromIndex(playerId));
        return rb;
    }
}