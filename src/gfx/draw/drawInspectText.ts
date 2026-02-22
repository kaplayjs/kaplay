import { DBG_FONT } from "../../constants/general";
import { rgb } from "../../math/color";
import { vec2 } from "../../math/math";
import { type Vec2 } from "../../math/Vec2";
import { formatText } from "../formatText";
import {
    height,
    multTranslateV,
    popTransform,
    pushTransform,
    width,
} from "../stack";
import { drawFormattedText } from "./drawFormattedText";
import { drawRect } from "./drawRect";
import { drawUnscaled } from "./drawUnscaled";

export function drawInspectText(pos: Vec2, txt: string) {
    drawUnscaled(() => {
        const pad = vec2(8);

        pushTransform();
        multTranslateV(pos);

        // cSpell: ignore ftxt
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
