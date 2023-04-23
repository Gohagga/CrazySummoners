import { State, UpdateResult } from "systems/player-ai/State";

export interface ICastSpellContext {
    spellName: string;
    position: number;
}

export interface ICastSpellController {
    castSpell(spellName: string, position: number): void;
}

export class CastSpellState extends State<ICastSpellContext, ICastSpellController> {
    constructor(context: ICastSpellContext, controller: ICastSpellController) {
        super(CastSpellState.name, context, controller);
    }

    update(): UpdateResult {
        const { spellName, position } = this.context;
        this.controller.castSpell(spellName, position);
        return UpdateResult.ContinueProcessing;
    }
}