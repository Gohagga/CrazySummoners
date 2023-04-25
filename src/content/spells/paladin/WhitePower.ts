import { OrbType } from "content/constants/OrbType";
import { AbilityBase } from "systems/abilities/AbilityBase";
import { OrbAbility, OrbAbilityData } from "systems/abilities/OrbAbility";
import { Wc3AbilityData } from "systems/abilities/Wc3AbilityData";
import { IAbilityEvent } from "systems/ability-events/event-models/IAbilityEvent";
import { IAbilityEventHandler } from "systems/ability-events/IAbilityEventHandler";
import { Log } from "systems/log/Log";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { UnitConfigurable } from "systems/unit-configurable/UnitConfigurable";
import { Item, Timer, Unit } from "w3ts";

type WhitePowerUnitData = {
    level: Record<number, {
        maxCharges: number,
        refreshTime: number,
        startingCharges: number,
        cooldown: number,
    }>;
}

export interface WhitePowerAbilityData extends OrbAbilityData {
    // castSfx: string,
    whitePowerStackItemCodeId: string,
}

export class WhitePower extends OrbAbility {

    private unitConfigurable = new UnitConfigurable<WhitePowerUnitData>(() => ({
        level: {
            1: {
                maxCharges: 25,
                refreshTime: 1.2,
                startingCharges: 1,
                cooldown: 10,
            },
            2: {
                maxCharges: 40,
                refreshTime: 0.9,
                startingCharges: 1,
                cooldown: 7,
            },
            3: {
                maxCharges: 50,
                refreshTime: 0.5,
                startingCharges: 1,
                cooldown: 4,
            },
            4: {
                maxCharges: 50,
                refreshTime: 0.5,
                startingCharges: 1,
                cooldown: 4,
            }
        }
    }));
    
    private readonly whitePowerStackItemId: number;

    private readonly instances: Record<number, Timer> = {};

    constructor(
        data: WhitePowerAbilityData,
        abilityEventHandler: IAbilityEventHandler,
        private readonly resourceBarManager: ResourceBarManager,
    ) {
        super(data);
        this.whitePowerStackItemId = FourCC(data.whitePowerStackItemCodeId);
        
        abilityEventHandler.OnAbilityCast(this.id, e => this.Execute(e));
    }

    public StartChargeUp(caster: Unit, level: number, item: Item) {

        const data = this.unitConfigurable.GetUnitConfig(caster).level[level];
        let { maxCharges, refreshTime, startingCharges } = data;

        let id = item.id;
        let tim = this.instances[id] ||= new Timer();
        tim.pause();

        item.charges = startingCharges || 5;

        tim.start(refreshTime, true, () => {

            let charges = item.charges;
            if (charges < maxCharges) {
                item.charges += 1;
            } else {
                tim.pause();
            }
        });
    }

    public CreateStacksItem(unit: Unit): Item {
        return unit.addItemById(this.whitePowerStackItemId);
    }

    Execute(e: IAbilityEvent): boolean {
        
        const caster = e.caster;
        const lvl = caster.getAbilityLevel(this.id);

        const owner = caster.owner;
        const ownerId = owner.id;
        const itemIndex = GetInventoryIndexOfItemTypeBJ(caster.handle, this.whitePowerStackItemId);

        let seconds = 0;
        if (itemIndex > 0) {
            let item = caster.getItemInSlot(itemIndex - 1);
            seconds = item.charges;
            this.StartChargeUp(caster, lvl, item);
        }


        // Reset that many seconds
        let bar = this.resourceBarManager.Get(ownerId);
        let orbs = bar.orbs;
        for (let i = orbs.length - 1; i >= 0; i--) {
            let o = orbs[i];
            if (o.orbTypeId == OrbType.White && o.isAvailable == false) {
                if (seconds >= o.cooldownRemaining) {
                    seconds -= o.cooldownRemaining;
                    o.cooldownRemaining = 0;
                } else if (seconds > 0) {
                    o.cooldownRemaining -= seconds;
                    seconds = -1;
                } else {
                    break;
                }
            }
        }

        return true;
    }
    
    public GetUnitConfig = (unit: Unit, lvl?: number) => this.unitConfigurable.GetUnitConfig(unit).level[lvl || unit.getAbilityLevel(this.id)];
    UpdateUnitSkill(unit: Unit): void {

        let data = this.GetUnitConfig(unit);
        let lvl = unit.getAbilityLevel(this.id);
        let name = this.name + ' - ' + lvl;

        let tooltip =
`WhitePoweres

#acc:Cooldown: ${data.cooldown} sec:#`
        this.UpdateUnitAbilityBase(unit, tooltip, undefined, undefined, name);
        this.SetCooldown(unit, lvl, data.cooldown);
    }
}