import { Log } from "systems/log/Log";
import { MapPlayer } from "w3ts";
import { OrbFactory } from "./OrbFactory";
import { ResourceBar } from "./ResourceBar";

export class ResourceBarManager {
    
    private instances: Record<number, ResourceBar> = {};

    constructor(
        private orbFactory: OrbFactory
    ) {
        
    }

    public Create(player: MapPlayer): ResourceBar {
        const playerId = player.id;

        if (!this.instances[playerId])
            this.instances[playerId] = new ResourceBar(player, this.orbFactory);

        // Orb View register
        return this.instances[playerId];
    }

    public Get(playerId: number): ResourceBar {
        let rb = this.instances[playerId];
        if (!rb) return this.Create(MapPlayer.fromIndex(playerId));
        return rb;
    }
}