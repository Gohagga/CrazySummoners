import { RecordEventHandler } from "systems/events/generic/RecordEventHandler";
import { GameStateEventType, IGameStateEventHandler } from "./IGameStateEventHandler";

export class GameStateEventHandler implements IGameStateEventHandler
{
    private counter: number = 1;

    private readonly handles: Record<GameStateEventType, RecordEventHandler<() => void>> = {
        [GameStateEventType.AllHeroesSelected]: new RecordEventHandler<() => void>(),
        [GameStateEventType.RoundStarted]: new RecordEventHandler<() => void>(),
        [GameStateEventType.VictoryCondition]: new RecordEventHandler<() => void>(),
        [GameStateEventType.RoundEnded]: new RecordEventHandler<() => void>(),
    }

    public Subscribe(type: GameStateEventType, callback: () => void) {
        this.handles[type].Subscribe(this.counter++, callback);
    }

    public Raise(type: GameStateEventType) {

        let subs = this.handles[type].Subscriptions;
        for (let subKey of Object.keys(subs)) {
            let result = subs[Number(subKey)]();
        }
    }
}