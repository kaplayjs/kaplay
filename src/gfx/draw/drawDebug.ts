import { DBG_FONT, LOG_TIME } from "../../constants/general";
import { isPaused } from "../../ecs/entity/utils";
import { rgb } from "../../math/color";
import { vec2, wave } from "../../math/math";
import { _k } from "../../shared";
import { formatText } from "../formatText";
import {
    height,
    multTranslate,
    popTransform,
    pushTransform,
    width,
} from "../stack";
import { viewportToCanvas } from "../viewport";
import { drawCircle } from "./drawCircle";
import { drawFormattedText } from "./drawFormattedText";
import { drawInspectText } from "./drawInspectText";
import { drawRect } from "./drawRect";
import { drawTriangle } from "./drawTriangle";
import { drawUnscaled } from "./drawUnscaled";

export function drawDebug() {
    if (_k.debug.inspect) {
        let inspecting = null;

        for (const obj of _k.game.root.get("*", { recursive: true })) {
            if (
                obj.has("area")
                && (_k.globalOpt.inspectOnlyActive ? !isPaused(obj) : true)
                && obj.isHovering()
            ) {
                inspecting = obj;
                break;
            }
        }

        pushTransform();
        _k.game.root.drawInspect();
        popTransform();

        if (inspecting) {
            const lines = [];
            const data = inspecting.inspect();

            for (const tag in data) {
                if (data[tag]) {
                    // pushes the inspect function (eg: `sprite: "bean"`)
                    lines.push(data[tag]);
                }
                else {
                    // pushes only the tag (name of the component)
                    lines.push(tag);
                }
            }

            lines.push(...inspecting.tags.map(t => `tag: ${t}`));

            drawInspectText(
                viewportToCanvas(_k.app.mousePos()),
                lines.join("\n"),
            );
        }

        drawInspectText(
            vec2(8),
            `FPS: ${Math.round(_k.debug.fps())}
Raw: ${Math.round(_k.debug.rawFPS())}
Batches: ${_k.gfx.renderer.numDraws}`,
        );
    }

    if (_k.debug.paused) {
        drawUnscaled(() => {
            // top right corner
            pushTransform();
            multTranslate(width(), 0);
            multTranslate(-8, 8);

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

    if (_k.debug.timeScale !== 1) {
        drawUnscaled(() => {
            // bottom right corner
            pushTransform();
            multTranslate(width(), height());
            multTranslate(-8, -8);

            const pad = 8;

            // format text first to get text size
            const ftxt = formatText({
                text: _k.debug.timeScale.toFixed(1),
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
                const flipped = _k.debug.timeScale < 1;
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

    if (_k.debug.curRecording !== null) {
        drawUnscaled(() => {
            pushTransform();
            multTranslate(width() - 24, 24);

            drawCircle({
                radius: 12,
                color: rgb(255, 0, 0),
                opacity: wave(0, 1, _k.app.time() * 4),
                fixed: true,
            });

            popTransform();
        });
    }

    if (_k.debug.showLog && _k.game.logs.length > 0) {
        drawUnscaled(() => {
            pushTransform();
            multTranslate(0, height());
            multTranslate(8, -8);

            const pad = 8;
            const logs = [];

            for (const log of _k.game.logs) {
                let str = "";
                const style = log.msg instanceof Error ? "error" : "info";
                str += `[time]${log.time.toFixed(2)}[/time]`;
                str += " ";
                str += `[${style}]${prettyDebug(log.msg)}[/${style}]`;
                logs.push(str);
            }

            _k.game.logs = _k.game.logs
                .filter((log) =>
                    _k.app.time() - log.time
                        < (_k.globalOpt.logTime || LOG_TIME)
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

function prettyDebug(
    object: any | undefined,
    inside: boolean = false,
    seen: Set<any> = new Set(),
): string {
    if (seen.has(object)) return "<recursive>";
    var outStr = "", tmp;
    if (inside && typeof object === "string") {
        object = JSON.stringify(object);
    }
    if (Array.isArray(object)) {
        outStr = [
            "[",
            object.map(e => prettyDebug(e, true, seen.union(new Set([object]))))
                .join(", "),
            "]",
        ].join("");
        object = outStr;
    }
    if (object === null) return "null";
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
                            prettyDebug(
                                object[p],
                                true,
                                seen.union(new Set([object])),
                            )
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
