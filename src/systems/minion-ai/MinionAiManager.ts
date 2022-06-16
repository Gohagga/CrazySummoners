import { Rectangle, Region, Timer, Trigger, Unit } from "w3ts";
import { AiState } from "./AiState";

export class MinionAiManager {
    
    private readonly units: Set<number> = new Set();
    private readonly states: AiState[] = [];
    private readonly aiTimer: Timer;

    constructor(
    ) {
        this.aiTimer = new Timer();
        this.aiTimer.start(1.0, true, () => this.UpdateUnits());
    }

    public Register(state: AiState) {

        const unitId = state.unit.id;
        if (this.units.has(unitId)) {
            return;
        }
        this.states.push(state);
        this.units.add(unitId);
    }

    UpdateUnits(): void {
        
        let count = this.states.length;
        for (let i = 0; i < count; i++) {

            let state = this.states[i];
            let remains = state.Update();
            if (remains == false) {

                let last = this.states.pop();
                if (i < count - 1 && last)
                    this.states[i] = last;
            }
        }
    }
}