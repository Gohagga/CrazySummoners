import { Log } from "systems/log/Log";
import { Transition } from "./Transition";
import { IState, State, UpdateResult } from "./State";

export abstract class ParentState<TContext, TController> extends State<TContext, TController> {
    protected childStates: IState[] = [];
    protected currentState: IState | null = null;

    constructor(name: string, context: TContext, controller: TController) {
        super(name, context, controller);
    }

    onEnter(): void {
        super.onEnter();
        if (this.currentState) this.currentState.onEnter();
    }

    onExit(): void {
        if (this.currentState) this.currentState.onExit();
        super.onExit();
    }

    update(): UpdateResult {
        if (this.currentState) {
            const childUpdateResult = this.currentState.update();

            // Check for transitions in the child state and handle them if the result is ContinueProcessing
            if (childUpdateResult == UpdateResult.ContinueProcessing) {
                const childNextState = this.currentState.getNextState();
                if (childNextState) {
                    this.currentState.onExit();
                    this.currentState = childNextState;
                    this.currentState.onEnter();
                }
            }

            // Run the update of the child state
            return childUpdateResult;
        }

        return UpdateResult.ContinueProcessing;
    }

    addChildState(state: IState): void {
        this.childStates.push(state);
    }

    removeChildState(state: IState): void {
        const index = this.childStates.indexOf(state);
        if (index !== -1) {
            this.childStates.splice(index, 1);
        }
    }

    setInitialState(state: IState): void {
        this.currentState = state;
    }
}