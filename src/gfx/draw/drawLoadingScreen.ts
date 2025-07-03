import { loadProgress } from "../../assets/asset.js";
import { rgb } from "../../math/color.js";
import { vec2 } from "../../math/math.js";
import { _k } from "../../shared.js";
import { height, width } from "../stack.js";
import { drawRect } from "./drawRect.js";
import { drawUnscaled } from "./drawUnscaled.js";

export function drawLoadScreen() {
    const progress = loadProgress();

    if (_k.game.events.numListeners("loading") > 0) {
        _k.game.events.trigger("loading", progress);
    }
    else {
        drawUnscaled(() => {
            const w = width() / 2;
            const h = 24;
            const pos = vec2(width() / 2, height() / 2).sub(
                vec2(w / 2, h / 2),
            );
            drawRect({
                pos: vec2(0),
                width: width(),
                height: height(),
                color: rgb(0, 0, 0),
            });
            drawRect({
                pos: pos,
                width: w,
                height: h,
                fill: false,
                outline: {
                    width: 4,
                },
            });
            drawRect({
                pos: pos,
                width: w * progress,
                height: h,
            });
        });
    }
}
