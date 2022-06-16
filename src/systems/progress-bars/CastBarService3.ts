import { Point, Unit, Widget } from "w3ts"
import { IAbilityEvent } from "../ability-events/event-models/IAbilityEvent";
import { InterruptableService } from "../interruptable/InterruptableService";
import { CastBar } from "./CastBar"
import { ICastBarService } from "./ICastBarService";

export interface CastBarServiceConfig {
    model: string,
    updatePeriod: number,
    size: number,
    defaultHeight: number,
    queueTreshold: number;
}

export class CastBarService3 implements ICastBarService {
    
    private readonly castBars: Record<number, CastBar> = {};

    private readonly sfxModelPath: string;
    private readonly updatePeriod: number;
    private readonly castBarSize: number;
    private readonly defaultHeight: number;
    private readonly queueTreshold: number;

    constructor(
        config: CastBarServiceConfig,
        private readonly interruptableService: InterruptableService,
        // private readonly orderQueueService: OrderQueueService,
    ) {
        this.sfxModelPath = config.model;
        this.updatePeriod = config.updatePeriod;
        this.castBarSize = config.size;
        this.defaultHeight = config.defaultHeight;
        this.queueTreshold = config.queueTreshold;
    }

    GetCurrentlyCastingSpell(caster: Unit): number {
        const casterId = caster.id;
        // print("exists?", casterId in this.castBars);
        if (casterId in this.castBars && this.castBars[casterId]) {
            // print("exists", this.castBars[casterId].spellId);
            if (!this.castBars[casterId].alive) return -1;

            return this.castBars[casterId].spellId;
        }
        return -1;
    }

    // TryToQueue(caster: Unit, orderId: number, type: 'target' | 'point' | 'immediate', targetWidget?: Widget, targetPoint?: Point): boolean {
    //     let casterId = caster.id;

    //     if (casterId in this.castBars && this.castBars[casterId]) {
    //         // print("cast bar exists")
    //         let castBar = this.castBars[casterId];
    //         // print("alive?", castBar.alive);
    //         if (!castBar.isDone && castBar.RemainingTime() < this.queueTreshold && castBar) {
    //             castBar.alive = true;
    //             // print("Queueing spell...")
    //             let order: QueuedOrder = {
    //                 id: orderId,
    //                 type,
    //                 targetPoint,
    //                 targetWidget
    //             };
    //             this.orderQueueService.QueueOrder(caster, order, true);
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    // TryToQueueAbility(caster: Unit, orderId: number, e: IAbilityEvent, abilityEffect: (e: IAbilityEvent) => void): boolean {
    //     try {
    //         let casterId = caster.id;
    
    //         let eData = {
    //             abilityId: e.abilityId,
    //             caster,
    //             targetUnit: e.targetUnit,
    //             targetPoint: e.targetPoint,
    //             summonedUnit: e.summonedUnit,
    //             targetDestructable: e.targetDestructable
    //         };
    //         if (casterId in this.castBars && this.castBars[casterId]) {
    //             let castBar = this.castBars[casterId];
    //             // print("alive?", castBar.alive);
    //             if (castBar.alive && castBar.RemainingTime() < this.queueTreshold) {
    //                 // print("Queueing spell...")
    //                 let order: QueuedOrder = {
    //                     id: orderId,
    //                     type: 'effect',
    //                     effect: () => abilityEffect(eData),
    //                 };
    //                 this.orderQueueService.QueueOrder(caster, order, true);
    //                 return true;
    //             }
    //         }
    //     } catch (ex: any) {
    //         Log.Error(ex);
    //     }

    //     return false;
    // }

    CreateCastBar(unit: Unit, spellId: number, castTime: number, afterFinish: (bar: CastBar) => void) {
        let castBar = new CastBar(unit, this.sfxModelPath, this.updatePeriod, this.castBarSize, spellId, this.defaultHeight);
        let unitId = unit.id;
        this.castBars[unitId] = castBar;
        castBar.CastSpell(spellId, castTime, bar => {
            bar.Finish();
            // if (this.castBars[unitId] == castBar) delete this.castBars[unitId];
            afterFinish(bar);
            // if (this.orderQueueService.ResolveQueuedOrder(unit)) {
            //     return;
            // }
        });

        return castBar;
    }

    public OnInterrupt(castBar: CastBar, caster: Unit, action: (castBar: CastBar, orderId: number) => 'finishCastBar' | 'destroyCastBar' | 'ignore') {
        this.interruptableService.Register(caster.handle, (orderId) => {

            let result = action(castBar, orderId);
            switch (result) {
                case "ignore":
                    return true;
                case "finishCastBar":
                    castBar.Finish();
                    return false;
                case "destroyCastBar":
                    castBar.alive = false;
                    return false;
            }
        });
    }
}
