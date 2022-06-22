import { Unit } from "w3ts";
import { DelayedTargetEffect } from "./dummy-effects/DelayedTargetEffect";
import { PointEffect } from "./dummy-effects/PointEffect";
import { TargetEffect } from "./dummy-effects/TargetEffect";
import { IDelayedTargetEffect as IDelayedTargetEffect } from "./interfaces/IDelayedTargetEffect";
import { IDummyAbilityFactory, TargetType } from "./interfaces/IDummyAbilityFactory";
import { IDummyUnitManager } from "./interfaces/IDummyUnitManager";
import { IPointEffect } from "./interfaces/IPointEffect";
import { ITargetEffect, TargetEffectProperties } from "./interfaces/ITargetEffect";

export class DummyAbilityFactory implements IDummyAbilityFactory {

    constructor(
        private readonly dummyUnitManager: IDummyUnitManager
    ) {

    }

    CreateTargetEffect<Properties>(dummyAbilityId: number, orderId: number, setup?: (properties: Properties, ability: ability, lvl: number) => void): ITargetEffect<Properties> {
        
        let effect = new TargetEffect(this.dummyUnitManager, dummyAbilityId, orderId, setup);
        return effect;
    }

    CreatePointEffect<Properties>(dummyAbilityId: number, orderId: number, setup?: (properties: Properties, ability: ability, lvl: number) => void): IPointEffect<Properties> {
        
        let effect = new PointEffect(this.dummyUnitManager, dummyAbilityId, orderId, setup);
        return effect;
    }

    CreateDelayedTargetEffect<ContextType>(dummyAbilityId: number, orderId: number, duration?: number): IDelayedTargetEffect<ContextType> {
        
        let effect = new DelayedTargetEffect<ContextType>(this.dummyUnitManager, dummyAbilityId, orderId, duration);
        return effect;
    }

    CreateDelayedPointEffect(dummySpellId: number, order: number, timeout?: number): number {
        throw new Error("Method not implemented.");
    }

    CreateDelayedInstantEffect(dummySpellId: number, order: number, timeout?: number): number {
        throw new Error("Method not implemented.");
    }
}

