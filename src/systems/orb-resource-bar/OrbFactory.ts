import { OrbType } from "content/orbs/OrbType";
import { MapPlayer } from "w3ts";
import { Orb, OrbConfig } from "./Orb";

export class OrbFactory {

    constructor(
        private orbConfig: OrbConfig
    ) {
    }

    public Create(orbType: OrbType, owner: MapPlayer): Orb {
        let orb = new Orb(this.orbConfig, owner, orbType);
        return orb;
    }
}