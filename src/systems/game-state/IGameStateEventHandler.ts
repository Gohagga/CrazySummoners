
export const enum GameStateEventType {
    AllHeroesSelected,
    RoundStarted,
    VictoryCondition,
    RoundEnded,
}

export interface IGameStateEventHandler {
    Subscribe(type: GameStateEventType, callback: () => void): void;

    Raise(type: GameStateEventType): void;
}