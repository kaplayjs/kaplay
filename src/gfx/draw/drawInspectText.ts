import { DBG_FONT } from "../../constants";
import { rgb } from "../../math/color";
import { type Vec2, vec2 } from "../../math/math";
import { formatText } from "../formatText";
import {
    height,
    popTransform,
    pushTransform,
    pushTranslateV,
    width,
} from "../stack";
import { drawFormattedText } from "./drawFormattedText";
import { drawRect } from "./drawRect";
import { drawUnscaled } from "./drawUnscaled";

export function drawInspectText(pos: Vec2, txt: string) {
    drawUnscaled(() => {
        const pad = vec2(8);

        pushTransform();
        pushTranslateV(pos);

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
            pushTranslateV(vec2(-bw, 0));
        }

        if (pos.y + bh >= height()) {
            pushTranslateV(vec2(0, -bh));
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
