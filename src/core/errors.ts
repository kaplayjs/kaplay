import { DBG_FONT } from "../constants/general";
import { drawFormattedText } from "../gfx/draw/drawFormattedText";
import { drawRect } from "../gfx/draw/drawRect";
import { drawText } from "../gfx/draw/drawText";
import { drawUnscaled } from "../gfx/draw/drawUnscaled";
import { formatText } from "../gfx/formatText";
import { height, popTransform, width } from "../gfx/stack";
import { rgb } from "../math/color";
import { vec2 } from "../math/math";
import { _k } from "../shared";

export const throwError = (err: string) => {
    handleErr(err);
};

export const handleErr = (err: unknown) => {
    if (_k.game.crashed) return;
    _k.game.crashed = true;
    _k.audio.ctx.suspend();
    let error: Error;

    if (err instanceof Error) {
        error = err;
    }
    else {
        error = new Error(String(err));
    }

    if (!error.message) {
        error.message = "Unknown error, check console for more info";
    }

    function showErrorScreen() {
        _k.app.state.stopped = true;
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
                text: esc(error.message),
                pos: vec2(pad, pad + title.height + gap),
                fixed: true,
            });

            popTransform();
            _k.game.events.trigger("error", error);
        });

        _k.frameRenderer.frameEnd();
    }

    showErrorScreen();

    // TODO: Make this a setting
    if (!error.message.startsWith("[rendering]")) {
        console.error(error);
        throw error;
    }
    else {
        // We don't throw rendering errors,
        // but we log them to the console
        // This is for "headless" rendering
        console.error(error);
    }
};

function esc(t: string) {
    return t.replaceAll(/(?<!\\)\[/g, "\\[");
}
