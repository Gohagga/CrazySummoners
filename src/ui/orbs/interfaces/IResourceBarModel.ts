import { IOrbModel } from "./IOrbModel";

export interface IResourceBarModel {

    onUpdate: () => void;

    orbs: IOrbModel[];

    ResetCooldowns(cooldown: number): void;
}