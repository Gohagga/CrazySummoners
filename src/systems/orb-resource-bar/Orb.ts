import { OrbType } from "content/constants/OrbType";
import { IRequirement } from "systems/requirements/IRequirement";
import { IOrbModel } from "ui/orbs/interfaces/IOrbModel";
import { MapPlayer, Timer } from "w3ts";

const COOLDOWN_PERIOD = 0.1;

export interface OrbConfig {
    requirements: Record<OrbType, IRequirement>
}

export class Orb implements IOrbModel {
    
    private orbTypeRequirements: Record<OrbType, IRequirement>;
    isAvailable: boolean = true;
    cooldownRemaining: number = 0;

    onUpdate: () => void = () => {};
    
    private _orbTypeId: OrbType;
    private timer: Timer = new Timer();

    constructor(
        config: OrbConfig,
        private owner: MapPlayer,
        orbTypeId: OrbType,
    ) {
        this.orbTypeRequirements = config.requirements;
        this._orbTypeId = orbTypeId;
        print("Creating orb of type", orbTypeId);
        this.requirement.Increase(this.owner, 1);
    }

    private get requirement(): IRequirement {
        // print("Get Requirement", this._orbTypeId);
        return this.orbTypeRequirements[this._orbTypeId];
    }

    public get orbTypeId(): OrbType {
        return this._orbTypeId;
    }

    public set orbTypeId(v: OrbType) {
        
        print("Set orbtypeid", this._orbTypeId, "to", v);
        let req = this.requirement;
        
        if (req.Get(this.owner) > 0)
            req.Decrease(this.owner, 1);
        
        this._orbTypeId = v;
        req.Increase(this.owner, 1);
    }
    

    public Consume(cooldown: number) {
        this.isAvailable = false;
        this.cooldownRemaining = cooldown;

        this.requirement.Decrease(this.owner, 1);
        
        this.timer.start(COOLDOWN_PERIOD, true, () => {
            this.cooldownRemaining -= COOLDOWN_PERIOD;
            if (this.cooldownRemaining <= 0 || this.isAvailable == true) {
                this.isAvailable = true;
                this.requirement.Increase(this.owner, 1);
                this.timer.pause();
            }
            this.onUpdate();
        });
    }
}
//     public type: OrbType;
//     public cooldownRemaining = 0;
//     public isAvailable = true;
//     public enabledTexture = "";
//     public disabledTexture = "";
//     public upgradeId = -1;
//     public tooltip = "";
//     public static get Config() {
//         return {
//             icon: [
//                 Textures.BallBlue,
//                 Textures.BallWhite,
//                 Textures.BallRed,
//                 Textures.BallPurple,
//                 Textures.BallSummoning,
//                 ""
//             ],
//             disabled: [
//                 Textures.DisBallBlue,
//                 Textures.DisBallWhite,
//                 Textures.DisBallRed,
//                 Textures.DisBallPurple,
//                 Textures.DisBallSummoning,
//                 ""
//             ],
//             upgrade: [
//                 Upgrades.BlueOrbs,
//                 Upgrades.WhiteOrbs,
//                 Upgrades.RedOrbs,
//                 Upgrades.PurpleOrbs,
//                 Upgrades.SummoningOrbs,
//                 Upgrades.AnyOrbs
//             ],
//             tooltip: [
//                 "Blue Orb",
//                 "White Orb",
//                 "Red Orb",
//                 "Purple Orb",
//                 "Summoning Orb",
//                 ""
//             ]
//         };
//     };
//     private timer = CreateTimer();
//     private index: number;

//     constructor(type: OrbType, index: number) {
//         this.type = type;
//         let typeId = <number>type;
//         this.enabledTexture = Orb.Config.icon[typeId];
//         this.disabledTexture = Orb.Config.disabled[typeId];
//         this.upgradeId = Orb.Config.upgrade[typeId];
//         this.tooltip = Orb.Config.tooltip[typeId];
//         this.index = index;

//         // TODO: SWITCH THIS OUT AND CHECK FOR INDEX SWITCHING
//         let orbView = OrbView.Orbs[this.index];
//         orbView.tooltipText.SetText(this.tooltip);
//     }

//     public Destroy() {
//         PauseTimer(this.timer);
//         DestroyTimer(this.timer);
//     }

//     public Update(player: player) {
//         let orbView = OrbView.Orbs[this.index];
//         if (GetLocalPlayer() == player) {

//             orbView.mainButton.SetVisible(true);
//             orbView.background.SetVisible(true);

//             if (this.isAvailable) {
//                 orbView.mainImage.SetTexture(this.enabledTexture);
//                 orbView.cooldownCounter.SetVisible(false);
//             } else {
//                 orbView.mainImage.SetTexture(this.disabledTexture);
//                 orbView.cooldownCounter.SetVisible(true);
//                 orbView.cooldownCounter.SetText(string.format("%.1f", this.cooldownRemaining));
//             }
//         }
//     }

//     public Consume(player: player, seconds: number) {
//         this.isAvailable = false;
//         this.cooldownRemaining = seconds;
//         BlzDecPlayerTechResearched(player, this.upgradeId, 1);

//         TimerStart(this.timer, 0.1, true, () => {
//             this.cooldownRemaining -= 0.1;
//             if (this.cooldownRemaining <= 0 || this.isAvailable == true) {
//                 this.isAvailable = true;
//                 AddPlayerTechResearched(player, this.upgradeId, 1);
//                 PauseTimer(this.timer);
//             }
//             this.Update(player);
//         });
//     }
// }

// export function OrbCostToString(cost: OrbType[]) {
//     let retVal = "Cost [";
//     let letter: Record<OrbType, string> = {
//         [OrbType.Red]: '|cffff3333R|r',
//         [OrbType.White]: 'W',
//         [OrbType.Purple]: '|cffff77ffP|r',
//         [OrbType.Blue]: '|cff0080ffB|r',
//         [OrbType.Summoning]: '|cffffd9b3S|r',
//         [OrbType.Any]: ''
//     }
//     let first = true;
//     for (let o of cost) {
//         if (letter[o] != '') {
//             if (first) {
//                 first = false;
//             } else {
//                 retVal += ' + ';
//             }
//             retVal += letter[o];
//         }
//     }
//     retVal += ']';
//     return retVal;
// }