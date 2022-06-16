import { Unit } from "w3ts";

export class ProgressBar {
    protected done: boolean = true;
    protected unit: Unit;
    protected curValue: number = 0;
    protected endValue: number = 0;
    protected speed: number = 0;
    protected reverse: boolean = false;
    protected timer = CreateTimer();
    protected timer2 = CreateTimer();
    protected sfx: effect;

    constructor(
        unit: Unit,
        model: string,
        updatePeriod: number,
        size: number,
        protected readonly z: number = 250,
        protected onDone: () => void = () => null
    ) {
        this.unit = unit;
        this.sfx = AddSpecialEffect(model, unit.x, unit.y);

        BlzSetSpecialEffectScale(this.sfx, size);
        BlzSetSpecialEffectTime(this.sfx, 1.0);
        BlzSetSpecialEffectTimeScale(this.sfx, 0.0);
        TimerStart(this.timer, updatePeriod, true, () => this.UpdatePosition());
        this.UpdatePosition();
    }

    private UpdatePosition() {
        BlzSetSpecialEffectPosition(this.sfx, this.unit.x, this.unit.y, this.z);
    }

    public SetPercentage(percent: number, speed: number) {
        this.endValue = percent;
        this.speed = speed;

        this.reverse = this.curValue > this.endValue;

        if (speed && this.done) {
            TimerStart(this.timer2, 0.01, true, () => this.UpdatePercentage());
        } else {
            BlzSetSpecialEffectTime(this.sfx, percent);
        }
    }

    public UpdatePercentage() {
        const tim = GetExpiredTimer();

        if (this.reverse) {

            if (this.curValue * 0.98 > this.endValue) {
                BlzSetSpecialEffectTimeScale(this.sfx, -this.speed);
                this.curValue = (this.curValue - (this.speed));
            } else if (this.curValue * 0.98 < this.endValue) {
                PauseTimer(tim);
                BlzSetSpecialEffectTimeScale(this.sfx, 0);
                this.curValue = this.endValue;
                this.done = true;

                this.onDone();
            }
        } else {
            if (this.curValue < this.endValue * 0.98) {
                BlzSetSpecialEffectTimeScale(this.sfx, this.speed)
                this.curValue = (this.curValue + (this.speed))
            } else if (this.curValue >= this.endValue * 0.98) {
                PauseTimer(tim);
                BlzSetSpecialEffectTimeScale(this.sfx, 0);
                this.curValue = this.endValue;
                this.done = true;

                this.onDone();
            }
        }
    }

    public Finish() {
        BlzSetSpecialEffectTimeScale(this.sfx, 3.0);
        DestroyEffect(this.sfx);
        PauseTimer(this.timer2);
        DestroyTimer(this.timer2);
    }

    public Destroy() {
        BlzSetSpecialEffectAlpha(this.sfx, 0);
        DestroyEffect(this.sfx);
        PauseTimer(this.timer2);
        DestroyTimer(this.timer2);
    }
}