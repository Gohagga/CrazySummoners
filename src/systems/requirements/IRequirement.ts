import { MapPlayer } from "w3ts";

export interface IRequirement {
    Get(player: MapPlayer): number;
    Increase(player: MapPlayer, amount?: number): number;
    Decrease(player: MapPlayer, amount?: number): number;
    Set(player: MapPlayer, amount: number): boolean;
    
    OnChange(callback: (player: MapPlayer) => void): void;
}