import { Log } from "systems/log/Log";
import { Transition } from "./Transition";

export const enum UpdateResult {
    /**Continue processing the update cycle in the current state and check transitions*/
    ContinueProcessing = 'ContinueProcessing',
    /**Stop processing the update cycle in the current state and do not check transitions*/
    SkipTransitions = 'SkipTransitions',
    /**Execute the update logic immediately after returning without waiting for the next scheduled interval*/
    RunImmediateUpdate = 'RunImmediateUpdate',
}

export interface IState {
    name: string;
    transitions: Transition[];
    update(): UpdateResult;
    getNextState(): IState | null;
    onEnter(): void;
    onExit(): void;
}

export abstract class State<TContext, TController> implements IState {
    protected context: TContext;
    protected controller: TController;
    public name: string;
    public transitions: Transition[] = [];

    constructor(name: string, context: TContext, controller: TController) {
        this.name = name;
        this.context = context;
        this.controller = controller;
    }

    public addTransition(transition: Transition): void {
        this.transitions.push(transition);
    }

    onEnter(): void { }

    onExit(): void { }

    abstract update(): UpdateResult;

    public getNextState(): IState | null {

        for (const transition of this.transitions) {
            if (transition.condition(this.context)) {
                Log.Debug("getNextState Transition true", transition.targetState.name);
                return transition.targetState;
            }
        }

        return null;
    }
}