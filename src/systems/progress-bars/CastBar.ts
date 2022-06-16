import { Unit } from "w3ts";
import { ProgressBar } from "./ProgressBar";

export class CastBar extends ProgressBar {
    private static instance: Record<number, number> = {};

    public alive = true;
    private _isDone = false;

    constructor(
        unit: Unit,
        model: string,
        updatePeriod: number,
        size: number,
        public readonly spellId: number = -1,
        protected readonly z: number = 250,
        protected onDone: () => void = () => null,
    ) {
        super(unit, model, updatePeriod, size, z, onDone);
    }

    public CastSpell(spellId: number, castTime: number, callback?: (bar: CastBar) => void): CastBar {
        this.endValue = 100;
        this.speed = (1 / castTime);
        if (callback) this.onDone = () => callback(this);

        BlzSetSpecialEffectTime(this.sfx, 0);

        if (this.done) {
            this._isDone = false;
            TimerStart(this.timer2, 0.01, true, () => 
            {
                if (!this.alive) {
                    this.Destroy();
                }
                this.UpdatePercentage();
            });

            if (spellId) CastBar.instance[this.unit.id] = spellId;

            if (castTime < 0.15) DestroyEffect(this.sfx);
        }

        return this;
    }

    public static GetUnitCurrentSpellId(unit: unit): number {
        const unitId = GetHandleId(unit);
        if (unitId in CastBar.instance) {
            return CastBar.instance[unitId];
        }
        return -1;
    }

    public Finish() {
        this.alive = false;
        BlzSetSpecialEffectTimeScale(this.sfx, 3.0);
        DestroyEffect(this.sfx);
        PauseTimer(this.timer2);
        DestroyTimer(this.timer2);

        this._isDone = true;
        if (this.unit.id in CastBar.instance) delete CastBar.instance[this.unit.id];
    }

    public Destroy() {
        this.alive = false;
        BlzSetSpecialEffectAlpha(this.sfx, 0);
        DestroyEffect(this.sfx);
        PauseTimer(this.timer2);
        DestroyTimer(this.timer2);

        this._isDone = true;
        if (this.unit.id in CastBar.instance) delete CastBar.instance[this.unit.id];
    }

    public RemainingTime(): number {
        return 0.01 * math.abs(this.endValue - this.curValue);
    }

    public get isDone() {
        return this._isDone;
    }
}