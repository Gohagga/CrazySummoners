import { Log } from "systems/log/Log";
import { State, UpdateResult } from "systems/player-ai/State";

export interface ICastSpellContext {
    targetLane: number;
    isCastSpellDone: boolean;
}

export interface ICastSpellController {
    issueCastSpellCommand(action: string, lane: number): number;
    getCommandStatus(id: number): 'notStarted' | 'started' | 'done';
    prepareAction(action: string): void;
    unprepareAction(action: string): void;
}

export class CastSpellState extends State<ICastSpellContext, ICastSpellController> {
    private commandId: number = 0;
    private action: string;

    constructor(context: ICastSpellContext, controller: ICastSpellController, spellAction: string, name?: string) {
        super(name || CastSpellState.name, context, controller);
        this.action = spellAction;
    }

    update(): UpdateResult {
        Log.Debug("update", this.name);
        if (this.commandId == 0) {
            this.commandId = this.controller.issueCastSpellCommand(this.action, this.context.targetLane);
        } else {
            const status = this.controller.getCommandStatus(this.commandId);

            if (status == 'notStarted') {
                this.commandId = 0;
            }

            this.context.isCastSpellDone = status == 'done';
            Log.Debug("update Setting isCastSpellDone", this.context.isCastSpellDone);
        }

        if (this.context.isCastSpellDone) return UpdateResult.RunImmediateUpdate;
        return UpdateResult.ContinueProcessing;
    }

    override onExit(): void {
        this.controller.unprepareAction(this.action);
    }

    override onEnter(): void {
        this.context.isCastSpellDone = false;
        this.commandId = 0;
        this.controller.prepareAction(this.action);
        Log.Debug("onEnter Setting isCastSpellDone", this.context.isCastSpellDone);
    }
}