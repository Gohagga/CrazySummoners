import { OrbType } from "content/constants/OrbType";
import { Log } from "systems/log/Log";
import { ISkill } from "systems/skill-manager/ISkill";
import { TextRenderer } from "systems/text-renderer/TextRenderer";
import { TextRendererFactory } from "systems/text-renderer/TextRendererFactory";
import { Unit } from "w3ts";
import { AbilityBase } from "./AbilityBase";
import { Wc3AbilityData } from "./Wc3AbilityData";

export interface OrbAbilityData extends Wc3AbilityData {
    orbCost: OrbType[]
}

export abstract class OrbAbility extends AbilityBase {

    private readonly textRenderer: TextRenderer;

    protected readonly tooltipCost: string;
    protected readonly orbCost: OrbType[];

    constructor(data: OrbAbilityData) {
        super(data);
        
        this.textRenderer = TextRendererFactory.Create();
        this.orbCost = data.orbCost;
        this.tooltipCost = OrbCostToString(data.orbCost) + '\n\n';

        BlzSetAbilityTooltip(this.id, data.name, 0);
        if (data.tooltip) BlzSetAbilityExtendedTooltip(this.id, this.textRenderer.Render(this.tooltipCost + data.tooltip), 0);
    }

    protected override UpdateUnitAbilityBase(unit: Unit, tooltip?: string, cost?: number, cooldown?: number, name?: string) {
        tooltip = this.tooltipCost + tooltip;
        tooltip = this.textRenderer.Render(tooltip);
        if (name) name = this.textRenderer.Render(name);
        super.UpdateUnitAbilityBase(unit, tooltip, cost, cooldown, name);
    }

}

function OrbCostToString(cost: OrbType[]) {
    let retVal = "Cost: [";
    let letter: Record<OrbType, string> = {
        [OrbType.Red]: '|cffff3333R|r',
        [OrbType.White]: 'W',
        [OrbType.Purple]: '|cffff77ffP|r',
        [OrbType.Blue]: '|cff0080ffB|r',
        [OrbType.Summoning]: '|cffffd9b3S|r',
        [OrbType.Any]: ''
    }
    let first = true;
    for (let o of cost) {
        if (letter[o] != '') {
            if (first) {
                first = false;
            } else {
                retVal += ' + ';
            }
            retVal += letter[o];
        }
    }
    retVal += ']';
    return retVal;
}