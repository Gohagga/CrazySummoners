import { Rectangle, Region, Timer, Trigger, Unit } from "w3ts";
import { AiState } from "./AiState";

export class MinionAiManager {
    
    private readonly units: Set<number> = new Set();
    private readonly states: AiState[] = [];
    private readonly unitIdState: Record<number, AiState> = {};
    private readonly aiTimer: Timer;

    constructor(
    ) {
        this.aiTimer = new Timer();
        this.aiTimer.start(1.0, true, () => this.UpdateUnits());
    }

    public Get(unitId: number) {
        if (false == unitId in this.unitIdState) throw "Could not find unitId in unitIdState";
        return this.unitIdState[unitId];
    }

    public Register(state: AiState) {

        const unitId = state.unit.id;
        if (this.units.has(unitId)) {
            return;
        }
        this.states.push(state);
        this.units.add(unitId);
        this.unitIdState[unitId] = state;
    }

    public Unregister(unitId: number) {

        this.units.delete(unitId);
        delete this.unitIdState[unitId];
    }

    UpdateUnits(): void {
        
        let count = this.states.length;
        for (let i = 0; i < count; i++) {

            let remains = true;
            let state = this.states[i];
            let unitId = state.unit.id;

            if (this.units.has(unitId) == false) {
                remains = false;
            } else {
                remains = state.Update(state);
            }

            if (remains == false) {

                delete this.unitIdState[state.unit.id];
                let last = this.states.pop();
                if (i < count - 1 && last)
                    this.states[i] = last;
            }
        }
    }
}