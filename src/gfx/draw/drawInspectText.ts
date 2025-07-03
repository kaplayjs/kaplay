import { DBG_FONT } from "../../constants/general.js";
import { rgb } from "../../math/color.js";
import { vec2 } from "../../math/math.js";
import { type Vec2 } from "../../math/Vec2.js";
import { formatText } from "../formatText.js";
import {
    height,
    multTranslateV,
    popTransform,
    pushTransform,
    width,
} from "../stack.js";
import { drawFormattedText } from "./drawFormattedText.js";
import { drawRect } from "./drawRect.js";
import { drawUnscaled } from "./drawUnscaled.js";

export function drawInspectText(pos: Vec2, txt: string) {
    drawUnscaled(() => {
        const pad = vec2(8);

        pushTransform();
        multTranslateV(pos);

        const ftxt = formatText({
            text: txt,
            font: DBG_FONT,
            size: 16,
            pos: pad,
            color: rgb(255, 255, 255),
            fixed: true,
        });

        const bw = ftxt.width + pad.x * 2;
        const bh = ftxt.height + pad.x * 2;

        if (pos.x + bw >= width()) {
            multTranslateV(vec2(-bw, 0));
        }

        if (pos.y + bh >= height()) {
            multTranslateV(vec2(0, -bh));
        }

        drawRect({
            width: bw,
            height: bh,
            color: rgb(0, 0, 0),
            radius: 4,
            opacity: 0.8,
            fixed: true,
        });

        drawFormattedText(ftxt);
        popTransform();
    });
}
