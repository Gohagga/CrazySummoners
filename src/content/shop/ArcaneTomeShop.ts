import { OrbType } from "content/constants/OrbType";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { Item, Trigger, Unit } from "w3ts";

export interface ArcaneTomeShopConfig {
    soldItemCodeGainedOrbType: Record<string, OrbType>;
}

export class ArcaneTomeShop {

    private soldItemTypeGainedOrbType: Record<number, OrbType> = {};

    constructor(
        config: ArcaneTomeShopConfig,
        private readonly resourceBarManager: ResourceBarManager
    ) {
        for (let k of Object.keys(config.soldItemCodeGainedOrbType)) {
            this.soldItemTypeGainedOrbType[FourCC(k)] = config.soldItemCodeGainedOrbType[k];
        }

        let t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM);
        t.addAction(() => {
            let buyer = Unit.fromEvent();
            let owner = buyer.owner;
            let bar = this.resourceBarManager.Get(owner.id);
            let soldItem = Item.fromEvent();

            let type = this.soldItemTypeGainedOrbType[soldItem.typeId];

            let currentLumber = owner.getState(PLAYER_STATE_RESOURCE_LUMBER);

            let orb = bar.AddOrb(type);
            if (!orb) {
                if (type == OrbType.Summoning) owner.setState(PLAYER_STATE_RESOURCE_LUMBER, currentLumber + 2);
                else owner.setState(PLAYER_STATE_RESOURCE_LUMBER, currentLumber + 1);
            }
        });
    }
}