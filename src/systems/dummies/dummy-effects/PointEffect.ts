import { Timer } from "w3ts/handles/timer";
import { Trigger } from "w3ts/handles/trigger";
import { Unit } from "w3ts/handles/unit";
import { IDummyUnitManager } from "../interfaces/IDummyUnitManager";
import { EffectProperties, IPointEffect } from "../interfaces/IPointEffect";
import { ICoords, ITargetEffect, TargetEffectProperties } from "../interfaces/ITargetEffect";

export class PointEffect<Properties> implements IPointEffect<Properties> {

    private dummy: Unit | null = null;

    constructor(
        private readonly dummyUnitManager: IDummyUnitManager,
        private readonly abilityId: number,
        private readonly orderId: number,
        private readonly setup?: (properties: Properties, abiltiy: ability, lvl: number) => void,
    ) {
    }

    Setup(properties: Properties & EffectProperties): IPointEffect<Properties> {

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

    Cast(targetPoint: ICoords, level: number, origin?: ICoords): void {

        if (!this.dummy) {
            this.dummy = this.dummyUnitManager.GetDummy();
            this.dummy.addAbility(this.abilityId);
            this.dummy.setAbilityLevel(this.abilityId, level);
        } else if (level) {
            this.dummy.setAbilityLevel(this.abilityId, level);
        }

        if (origin) {
            this.dummy.x = origin.x;
            this.dummy.y = origin.y;
        }

        this.dummy.issueOrderAt(this.orderId, targetPoint.x, targetPoint.y);
    }
}