import { ICoords } from "systems/enum-service/IEnumUnitService";
import { Unit } from "w3ts";

export interface AiState {

    unit: Unit;
    origin: ICoords;
    destination: ICoords;
    Update(data: AiState): boolean;
}