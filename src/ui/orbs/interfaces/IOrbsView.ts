import { Frame } from "w3ts";

export interface IOrbsView {
    orbs: IOrbView[],
    topRowIndex: number,
}

export interface IOrbView {
    background: Frame,
    button: {
        main: Frame,
        image: Frame,
    },
    tooltip: {
        box: Frame,
        text: Frame,
    }
    cooldownCounter: Frame,
}