"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawDebug = drawDebug;
var general_1 = require("../../constants/general");
var utils_1 = require("../../ecs/entity/utils");
var color_1 = require("../../math/color");
var math_1 = require("../../math/math");
var shared_1 = require("../../shared");
var formatText_1 = require("../formatText");
var stack_1 = require("../stack");
var viewport_1 = require("../viewport");
var drawCircle_1 = require("./drawCircle");
var drawFormattedText_1 = require("./drawFormattedText");
var drawInspectText_1 = require("./drawInspectText");
var drawRect_1 = require("./drawRect");
var drawTriangle_1 = require("./drawTriangle");
var drawUnscaled_1 = require("./drawUnscaled");
function drawDebug() {
    if (shared_1._k.debug.inspect) {
        var inspecting = null;
        for (var _i = 0, _a = shared_1._k.game.root.get("*", { recursive: true }); _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.has("area")
                && (shared_1._k.globalOpt.inspectOnlyActive ? !(0, utils_1.isPaused)(obj) : true)
                && obj.isHovering()) {
                inspecting = obj;
                break;
            }
        }
        (0, stack_1.pushTransform)();
        shared_1._k.game.root.drawInspect();
        (0, stack_1.popTransform)();
        if (inspecting) {
            var lines = [];
            var data = inspecting.inspect();
            for (var tag in data) {
                if (data[tag]) {
                    // pushes the inspect function (eg: `sprite: "bean"`)
                    lines.push(data[tag]);
                }
                else {
                    // pushes only the tag (name of the component)
                    lines.push(tag);
                }
            }
            lines.push.apply(lines, inspecting.tags.map(function (t) { return "tag: ".concat(t); }));
            (0, drawInspectText_1.drawInspectText)((0, viewport_1.viewportToCanvas)(shared_1._k.app.mousePos()), lines.join("\n"));
        }
        (0, drawInspectText_1.drawInspectText)((0, math_1.vec2)(8), "FPS: ".concat(shared_1._k.debug.fps()));
    }
    if (shared_1._k.debug.paused) {
        (0, drawUnscaled_1.drawUnscaled)(function () {
            // top right corner
            (0, stack_1.pushTransform)();
            (0, stack_1.multTranslate)((0, stack_1.width)(), 0);
            (0, stack_1.multTranslate)(-8, 8);
            var size = 32;
            // bg
            (0, drawRect_1.drawRect)({
                width: size,
                height: size,
                anchor: "topright",
                color: (0, color_1.rgb)(0, 0, 0),
                opacity: 0.8,
                radius: 4,
                fixed: true,
            });
            // pause icon
            for (var i = 1; i <= 2; i++) {
                (0, drawRect_1.drawRect)({
                    width: 4,
                    height: size * 0.6,
                    anchor: "center",
                    pos: (0, math_1.vec2)(-size / 3 * i, size * 0.5),
                    color: (0, color_1.rgb)(255, 255, 255),
                    radius: 2,
                    fixed: true,
                });
            }
            (0, stack_1.popTransform)();
        });
    }
    if (shared_1._k.debug.timeScale !== 1) {
        (0, drawUnscaled_1.drawUnscaled)(function () {
            // bottom right corner
            (0, stack_1.pushTransform)();
            (0, stack_1.multTranslate)((0, stack_1.width)(), (0, stack_1.height)());
            (0, stack_1.multTranslate)(-8, -8);
            var pad = 8;
            // format text first to get text size
            var ftxt = (0, formatText_1.formatText)({
                text: shared_1._k.debug.timeScale.toFixed(1),
                font: general_1.DBG_FONT,
                size: 16,
                color: (0, color_1.rgb)(255, 255, 255),
                pos: (0, math_1.vec2)(-pad),
                anchor: "botright",
                fixed: true,
            });
            // bg
            (0, drawRect_1.drawRect)({
                width: ftxt.width + pad * 2 + pad * 4,
                height: ftxt.height + pad * 2,
                anchor: "botright",
                color: (0, color_1.rgb)(0, 0, 0),
                opacity: 0.8,
                radius: 4,
                fixed: true,
            });
            // fast forward / slow down icon
            for (var i = 0; i < 2; i++) {
                var flipped = shared_1._k.debug.timeScale < 1;
                (0, drawTriangle_1.drawTriangle)({
                    p1: (0, math_1.vec2)(-ftxt.width - pad * (flipped ? 2 : 3.5), -pad),
                    p2: (0, math_1.vec2)(-ftxt.width - pad * (flipped ? 2 : 3.5), -pad - ftxt.height),
                    p3: (0, math_1.vec2)(-ftxt.width - pad * (flipped ? 3.5 : 2), -pad - ftxt.height / 2),
                    pos: (0, math_1.vec2)(-i * pad * 1 + (flipped ? -pad * 0.5 : 0), 0),
                    color: (0, color_1.rgb)(255, 255, 255),
                    fixed: true,
                });
            }
            // text
            (0, drawFormattedText_1.drawFormattedText)(ftxt);
            (0, stack_1.popTransform)();
        });
    }
    if (shared_1._k.debug.curRecording) {
        (0, drawUnscaled_1.drawUnscaled)(function () {
            (0, stack_1.pushTransform)();
            (0, stack_1.multTranslate)(0, (0, stack_1.height)());
            (0, stack_1.multTranslate)(24, -24);
            (0, drawCircle_1.drawCircle)({
                radius: 12,
                color: (0, color_1.rgb)(255, 0, 0),
                opacity: (0, math_1.wave)(0, 1, shared_1._k.app.time() * 4),
                fixed: true,
            });
            (0, stack_1.popTransform)();
        });
    }
    if (shared_1._k.debug.showLog && shared_1._k.game.logs.length > 0) {
        (0, drawUnscaled_1.drawUnscaled)(function () {
            (0, stack_1.pushTransform)();
            (0, stack_1.multTranslate)(0, (0, stack_1.height)());
            (0, stack_1.multTranslate)(8, -8);
            var pad = 8;
            var logs = [];
            for (var _i = 0, _a = shared_1._k.game.logs; _i < _a.length; _i++) {
                var log = _a[_i];
                var str = "";
                var style = log.msg instanceof Error ? "error" : "info";
                str += "[time]".concat(log.time.toFixed(2), "[/time]");
                str += " ";
                str += "[".concat(style, "]").concat(prettyDebug(log.msg), "[/").concat(style, "]");
                logs.push(str);
            }
            shared_1._k.game.logs = shared_1._k.game.logs
                .filter(function (log) {
                return shared_1._k.app.time() - log.time
                    < (shared_1._k.globalOpt.logTime || general_1.LOG_TIME);
            });
            var ftext = (0, formatText_1.formatText)({
                text: logs.join("\n"),
                font: general_1.DBG_FONT,
                pos: (0, math_1.vec2)(pad, -pad),
                anchor: "botleft",
                size: 16,
                width: (0, stack_1.width)() * 0.6,
                lineSpacing: pad / 2,
                fixed: true,
                styles: {
                    "time": { color: (0, color_1.rgb)(127, 127, 127) },
                    "info": { color: (0, color_1.rgb)(255, 255, 255) },
                    "error": { color: (0, color_1.rgb)(255, 0, 127) },
                },
            });
            (0, drawRect_1.drawRect)({
                width: ftext.width + pad * 2,
                height: ftext.height + pad * 2,
                anchor: "botleft",
                color: (0, color_1.rgb)(0, 0, 0),
                radius: 4,
                opacity: 0.8,
                fixed: true,
            });
            (0, drawFormattedText_1.drawFormattedText)(ftext);
            (0, stack_1.popTransform)();
        });
    }
}
function prettyDebug(object, inside, seen) {
    if (inside === void 0) { inside = false; }
    if (seen === void 0) { seen = new Set(); }
    if (seen.has(object))
        return "<recursive>";
    var outStr = "", tmp;
    if (inside && typeof object === "string") {
        object = JSON.stringify(object);
    }
    if (Array.isArray(object)) {
        outStr = [
            "[",
            object.map(function (e) { return prettyDebug(e, true, seen.union(new Set([object]))); })
                .join(", "),
            "]",
        ].join("");
        object = outStr;
    }
    if (object === null)
        return "null";
    if (typeof object === "object"
        && object.toString === Object.prototype.toString) {
        if (object.constructor !== Object) {
            outStr += object.constructor.name + " ";
        }
        outStr += [
            "{",
            (tmp = Object.getOwnPropertyNames(object)
                .map(function (p) {
                return "".concat(/^\w+$/.test(p) ? p : JSON.stringify(p), ": ").concat(prettyDebug(object[p], true, seen.union(new Set([object]))));
            })
                .join(", "))
                ? " ".concat(tmp, " ")
                : "",
            "}",
        ].join("");
        object = outStr;
    }
    return String(object).replaceAll(/(?<!\\)\[/g, "\\[");
}
