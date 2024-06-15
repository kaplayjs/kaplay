import { DEF_TEXT_SIZE } from "../../constants";
import { getInternalContext, getKaboomContext } from "../../kaboom";
import { Rect, vec2 } from "../../math";
import type { GameObj, TextComp, TextCompOpt } from "../../types";

export function text(t: string, opt: TextCompOpt = {}): TextComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    function update(obj: GameObj<TextComp | any>) {
        const ftext = k.formatText(Object.assign(internal.getRenderProps(obj), {
            text: obj.text + "",
            size: obj.textSize,
            font: obj.font,
            width: opt.width && obj.width,
            align: obj.align,
            letterSpacing: obj.letterSpacing,
            lineSpacing: obj.lineSpacing,
            // TODO: shouldn't run when object / ancestor is paused
            transform: obj.textTransform,
            styles: obj.textStyles,
        }));

        if (!opt.width) {
            obj.width = ftext.width / (obj.scale?.x || 1);
        }

        obj.height = ftext.height / (obj.scale?.y || 1);

        return ftext;
    }

    const obj = {
        id: "text",
        set text(nt) {
            t = nt;
            // @ts-ignore
            update(this);
        },
        get text() {
            return t;
        },
        textSize: opt.size ?? DEF_TEXT_SIZE,
        font: opt.font,
        width: opt.width ?? 0,
        height: 0,
        align: opt.align,
        lineSpacing: opt.lineSpacing,
        letterSpacing: opt.letterSpacing,
        textTransform: opt.transform,
        textStyles: opt.styles,

        add(this: GameObj<TextComp>) {
            k.onLoad(() => update(this));
        },

        draw(this: GameObj<TextComp>) {
            k.drawFormattedText(update(this));
        },

        renderArea() {
            return new Rect(vec2(0), this.width, this.height);
        },
    };

    // @ts-ignore
    update(obj);

    return obj;
}
