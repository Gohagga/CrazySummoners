import { Color, MapPlayer, color } from "w3ts";
import { IOrbModel } from "../interfaces/IOrbModel";
import { IOrbView } from "../interfaces/IOrbsView";
import { IOrbViewModel } from "../interfaces/IOrbViewModel";

export class OrbViewModel implements IOrbViewModel {

    private _orbModel: null | IOrbModel = null;
    private view : IOrbView;
    private orbTypeData: Record<number, OrbTypeData>;
    private emptySlotBackground: string;
    private owner: MapPlayer;

    constructor(cfg: OrbViewModelConfig, owner: MapPlayer, orbView: IOrbView) {
        this.view = orbView;
        this.orbTypeData = cfg.orbTypeData;
        this.emptySlotBackground = cfg.emptySlotBackgroundTexture;
        this.owner = owner;

        this.Update();
    }

    public get orbModel() : null | IOrbModel {
        return this._orbModel;
    }
    public set orbModel(v : null | IOrbModel) {

        if (this._orbModel != null) this._orbModel.onUpdate = null;
        this._orbModel = v;
        if (this._orbModel != null) this._orbModel.onUpdate = () => this.Update();

        this.Update();
    }

    /**
     * Contains local code
     */
    Update() {

        if (this.owner.isLocal() == false) return;

        this.view.button.main.setVisible(true);
        this.view.background.setVisible(true);

        if (this._orbModel == null) {
            this.view.button.image.setTexture(this.emptySlotBackground, 0, true);
            this.view.cooldownCounter.setVisible(false);
            return;
        }

        let orbData = this.orbTypeData[this._orbModel.orbTypeId];

        if (this._orbModel.isAvailable) {
            this.view.button.image.setTexture(orbData.iconEnabled, 0, true);
            this.view.cooldownCounter.setVisible(false);
        } else {
            this.view.button.image.setTexture(orbData.iconDisabled, 0, true);
            
            if (this._orbModel.cooldownRemaining > 0) {
                this.view.cooldownCounter.setText(string.format("%.1f", this._orbModel.cooldownRemaining));
                this.view.cooldownCounter.setVisible(true);
            } else {
                this.view.cooldownCounter.setVisible(true);
            }
        }
        this.view.tooltip.text.text = orbData.tooltip;
    }    
}

export interface OrbViewModelConfig {
    emptySlotBackgroundTexture: string;
    orbTypeData: Record<number, OrbTypeData>;
}

interface OrbTypeData {
    iconEnabled: string,
    iconDisabled: string,
    tooltip: string,
}