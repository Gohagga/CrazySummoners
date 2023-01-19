import { MapPlayer } from "w3ts";
import { Timer } from "w3ts/handles/timer";
import { Trigger } from "w3ts/handles/trigger";
import { Unit } from "w3ts/handles/unit";
import { IDummyUnitManager } from "../interfaces/IDummyUnitManager";
import { EffectProperties, IPointBlankEffect } from "../interfaces/IPointBlankEffect";
import { ICoords, ITargetEffect, TargetEffectProperties } from "../interfaces/ITargetEffect";

export class PointBlankEffect<Properties> implements IPointBlankEffect<Properties> {

    private dummy: Unit | null = null;

    constructor(
        private readonly dummyUnitManager: IDummyUnitManager,
        private readonly abilityId: number,
        private readonly orderId: number,
        private readonly setup?: (properties: Properties, abiltiy: ability, lvl: number) => void,
    ) {
    }

    Setup(properties: Properties & EffectProperties): IPointBlankEffect<Properties> {

        if (!this.dummy) {
            this.dummy = this.dummyUnitManager.GetDummy();
        }

        if (properties.origin) {
            this.dummy.x = properties.origin.x;
            this.dummy.y = properties.origin.y;
        }

        this.dummy.addAbility(this.abilityId);
        this.dummy.setAbilityLevel(this.abilityId, properties.level);

        if (properties.castingPlayer) {
            this.dummy.setOwner(properties.castingPlayer, false);
        }

        if (this.setup) this.setup(properties, this.dummy.getAbility(this.abilityId), properties.level);
        return this;
    }

    Cast(origin: ICoords, level?: number): void {

        if (!this.dummy) {
            this.dummy = this.dummyUnitManager.GetDummy();
            this.dummy.addAbility(this.abilityId);
            if (level) this.dummy.setAbilityLevel(this.abilityId, level);
        } else if (level) {
            this.dummy.setAbilityLevel(this.abilityId, level);
        }

        if (origin) {
            this.dummy.setPosition(origin.x, origin.y);
        }

        this.dummy.issueImmediateOrder(this.orderId);
    }
}