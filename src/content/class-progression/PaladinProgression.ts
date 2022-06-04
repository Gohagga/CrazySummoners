import { UnitProgress } from "systems/player-progress/UnitProgress";
import { Unit } from "w3ts";

export class PaladinProgression extends UnitProgress {
    
    constructor(
        protected unit: Unit
    ) {
        super(unit);
    }

    protected Progress(): void {
        
    }
}