import { State, UpdateResult } from "./State";

export class IdleState<TContext> extends State<TContext, any> {

    constructor(context: TContext, controller: any) {
        super(IdleState.name, context, controller);
    }

    onEnter(): void {
        
    }
    onExit(): void {
        
    }
    update(): UpdateResult {
        return UpdateResult.ContinueProcessing;
    }
}