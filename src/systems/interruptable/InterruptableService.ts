import { Log } from "systems/log/Log";
import { OrderId } from "w3ts/globals/order";

export type InterruptableCondition = (orderId: number) => boolean

export class InterruptableService {
    
    private instance: Record<number, InterruptableCondition[]> = {}

    private lock: boolean = false;

    constructor() {
        const t = CreateTrigger();
        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_ISSUED_ORDER);
        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER);
        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER);
        TriggerAddAction(t, () => {

            if (this.lock) return;

            let order = GetIssuedOrderId();
            if (order != OrderId.Move
                && order != OrderId.Stop
                && order != OrderId.Smart
                && order != OrderId.Holdposition)
                return;

            const unit = GetTriggerUnit();
            const unitId = GetHandleId(unit);
            if (!(unitId !in this.instance)) return;
            const instance = this.instance[unitId] || [];
            let remaining: InterruptableCondition[] = [];

            if (instance.length > 0) {
                // I think this is learning abilities order ids
                if ((order+'').substr(0, 6) == "109367") return;
            }

            for (let i = 0; i < instance.length; i++) {

                this.lock = true;
                if (instance[i](GetIssuedOrderId())) {
                    remaining.push(instance[i]);
                }
                this.lock = false;
            }
            this.instance[unitId] = remaining;
        })
    }

    public WithinLock(action: () => void) {
        this.lock = true;
        action();
        this.lock = false;
    }

    public Fire(unit: unit, order: number) {
        if (this.lock) return;

        const unitId = GetHandleId(unit);
        if (unitId in this.instance == false) return;
        
        try {
            const instance = this.instance[unitId] || [];
            let remaining: InterruptableCondition[] = [];

            for (let i = 0; i < instance.length; i++) {

                this.lock = true;
                if (instance[i](order)) {
                    remaining.push(instance[i]);
                }
                this.lock = false;
            }
            this.instance[unitId] = remaining;
        } catch (ex: any) {
            Log.Error(ex);
        }
    }

    public Register(unit: unit, condition: InterruptableCondition) {
        
        const unitId = GetHandleId(unit);
        if (!(unitId in this.instance)) {
            this.instance[unitId] = [];
        }
        this.instance[unitId].push(condition);
    }
}