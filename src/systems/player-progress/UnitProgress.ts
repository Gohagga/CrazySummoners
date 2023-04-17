import { GameStateEventType, IGameStateEventHandler } from "systems/game-state/IGameStateEventHandler";
import { Trigger, Unit } from "w3ts/handles/index";

export abstract class UnitProgress {
        
    protected levelUpTrigger: Trigger;
    
    protected abstract unit: Unit;
    protected thread: LuaThread;

    // Flags
    protected gameStarted: boolean = false;

    constructor(
        unit: Unit,
        gameStateEvent: IGameStateEventHandler
    ) {
        this.levelUpTrigger = new Trigger();
        this.levelUpTrigger.registerUnitEvent(unit, EVENT_UNIT_HERO_LEVEL);
        this.levelUpTrigger.addAction(() => {
            coroutine.resume(this.thread);
        });
        gameStateEvent.Subscribe(GameStateEventType.RoundStarted, () => {
            this.gameStarted = true;
            coroutine.resume(this.thread);
        });
        this.thread = coroutine.create(() => this.Progress());
    }

    public Start() {
        coroutine.resume(this.thread);
    }

    public WaitForGameStart() {
        while (this.gameStarted == false) {
            coroutine.yield();
        }
    }

    public WaitForUnitLevel(level: number) {
        while (this.unit.level < level) {
            coroutine.yield();
        }
    }

    protected abstract Progress(): void;
}