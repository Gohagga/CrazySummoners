import { Timer } from "w3ts";

export class Delay {

    private func: () => void;
    private next?: Delay;
    private delay: number;
    private timer: Timer;

    constructor(delay: number, func: () => void, timer?: Timer) {
        this.delay = delay;
        this.func = () => func();
        this.timer = timer || new Timer();
    }
    
    public Run(): Delay {
        this.timer.start(this.delay, false, () => {

            this.func();
            if (this.next) {
                this.next.Run();
            } else if (this.timer) {
                this.timer.destroy();
            }
        });
        return this;
    }

    public Then(delay: number, func: () => void): Delay {
        this.next = new Delay(delay, func, this.timer);
        return this.next;
    }

    static Call(after: number, func: () => void) {
        return new Delay(after, func).Run();
    }
}