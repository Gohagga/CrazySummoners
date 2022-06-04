import { Coords } from "systems/coords/Coords";
import { Log } from "systems/log/Log";
import { UnitProgress } from "systems/player-progress/UnitProgress";
import { MapPlayer, Trigger, Unit } from "w3ts";
import { IHeroManager } from "./IHeroManager";

export interface HeroManagerConfig<HeroClass extends number> {
    heroShopUnitTypeCode: string,
    heroDefs: Record<HeroClass, HeroDefinition>,
}

export type HeroDefinition = {
    name: string,
    unitTypeCode: string,
}

export type HeroTemplate<HeroClass> = HeroDefinition & {
    unitTypeId: number,
    heroClass: HeroClass
}

export class HeroManager<HeroClass extends number> implements IHeroManager {

    public readonly playerHero: Map<number, Unit> = new Map<number, Unit>();
    public readonly unitTypeDef: Record<number, HeroTemplate<HeroClass>> = {};

    private readonly heroShopUnitTypeId: number;
    
    constructor(
        config: HeroManagerConfig<HeroClass>,
        private readonly heroProgressFactory: Record<HeroClass, (u: Unit) => UnitProgress>,
    ) {
        for (let k of Object.keys(config.heroDefs)) {
            let heroClass = <HeroClass>(Number(k));
            let d = config.heroDefs[heroClass];
            const template: HeroTemplate<HeroClass> = {
                name: d.name,
                unitTypeCode: d.unitTypeCode,
                unitTypeId: FourCC(d.unitTypeCode),
                heroClass: heroClass,
            }
            this.unitTypeDef[template.unitTypeId] = template;
        }

        this.heroShopUnitTypeId = FourCC(config.heroShopUnitTypeCode);

        const soldUnitTrigger = new Trigger();
        soldUnitTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);
        soldUnitTrigger.addAction(() => this.OnUnitSold());
    }

    public CreateHeroShop(location: Coords, owner: MapPlayer) {
        const heroShop = new Unit(owner, this.heroShopUnitTypeId, location.x, location.y, 0);
        return heroShop;
    }

    private OnUnitSold() {
        
        try {
            let sold = Unit.fromHandle(GetSoldUnit());
            let playerId = sold.owner.id;
            let typeId = sold.typeId;

            if (typeId in this.unitTypeDef == false) return null;

            let config = this.unitTypeDef[typeId];

            let playerClass: UnitProgress | null = null;

            playerClass = this.heroProgressFactory[config.heroClass](sold);

            this.playerHero.set(playerId, sold);

        } catch (ex: any) {
            Log.Error(ex);
        }
    }
}