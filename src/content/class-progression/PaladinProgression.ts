import { OrbType } from "content/constants/OrbType";
import { Bless } from "content/spells/paladin/Bless";
import { PaladinMastery } from "content/spells/paladin/PaladinMastery";
import { WhitePower } from "content/spells/paladin/WhitePower";
import { IGameStateEventHandler } from "systems/game-state/IGameStateEventHandler";
import { Delay } from "systems/helpers/Delay";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { UnitProgress } from "systems/player-progress/UnitProgress";
import { ISkill } from "systems/skill-manager/ISkill";
import { ISkillManager } from "systems/skill-manager/ISkillManager";
import { MapPlayer, Unit } from "w3ts";

export type PaladinAbilities = {
    bless: Bless,
    whitePower: WhitePower,
}

export class PaladinProgression extends UnitProgress {
    
    protected owner: MapPlayer;

    constructor(
        protected unit: Unit,
        protected gameStateEvent: IGameStateEventHandler,
        protected abilities: PaladinAbilities,
        protected resourceBarManager: ResourceBarManager,
        protected skillManager: ISkillManager,
        protected paladinMastery: PaladinMastery,
    ) {
        super(unit, gameStateEvent);
        this.owner = unit.owner;
    }

    protected Progress(): void {
        
        this.SetupSkills();

        let bar = this.resourceBarManager.Create(this.owner);
        Delay
            .Call(0.2, () => bar.AddOrb(OrbType.Summoning))
            .Then(0.2, () => bar.AddOrb(OrbType.Summoning))
            .Then(0.2, () => bar.AddOrb(OrbType.White))
            .Then(0.2, () => bar.AddOrb(OrbType.White))
            .Then(0.2, () => bar.AddOrb(OrbType.White))
            .Then(0.2, () => bar.AddOrb(OrbType.Blue));

        let wps = this.abilities.whitePower.CreateStacksItem(this.unit);
        
        this.WaitForGameStart();
        this.abilities.whitePower.StartChargeUp(this.unit, 1, wps);

        this.WaitForUnitLevel(6);
        this.paladinMastery.AddHeroChooseMastery(this.unit);
        this.unit.selectSkill(this.paladinMastery.id);

        this.WaitForUnitLevel(7);
    }

    protected SetupSkills() {
        for (let k of Object.keys(this.abilities)) {
            let skill = (this.abilities as Record<string, ISkill>)[k];
            this.skillManager.UnitAddSkill(this.unit, skill);
        }

        this.skillManager.UpdateUnitSkills(this.unit);
    }
}