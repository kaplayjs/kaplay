import { DBG_FONT } from "../../constants/general";
import type { DebugWatchEntry, DebugWatches } from "../../debug/watches";
import { rgb } from "../../math/color";
import { vec2 } from "../../math/math";
import { formatText } from "../formatText";
import {
    height,
    multTranslate,
    popTransform,
    pushTransform,
    width,
} from "../stack";
import { drawFormattedText } from "./drawFormattedText";
import { drawMasked } from "./drawMasked";
import { drawRect } from "./drawRect";
import { drawUnscaled } from "./drawUnscaled";

export function drawWatches(
    watches: DebugWatches,
    entries: readonly DebugWatchEntry[],
) {
    if (!entries.length) {
        watches.panel = null;
        watches.scroll = watches.maxScroll = 0;
        return;
    }
    const literal = (value: string) =>
        value.replaceAll("\\", "\\\\").replaceAll("[", "\\[");

    drawUnscaled(() => {
        pushTransform();
        try {
            const top = Math.min(80, height() / 4);
            const margin = Math.min(8, width() / 4, (height() - top) / 4);
            const panelWidth = width() - margin * 2;
            const padding = Math.min(8, panelWidth / 4, (height() - top) / 4);
            const lines = ["Watches"];
            for (const entry of entries) {
                const line = `${literal(entry.name)}: ${literal(entry.value)}`;
                lines.push(entry.error ? `[error]${line}[/error]` : line);
            }
            const text = formatText({
                text: lines.join("\n"),
                font: DBG_FONT,
                size: 16,
                width: Math.max(1, panelWidth - padding * 2),
                pos: vec2(margin + padding, top + padding),
                color: rgb(255, 255, 255),
                fixed: true,
                styles: { error: { color: rgb(255, 0, 127) } },
            });
            const panelHeight = Math.min(
                text.height + padding * 2,
                height() - top - margin,
            );
            watches.maxScroll = Math.max(
                0,
                text.height - (panelHeight - padding * 2),
            );
            watches.scroll = Math.min(watches.scroll, watches.maxScroll);
            watches.panel = {
                x: margin,
                y: top,
                width: panelWidth,
                height: panelHeight,
            };
            const background = {
                pos: vec2(margin, top),
                width: panelWidth,
                height: panelHeight,
                color: rgb(0, 0, 0),
                opacity: 0.8,
                radius: 4,
                fixed: true,
            };
            drawRect(background);
            drawMasked(() => {
                pushTransform();
                try {
                    multTranslate(0, -watches.scroll);
                    drawFormattedText(text);
                } finally {
                    popTransform();
                }
            }, () =>
                drawRect({
                    pos: vec2(margin, top + padding),
                    width: background.width,
                    height: Math.max(1, panelHeight - padding * 2),
                    fixed: true,
                }));
        } finally {
            popTransform();
        }
    });
}
