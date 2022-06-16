import { OrbType } from "content/constants/OrbType";
import { MapPlayer } from "w3ts";
import { IOrbsView } from "../interfaces/IOrbsView";
import { IOrbViewModel } from "../interfaces/IOrbViewModel";
import { IResourceBarModel } from "../interfaces/IResourceBarModel";

export class ResourceBarViewModel {

    private view: IOrbsView;
    private orbViewModels: IOrbViewModel[];
    private topRowIndex: number;

    private _resourceBar: null | IResourceBarModel = null;

    constructor(
        private owner: MapPlayer,
        orbsView: IOrbsView,
        orbViewFactory: (i: number) => IOrbViewModel,
    ) {
        this.view = orbsView;
        this.orbViewModels = [];
        this.topRowIndex = orbsView.topRowIndex;

        for (let i = 0; i < orbsView.orbs.length; i++) {
            this.orbViewModels.push(orbViewFactory(i));
        }
    }

    public get resourceBar(): null | IResourceBarModel {
        return this._resourceBar;
    }
    public set resourceBar(v: null | IResourceBarModel) {
        this._resourceBar = v;
        if (v) v.onUpdate = () => this.Update();
    }
    
    Update() {
        if (!this._resourceBar) return;

        let topRowIndex = this.topRowIndex;
        let bottomRowIndex = 0;

        for (let orb of this._resourceBar.orbs) {
            let vm: IOrbViewModel;
            if (orb.orbTypeId == OrbType.Summoning) {
                if (topRowIndex == this.topRowIndex + 6) continue;
                else vm = this.orbViewModels[topRowIndex++];
            } else {
                if (bottomRowIndex == this.topRowIndex) continue;
                vm = this.orbViewModels[bottomRowIndex++];
            }

            vm.orbModel = orb;
        }

        // Empty the rest of the orb slots
        for (let i = bottomRowIndex; i < this.topRowIndex; i++) {
            this.orbViewModels[i].orbModel = null;
        }
        for (let i = topRowIndex; i < this.orbViewModels.length; i++) {
            this.orbViewModels[i].orbModel = null;
        }
    }
}