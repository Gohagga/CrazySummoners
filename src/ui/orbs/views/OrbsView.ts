import { Frame } from "w3ts";
import { IOrbsView, IOrbView } from "../interfaces/IOrbsView";

export function GenerateOrbView(cfg: IOrbViewConfig, parent: Frame): IOrbsView {
    
    let orbs: IOrbView[] = [];

    const window = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", "SpellstringBox", parent.handle, "", 0));
    
    for (let i = 0; i < cfg.ballCount; i++) {
        let orbView = CreateOrbView(cfg, i, window);
        orbs.push(orbView);
    }

    cfg.window.y += cfg.ball.height - 0.006;
    cfg.window.x += 0.016;

    for (let i = 0; i < 6; i++) {
        let orbView = CreateOrbView(cfg, i, window);
        orbs.push(orbView);
    }

    let view: IOrbsView = {
        orbs: orbs,
        topRowIndex: cfg.ballCount
    }

    return view;
}


function CreateOrbView(cfg: IOrbViewConfig, i: number, parent: Frame): IOrbView {

    let x = cfg.window.x + i * (cfg.ball.width + cfg.ball.padding);
    let y = cfg.window.y;

    const background = Frame.fromHandle(BlzCreateFrameByType("BACKDROP", "OrbBackground", parent.handle, "", i));
    const buttonMain = new Frame("ScoreScreenBottomButtonTemplate", parent, 0, 0);
    const buttonImage = Frame.fromName("ScoreScreenButtonBackdrop", 0);
    const toolBox = new Frame("ListBoxWar3", buttonMain, 0, 0);
    const toolText = Frame.fromHandle(BlzCreateFrameByType("TEXT", "StandardInfoTextTemplate", toolBox.handle, "StandardInfoTextTemplate", 0));
    const cooldownCounter = Frame.fromHandle(BlzCreateFrameByType("TEXT", "StandardInfoTextTemplate", buttonMain.handle, "StandardInfoTextTemplate", 0));

    buttonMain.setTooltip(toolBox);

    background
        .setAbsPoint(FramePoint.C, x, y)
        .setSize(cfg.ball.width, cfg.ball.height)
        .setTexture(cfg.ball.backgroundTexture, 0, true);

    buttonMain
        .setAbsPoint(FramePoint.C, x, y)
        .setSize(cfg.ball.width, cfg.ball.height)
        .setScale(cfg.ball.iconScale)
        // .setVisible(false)
        .setEnabled(false);

    buttonImage
        .setTexture(cfg.ball.backgroundTexture, 0, true);

    cooldownCounter
        .setAbsPoint(FramePoint.C, x, y)
        .setScale(1.25)
        .setText("0.0")
        .setEnabled(false)
        .setVertexColor(16758842);

    toolBox.clearPoints()
        .setAbsPoint(FramePoint.BR, 0.81, 0.163)
        .setSize(0.3, 0.038);

    toolText.clearPoints()
        .setPoint(FramePoint.TL, toolBox, FramePoint.TL, 0.01, -0.01)
        .setText("sdijfwseifj wier iwerfh wierjhrtfh")
        .setScale(1.25);

    let orbView: IOrbView = {
        background: background,
        button: {
            main: buttonMain,
            image: buttonImage,
        },
        cooldownCounter: cooldownCounter,
        tooltip: {
            box: toolBox,
            text: toolText,
        },
    };

    return orbView;
}

export interface IOrbViewConfig {
    ballCount: number,
    ball: {
        width: number,
        height: number,
        padding: number,
        iconScale: number,
        foregroundTexture: string,
        backgroundTexture: string,
    }
    window: {
        x: number,
        y: number,
        width: number,
        height: number,
        backgroundTexture: string,
    }
}

const FramePoint = {
    C: FRAMEPOINT_CENTER,
    T: FRAMEPOINT_TOP,
    B: FRAMEPOINT_BOTTOM,
    TL: FRAMEPOINT_TOPLEFT,
    TR: FRAMEPOINT_TOPRIGHT,
    BL: FRAMEPOINT_BOTTOMLEFT,
    BR: FRAMEPOINT_BOTTOMRIGHT,
    L: FRAMEPOINT_LEFT,
    R: FRAMEPOINT_RIGHT,
}

