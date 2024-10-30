import { DBG_FONT, LOG_TIME } from "../../constants";
import { app, debug, game, globalOpt } from "../../kaplay";
import { rgb } from "../../math/color";
import { vec2, wave } from "../../math/math";
import { formatText } from "../formatText";
import {
    contentToView,
    height,
    mousePos,
    popTransform,
    pushTransform,
    pushTranslate,
    width,
} from "../stack";
import { drawCircle } from "./drawCircle";
import { drawFormattedText } from "./drawFormattedText";
import { drawInspectText } from "./drawInspectText";
import { drawRect } from "./drawRect";
import { drawTriangle } from "./drawTriangle";
import { drawUnscaled } from "./drawUnscaled";

export function drawDebug() {
    if (debug.inspect) {
        let inspecting = null;

        for (const obj of game.root.get("*", { recursive: true })) {
            if (obj.c("area") && obj.isHovering()) {
                inspecting = obj;
                break;
            }
        }

        game.root.drawInspect();

        if (inspecting) {
            const lines = [];
            const data = inspecting.inspect();

            for (const tag in data) {
                if (data[tag]) {
                    // pushes the inspect function (eg: `sprite: "bean"`)
                    lines.push(`${data[tag]}`);
                }
                else {
                    // pushes only the tag (name of the component)
                    lines.push(`${tag}`);
                }
            }

            drawInspectText(contentToView(mousePos()), lines.join("\n"));
        }

        drawInspectText(vec2(8), `FPS: ${debug.fps()}`);
    }

    if (debug.paused) {
        drawUnscaled(() => {
            // top right corner
            pushTransform();
            pushTranslate(width(), 0);
            pushTranslate(-8, 8);

            const size = 32;

            // bg
            drawRect({
                width: size,
                height: size,
                anchor: "topright",
                color: rgb(0, 0, 0),
                opacity: 0.8,
                radius: 4,
                fixed: true,
            });

            // pause icon
            for (let i = 1; i <= 2; i++) {
                drawRect({
                    width: 4,
                    height: size * 0.6,
                    anchor: "center",
                    pos: vec2(-size / 3 * i, size * 0.5),
                    color: rgb(255, 255, 255),
                    radius: 2,
                    fixed: true,
                });
            }

            popTransform();
        });
    }

    if (debug.timeScale !== 1) {
        drawUnscaled(() => {
            // bottom right corner
            pushTransform();
            pushTranslate(width(), height());
            pushTranslate(-8, -8);

            const pad = 8;

            // format text first to get text size
            const ftxt = formatText({
                text: debug.timeScale.toFixed(1),
                font: DBG_FONT,
                size: 16,
                color: rgb(255, 255, 255),
                pos: vec2(-pad),
                anchor: "botright",
                fixed: true,
            });

            // bg
            drawRect({
                width: ftxt.width + pad * 2 + pad * 4,
                height: ftxt.height + pad * 2,
                anchor: "botright",
                color: rgb(0, 0, 0),
                opacity: 0.8,
                radius: 4,
                fixed: true,
            });

            // fast forward / slow down icon
            for (let i = 0; i < 2; i++) {
                const flipped = debug.timeScale < 1;
                drawTriangle({
                    p1: vec2(-ftxt.width - pad * (flipped ? 2 : 3.5), -pad),
                    p2: vec2(
                        -ftxt.width - pad * (flipped ? 2 : 3.5),
                        -pad - ftxt.height,
                    ),
                    p3: vec2(
                        -ftxt.width - pad * (flipped ? 3.5 : 2),
                        -pad - ftxt.height / 2,
                    ),
                    pos: vec2(-i * pad * 1 + (flipped ? -pad * 0.5 : 0), 0),
                    color: rgb(255, 255, 255),
                    fixed: true,
                });
            }

            // text
            drawFormattedText(ftxt);

            popTransform();
        });
    }

    if (debug.curRecording) {
        drawUnscaled(() => {
            pushTransform();
            pushTranslate(0, height());
            pushTranslate(24, -24);

            drawCircle({
                radius: 12,
                color: rgb(255, 0, 0),
                opacity: wave(0, 1, app.time() * 4),
                fixed: true,
            });

            popTransform();
        });
    }

    if (debug.showLog && game.logs.length > 0) {
        drawUnscaled(() => {
            pushTransform();
            pushTranslate(0, height());
            pushTranslate(8, -8);

            const pad = 8;
            const logs = [];

            for (const log of game.logs) {
                let str = "";
                const style = log.msg instanceof Error ? "error" : "info";
                str += `[time]${log.time.toFixed(2)}[/time]`;
                str += " ";
                str += `[${style}]${prettyDebug(log.msg)}[/${style}]`;
                logs.push(str);
            }

            game.logs = game.logs
                .filter((log) =>
                    app.time() - log.time < (globalOpt.logTime || LOG_TIME)
                );

            const ftext = formatText({
                text: logs.join("\n"),
                font: DBG_FONT,
                pos: vec2(pad, -pad),
                anchor: "botleft",
                size: 16,
                width: width() * 0.6,
                lineSpacing: pad / 2,
                fixed: true,
                styles: {
                    "time": { color: rgb(127, 127, 127) },
                    "info": { color: rgb(255, 255, 255) },
                    "error": { color: rgb(255, 0, 127) },
                },
            });

            drawRect({
                width: ftext.width + pad * 2,
                height: ftext.height + pad * 2,
                anchor: "botleft",
                color: rgb(0, 0, 0),
                radius: 4,
                opacity: 0.8,
                fixed: true,
            });

            drawFormattedText(ftext);
            popTransform();
        });
    }
}

function prettyDebug(object: any | undefined, inside: boolean = false): string {
    var outStr = "", tmp;
    if (inside && typeof object === "string") {
        object = JSON.stringify(object);
    }
    if (Array.isArray(object)) {
        outStr = [
            "[",
            object.map(e => prettyDebug(e, true)).join(", "),
            "]",
        ].join("");
        object = outStr;
    }
    if (
        typeof object === "object"
        && object.toString === Object.prototype.toString
    ) {
        if (object.constructor !== Object) {
            outStr += object.constructor.name + " ";
        }
        outStr += [
            "{",
            (tmp = Object.getOwnPropertyNames(object)
                    .map(p =>
                        `${/^\w+$/.test(p) ? p : JSON.stringify(p)}: ${
                            prettyDebug(object[p], true)
                        }`
                    )
                    .join(", "))
                ? ` ${tmp} `
                : "",
            "}",
        ].join("");
        object = outStr;
    }
    return String(object).replaceAll(/(?<!\\)\[/g, "\\[");
}
