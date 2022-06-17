import { OrbType } from "content/constants/OrbType";
import { Bless } from "content/spells/paladin/Bless";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { UnitProgress } from "systems/player-progress/UnitProgress";
import { ISkill } from "systems/skill-manager/ISkill";
import { ISkillManager } from "systems/skill-manager/ISkillManager";
import { MapPlayer, Unit } from "w3ts";

export type PaladinAbilities = {
    bless: Bless
}

export class PaladinProgression extends UnitProgress {
    
    protected owner: MapPlayer;

    constructor(
        protected unit: Unit,
        protected abilities: PaladinAbilities,
        protected resourceBarManager: ResourceBarManager,
        protected skillManager: ISkillManager,
    ) {
        super(unit);
        this.owner = unit.owner;
    }

    protected Progress(): void {
        
        this.SetupSkills();

        let bar = this.resourceBarManager.Create(this.owner);
        bar.AddOrb(OrbType.Summoning);
        bar.AddOrb(OrbType.Summoning);
        bar.AddOrb(OrbType.White);
        bar.AddOrb(OrbType.White);
        bar.AddOrb(OrbType.White);
        bar.AddOrb(OrbType.Blue);
    }

    protected SetupSkills() {
        for (let k of Object.keys(this.abilities)) {
            let skill = (this.abilities as Record<string, ISkill>)[k];
            this.skillManager.UnitAddSkill(this.unit, skill);
        }

        this.skillManager.UpdateUnitSkills(this.unit);
    }
}