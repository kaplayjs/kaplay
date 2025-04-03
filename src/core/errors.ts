import { DBG_FONT } from "../constants";
import { drawFormattedText } from "../gfx/draw/drawFormattedText";
import { drawRect } from "../gfx/draw/drawRect";
import { drawText } from "../gfx/draw/drawText";
import { drawUnscaled } from "../gfx/draw/drawUnscaled";
import { formatText } from "../gfx/formatText";
import { height, popTransform, width } from "../gfx/stack";
import { _k } from "../kaplay";
import { rgb } from "../math/color";
import { vec2 } from "../math/math";

let crashed = false;

export const handleErr = (err: Error | any) => {
    if (crashed) return;
    crashed = true;
    console.error(err);
    _k.audio.ctx.suspend();
    const errorMessage = err.message ?? String(err)
        ?? "Unknown error, check console for more info";
    let errorScreen = false;

    _k.app.run(
        () => {},
        () => {
            if (errorScreen) return;
            errorScreen = true;

            _k.frameRenderer.frameStart();

            drawUnscaled(() => {
                const pad = 32;
                const gap = 16;
                const gw = width();
                const gh = height();

                const textStyle = {
                    size: 36,
                    width: gw - pad * 2,
                    letterSpacing: 4,
                    lineSpacing: 4,
                    font: DBG_FONT,
                    fixed: true,
                };

                drawRect({
                    width: gw,
                    height: gh,
                    color: rgb(0, 0, 255),
                    fixed: true,
                });

                const title = formatText({
                    ...textStyle,
                    text: "Error",
                    pos: vec2(pad),
                    color: rgb(255, 128, 0),
                    fixed: true,
                });

                drawFormattedText(title);

                drawText({
                    ...textStyle,
                    text: errorMessage,
                    pos: vec2(pad, pad + title.height + gap),
                    fixed: true,
                });

                popTransform();
                _k.game.events.trigger("error", err);
            });

            _k.frameRenderer.frameEnd();
        },
    );
};
