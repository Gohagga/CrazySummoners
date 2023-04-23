import { IState } from "./State";
import { Transition } from "./Transition";

export interface IStateTransitionToStage<TContextFrom> {
    to(targetState: IState): IStateTransitionWhenStage<TContextFrom>;
}

export interface IStateTransitionWithContextStage<TContextFrom> extends IStateTransitionToStage<TContextFrom> {
    with<TContext>(): IStateTransitionToStage<TContext>;
}

export interface IStateTransitionWhenStage<TContextFrom> {
    when(condition: (context: TContextFrom) => boolean): IStateTransitionToStage<TContextFrom>;
}

export class StateTransitionBuilder<TContextFrom>
    implements
    IStateTransitionToStage<TContextFrom>,
    IStateTransitionWithContextStage<TContextFrom>,
    IStateTransitionWhenStage<TContextFrom>
{

    private sourceState: IState;
    private targetState: IState | null;

    constructor(sourceState: IState, targetState: IState | null = null) {
        this.sourceState = sourceState;
        this.targetState = targetState;
    }

    static from(state: IState): IStateTransitionWithContextStage<number> {
        return new StateTransitionBuilder<number>(state);
    }

    with<TContext>(): IStateTransitionToStage<TContext> {
        return new StateTransitionBuilder<TContext>(this.sourceState);
    }

    to(targetState: IState): IStateTransitionWhenStage<TContextFrom> {
        return new StateTransitionBuilder<TContextFrom>(this.sourceState, targetState);
    }

    when(condition: (context: TContextFrom) => boolean): IStateTransitionToStage<TContextFrom> {
        if (this.targetState === null) {
            throw new Error('Target state must be set before adding the condition');
        }
        this.sourceState.transitions.push(new Transition(condition, this.targetState));
        return this;
    }
}

