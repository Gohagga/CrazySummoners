import { Log } from "systems/log/Log";
import { Transition } from "./Transition";
import { IState, State, UpdateResult } from "./State";

export abstract class ParentState<TContext, TController> extends State<TContext, TController> {
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
            if (childUpdateResult == UpdateResult.ContinueProcessing
                || childUpdateResult == UpdateResult.RunImmediateUpdate) {
                const childNextState = this.currentState.getNextState();
                print("CHEXC NEX STATE", childNextState, childNextState && childNextState.name);
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

    setInitialState(state: IState): void {
        this.currentState = state;
    }
}