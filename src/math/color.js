"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hsl2rgb = exports.Color = void 0;
exports.rgb = rgb;
var colorMap_1 = require("../constants/colorMap");
var clamp_1 = require("./clamp");
var lerpNumber_1 = require("./lerpNumber");
/**
 * 0-255 RGBA color.
 *
 * @group Math
 */
var Color = /** @class */ (function () {
    function Color(r, g, b) {
        /** Red (0-255. */
        this.r = 255;
        /** Green (0-255). */
        this.g = 255;
        /** Blue (0-255). */
        this.b = 255;
        this.r = (0, clamp_1.clamp)(r, 0, 255);
        this.g = (0, clamp_1.clamp)(g, 0, 255);
        this.b = (0, clamp_1.clamp)(b, 0, 255);
    }
    Color.fromArray = function (arr) {
        return new Color(arr[0], arr[1], arr[2]);
    };
    /**
     * Create color from hex string or literal.
     *
     * @example
     * ```js
     * Color.fromHex(0xfcef8d)
     * Color.fromHex("#5ba675")
     * Color.fromHex("d46eb3")
     * ```
     *
     * @since v3000.0
     */
    Color.fromHex = function (hex) {
        if (typeof hex === "number") {
            return new Color((hex >> 16) & 0xff, (hex >> 8) & 0xff, (hex >> 0) & 0xff);
        }
        else if (typeof hex === "string") {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!result)
                throw new Error("Invalid hex color format");
            return new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
        }
        else {
            throw new Error("Invalid hex color format");
        }
    };
    // TODO: use range of [0, 360] [0, 100] [0, 100]?
    Color.fromHSL = function (h, s, l) {
        if (s == 0) {
            return new Color(255 * l, 255 * l, 255 * l);
        }
        var hue2rgb = function (p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        var r = hue2rgb(p, q, h + 1 / 3);
        var g = hue2rgb(p, q, h);
        var b = hue2rgb(p, q, h - 1 / 3);
        return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    };
    /**
     * Create a color from a CSS color name
     *
     * @param cssColor - The color name.
     *
     * @example
     * ```js
     * loadHappy();
     *
     * add([
     *     rect(512, 512, {
     *         radius: [0, 96, 96, 96]
     *     }),
     *     color("#663399"),
     *     pos(40, 40),
     * ]);
     *
     * add([
     *     text("css", { size: 192, font: "happy" }),
     *     pos(90, 310)
     * ]);
     * ```
     *
     * @static
     * @returns The color.
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    Color.fromCSS = function (cssColor) {
        var color = colorMap_1.CSS_COLOR_MAP[cssColor];
        // for js users
        if (!color)
            throw new Error("Can't use an invalid CSS color");
        return Color.fromHex(color);
    };
    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b);
    };
    /** Lighten the color (adds RGB by n). */
    Color.prototype.lighten = function (a) {
        return new Color(this.r + a, this.g + a, this.b + a);
    };
    /** Darkens the color (subtracts RGB by n). */
    Color.prototype.darken = function (a) {
        return this.lighten(-a);
    };
    Color.prototype.invert = function () {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b);
    };
    Color.prototype.mult = function (other) {
        return new Color(this.r * other.r / 255, this.g * other.g / 255, this.b * other.b / 255);
    };
    /**
     * Linear interpolate to a destination color.
     *
     * @since v3000.0
     */
    Color.prototype.lerp = function (dest, t) {
        return new Color((0, lerpNumber_1.lerpNumber)(this.r, dest.r, t), (0, lerpNumber_1.lerpNumber)(this.g, dest.g, t), (0, lerpNumber_1.lerpNumber)(this.b, dest.b, t));
    };
    /**
     * Convert color into HSL format.
     *
     * @since v3001.0
     */
    Color.prototype.toHSL = function () {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h = (max + min) / 2;
        var s = h;
        var l = h;
        if (max == min) {
            h = s = 0;
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, l];
    };
    Color.prototype.eq = function (other) {
        return this.r === other.r
            && this.g === other.g
            && this.b === other.b;
    };
    Color.prototype.toString = function () {
        return "rgb(".concat(this.r, ", ").concat(this.g, ", ").concat(this.b, ")");
    };
    /**
     * Return the hex string of color.
     *
     * @since v3000.0
     */
    Color.prototype.toHex = function () {
        return "#"
            + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16)
                .slice(1);
    };
    /**
     * Return the color converted to an array.
     *
     * @since v3001.0
     */
    Color.prototype.toArray = function () {
        return [this.r, this.g, this.b];
    };
    Color.RED = new Color(255, 0, 0);
    Color.GREEN = new Color(0, 255, 0);
    Color.BLUE = new Color(0, 0, 255);
    Color.YELLOW = new Color(255, 255, 0);
    Color.MAGENTA = new Color(255, 0, 255);
    Color.CYAN = new Color(0, 255, 255);
    Color.WHITE = new Color(255, 255, 255);
    Color.BLACK = new Color(0, 0, 0);
    return Color;
}());
exports.Color = Color;
function rgb() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 0) {
        return new Color(255, 255, 255);
    }
    else if (args.length === 1) {
        var cl = args[0];
        if (cl instanceof Color) {
            // rgb(new Color(255, 255, 255))
            return cl.clone();
        }
        else if (typeof cl === "string") {
            if (cl[0] != "#" && colorMap_1.CSS_COLOR_MAP[cl]) {
                return Color.fromCSS(cl);
            }
            return Color.fromHex(args[0]);
        }
        else if (Array.isArray(args[0]) && args[0].length === 3) {
            // rgb([255, 255, 255])
            return Color.fromArray(args[0]);
        }
    }
    else if (args.length === 2) {
        if (args[0] instanceof Color) {
            return args[0].clone();
        }
    }
    else if (args.length === 3 || args.length === 4) {
        return new Color(args[0], args[1], args[2]);
    }
    throw new Error("Invalid color arguments");
}
var hsl2rgb = function (h, s, l) {
    return Color.fromHSL(h, s, l);
};
exports.hsl2rgb = hsl2rgb;
