import { Trigger, Unit } from "w3ts/handles/index";

export abstract class UnitProgress {
        
    protected levelUpTrigger: Trigger;
    
    protected abstract unit: Unit;
    protected thread: LuaThread;

    constructor(
        unit: Unit
    ) {
        this.levelUpTrigger = new Trigger();
        this.levelUpTrigger.registerUnitEvent(unit, EVENT_UNIT_HERO_LEVEL);
        this.levelUpTrigger.addAction(() => {
            coroutine.resume(this.thread);
        });
        this.thread = coroutine.create(() => this.Progress());
    }

    public Start() {
        coroutine.resume(this.thread);
    }

    public WaitForUnitLevel(level: number) {
        while (this.unit.level < level) {
            coroutine.yield();
        }
    }

    protected abstract Progress(): void;
}