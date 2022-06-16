import { Point, Unit, Widget } from "w3ts";
import { OrderId } from "w3ts/globals/order";
import { IAbilityEvent } from "../ability-events/event-models/IAbilityEvent";
import { InterruptableService } from "../interruptable/InterruptableService";
import { CastBar } from "./CastBar";

export interface SpellcastingServiceConfig {
    model: string,
    updatePeriod: number,
    size: number,
    defaultHeight: number,
    queueTreshold: number;
}

export class SpellcastingService {

    private readonly castBars: Record<number, CastBar> = {};

    private readonly sfxModelPath: string;
    private readonly updatePeriod: number;
    private readonly castBarSize: number;
    private readonly defaultHeight: number;
    private readonly queueTreshold: number;

    constructor(
        config: SpellcastingServiceConfig,
        private readonly interruptableService: InterruptableService,
        // private readonly orderQueueService: OrderQueueService,
    ) {
        this.sfxModelPath = config.model;
        this.updatePeriod = config.updatePeriod;
        this.castBarSize = config.size;
        this.defaultHeight = config.defaultHeight;
        this.queueTreshold = config.queueTreshold;
    }

    // TryQueueOrder(caster: Unit, orderId: number, type: 'target' | 'point' | 'immediate', targetWidget?: Widget, targetPoint?: Point): boolean {

    //     let castBar = this.castBars[caster.id];
    //     if (castBar && !castBar.isDone && castBar.RemainingTime() < this.queueTreshold) {
    //         castBar.alive = true;
    //         let order: QueuedOrder = {
    //             id: orderId,
    //             type,
    //             targetPoint,
    //             targetWidget
    //         };
    //         this.orderQueueService.QueueOrder(caster, order, true);
    //         return true;
    //     }

    //     return false;
    // }

    // TryToQueueAbility(caster: Unit, orderId: number, e: IAbilityEvent, abilityEffect: (e: IAbilityEvent) => void): boolean {
        
    //     let casterId = caster.id;
    //     let castBar = this.castBars[casterId];
    //     if (castBar && !castBar.isDone && castBar.RemainingTime() < this.queueTreshold) {
    //         castBar.alive = true;

    //         let eData = {
    //             abilityId: e.abilityId,
    //             caster,
    //             targetUnit: e.targetUnit,
    //             targetPoint: e.targetPoint,
    //             summonedUnit: e.summonedUnit,
    //             targetDestructable: e.targetDestructable
    //         };
    //         let order: QueuedOrder = {
    //             id: orderId,
    //             type: 'effect',
    //             effect: () => abilityEffect(eData),
    //         };
    //         this.orderQueueService.QueueOrder(caster, order, true);
    //         return true;
    //     }

    //     return false;
    // }

    // HasQueuedAbility(caster: Unit): boolean {
    //     return this.orderQueueService.GetQueueSize(caster) > 0;
    // }

    CastSpell(unit: Unit, spellId: number, castTime: number, afterFinish: (bar: CastBar) => void, onInterupt?: (orderId: number, castBar: CastBar) => boolean) {
        let castBar = new CastBar(unit, this.sfxModelPath, this.updatePeriod, this.castBarSize, spellId, this.defaultHeight);
        let unitId = unit.id;
        this.castBars[unitId] = castBar;
        castBar.CastSpell(spellId, castTime, bar => {
            bar.Finish();
            afterFinish(bar);
            // if (this.orderQueueService.ResolveQueuedOrder(unit)) {
            //     return;
            // }
        });

        if (onInterupt) this.interruptableService.Register(unit.handle, (orderId: number) => {
            return onInterupt(orderId, castBar);
        });
        else {
            this.interruptableService.Register(unit.handle, (orderId: number) => {
    
                // if (orderId == OrderId.Move
                //     || orderId == OrderId.Smart
                //     || orderId == OrderId.Attack
                //     || orderId == OrderId.Stop
                //     || orderId == OrderId.Holdposition)
                //     return false;

                castBar.alive = false;

                if (castBar.isDone)
                    return false;
                
                return true;
            });
        }

        return castBar;
    }
}