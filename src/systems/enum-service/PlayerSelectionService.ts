import { MapPlayer, Trigger, Unit } from "w3ts/index";

export class PlayerSelectionService {

    private selectedUnits: Record<number, Map<number, Unit>> = {};

    constructor(private readonly players: MapPlayer[]) {

        let t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELECTED);
        t.addAction(() => {

            let player = MapPlayer.fromEvent();
            let id = player.id;
            let unit = Unit.fromEvent();
            if (id in this.selectedUnits == false) this.selectedUnits[id] = new Map<number, Unit>();
            let selected = this.selectedUnits[id];
            selected.set(unit.id, unit);
            print("player" + player.name + "selected", unit.name, unit.id);
        });

        t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DESELECTED);
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH)
        t.addAction(() => {

            let player = MapPlayer.fromEvent();
            let unit = Unit.fromEvent();
            let id = player.id;
            if (id in this.selectedUnits == false) return;
            let selected = this.selectedUnits[id];
            selected.delete(unit.id);
            print("player" + player.name + "deselected", unit.name, unit.id);
        });
    }

    public GetPlayerSelectedUnitIds(player: MapPlayer) {
        let id = player.id;
        if (!this.selectedUnits[id]) return [];
        let values = this.selectedUnits[id].values();
        let retVal: Unit[] = [];
        for (let v of values) {
            if (v.handle) {
                print("has",v.name, v.id);
                retVal.push(v);
            }
        }
        return retVal;
    }

    public ClearPlayerSelection(player: MapPlayer) {
        let id = player.id;
        if (id in this.selectedUnits == false) return;
        delete this.selectedUnits[id];
        ClearSelectionForPlayer(player.handle);
    }
}