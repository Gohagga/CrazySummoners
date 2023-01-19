import { IDelayedTargetEffect } from "./IDelayedTargetEffect";
import { IPointBlankEffect } from "./IPointBlankEffect";
import { IPointEffect } from "./IPointEffect";
import { ITargetEffect, TargetEffectProperties } from "./ITargetEffect";

export const enum TargetType {
    Unit,
    Point,
    Instant,
}

export interface IDummyAbilityFactory {

    CreateTargetEffect<Properties>(dummyAbilityId: number, orderId: number, setup?: (properties: Properties, ability: ability, lvl: number) => void): ITargetEffect<Properties>;

    CreatePointEffect<Properties>(dummyAbilityId: number, orderId: number, setup?: (properties: Properties, ability: ability, lvl: number) => void): IPointEffect<Properties>;

    CreatePointBlankEffect<Properties>(dummyAbilityId: number, orderId: number, setup?: (properties: Properties, ability: ability, lvl: number) => void):  IPointBlankEffect<Properties>;

    /**
     * If duration is null, custom effect only resolves once. Otherwise it resolves for every unit it hits until 'duration' seconds pass.
     * @param duration Amount of seconds after which the projectile will be cleaned up.
     */
    CreateDelayedTargetEffect<ContextType>(dummyAbilityId: number, orderId: number, duration?: number): IDelayedTargetEffect<ContextType>;

    // CreateDelayedPointEffect(dummySpellId: number, order: number, timeout?: number): number;

    // CreateDelayedPointEffect(dummySpellId: number, order: number, timeout?: number): number;

    // CreateDelayedInstantEffect(dummySpellId: number, order: number, timeout?: number): number;
}

