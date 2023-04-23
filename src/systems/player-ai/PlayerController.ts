import { Log } from "systems/log/Log";
import { IdleState } from "./IdleState";
import { IState, UpdateResult } from "./State";
import { IStateTransitionToStage, StateTransitionBuilder } from "./StateTransitionBuilder";

export class PlayerController {
    protected currentState: IState;
    // Maximum number of consecutive immediate updates
    private readonly maxConsecutiveUpdates = 5;

    constructor() {
        this.currentState = new IdleState<PlayerController>(this, this);
    }

    update(): void {
        let consecutiveUpdates = 0;

        while (true) {
            const updateResult = this.currentState.update();

            if (updateResult == UpdateResult.SkipTransitions) {
                break;
            }

            // Check for transitions in the child state and handle them if the result is ContinueProcessing
            const nextState = this.currentState.getNextState();
            if (nextState) {
                this.currentState.onExit();
                this.currentState = nextState;
                this.currentState.onEnter();
            }
            
            if (updateResult == UpdateResult.RunImmediateUpdate) {
                consecutiveUpdates++;

                // If the maximum number of consecutive updates is reached, break
                if (consecutiveUpdates >= this.maxConsecutiveUpdates) {
                    Log.Error("Max consecutive updates reached, breaking the loop to avoid infinite loop.");
                    break;
                }
            }

            // Break the loop after processing the update or handling transitions
            break;
        }
    }

    changeState(newState: IState): void {
        Log.Debug("changeState", newState.name);

        this.currentState.onExit();
        this.currentState = newState;
        this.currentState.onEnter();
    }

    protected transitionFrom<TContext>(state: IState): IStateTransitionToStage<TContext> {
        return StateTransitionBuilder.from(state).with<TContext>();
    }
}