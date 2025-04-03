import { clamp } from "./clamp";
import { lerp } from "./math";

export type RGBValue = [number, number, number];
export type RGBAValue = [number, number, number, number];

// For using color("gray"), color("red")
const CSS_COLOR_MAP = {
    black: "#000000",
    silver: "#c0c0c0",
    gray: "#808080",
    white: "#ffffff",
    maroon: "#800000",
    red: "#ff0000",
    purple: "#800080",
    fuchsia: "#ff00ff",
    green: "#008000",
    lime: "#00ff00",
    olive: "#808000",
    yellow: "#ffff00",
    navy: "#000080",
    blue: "#0000ff",
    teal: "#008080",
    aqua: "#00ffff",
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    blanchedalmond: "#ffebcd",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    oldlace: "#fdf5e6",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    rebeccapurple: "#663399",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    whitesmoke: "#f5f5f5",
    yellowgreen: "#9acd32",
};

export type CSSColor = keyof typeof CSS_COLOR_MAP;

/**
 * 0-255 RGBA color.
 *
 * @group Math
 */
export class Color {
    /** Red (0-255. */
    r: number = 255;
    /** Green (0-255). */
    g: number = 255;
    /** Blue (0-255). */
    b: number = 255;

    constructor(r: number, g: number, b: number) {
        this.r = clamp(r, 0, 255);
        this.g = clamp(g, 0, 255);
        this.b = clamp(b, 0, 255);
    }

    static fromArray(arr: [number, number, number]) {
        return new Color(arr[0], arr[1], arr[2]);
    }

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
    static fromHex(hex: string | number) {
        if (typeof hex === "number") {
            return new Color(
                (hex >> 16) & 0xff,
                (hex >> 8) & 0xff,
                (hex >> 0) & 0xff,
            );
        }
        else if (typeof hex === "string") {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                hex,
            );

            if (!result) throw new Error("Invalid hex color format");

            return new Color(
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
            );
        }
        else {
            throw new Error("Invalid hex color format");
        }
    }

    // TODO: use range of [0, 360] [0, 100] [0, 100]?
    static fromHSL(h: number, s: number, l: number) {
        if (s == 0) {
            return new Color(255 * l, 255 * l, 255 * l);
        }

        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = hue2rgb(p, q, h + 1 / 3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1 / 3);

        return new Color(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255),
        );
    }

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
    static fromCSS(cssColor: CSSColor) {
        const color = CSS_COLOR_MAP[cssColor];
        // for js users
        if (!color) throw new Error("Can't use an invalid CSS color");

        return Color.fromHex(color);
    }

    static RED = new Color(255, 0, 0);
    static GREEN = new Color(0, 255, 0);
    static BLUE = new Color(0, 0, 255);
    static YELLOW = new Color(255, 255, 0);
    static MAGENTA = new Color(255, 0, 255);
    static CYAN = new Color(0, 255, 255);
    static WHITE = new Color(255, 255, 255);
    static BLACK = new Color(0, 0, 0);

    clone(): Color {
        return new Color(this.r, this.g, this.b);
    }

    /** Lighten the color (adds RGB by n). */
    lighten(a: number): Color {
        return new Color(this.r + a, this.g + a, this.b + a);
    }

    /** Darkens the color (subtracts RGB by n). */
    darken(a: number): Color {
        return this.lighten(-a);
    }

    invert(): Color {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b);
    }

    mult(other: Color): Color {
        return new Color(
            this.r * other.r / 255,
            this.g * other.g / 255,
            this.b * other.b / 255,
        );
    }

    /**
     * Linear interpolate to a destination color.
     *
     * @since v3000.0
     */
    lerp(dest: Color, t: number): Color {
        return new Color(
            lerp(this.r, dest.r, t),
            lerp(this.g, dest.g, t),
            lerp(this.b, dest.b, t),
        );
    }

    /**
     * Convert color into HSL format.
     *
     * @since v3001.0
     */
    toHSL(): [number, number, number] {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = (max + min) / 2;
        let s = h;
        const l = h;
        if (max == min) {
            h = s = 0;
        }
        else {
            const d = max - min;
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
    }

    eq(other: Color): boolean {
        return this.r === other.r
            && this.g === other.g
            && this.b === other.b;
    }

    toString(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    /**
     * Return the hex string of color.
     *
     * @since v3000.0
     */
    toHex(): string {
        return "#"
            + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16)
                .slice(1);
    }

    /**
     * Return the color converted to an array.
     *
     * @since v3001.0
     */
    toArray(): Array<number> {
        return [this.r, this.g, this.b];
    }
}

export type ColorArgs =
    // rgb(new Color(255, 255, 255))
    | [Color]
    /**
     * rgb(new Color(255, 255, 255), 1)
     *
     * This is only used to parse directly the color of background. This
     * syntax shouldn't be used to set opacity. Use `opacity()` comp instead.
     */
    | [Color, number]
    // rgb(255, 255, 255)
    | RGBValue
    /**
     * rgb(255, 255, 255, 1)
     *
     * This is only used to parse directly the color of background. This
     * syntax shouldn't be used to set opacity. Use `opacity()` comp instead.
     */
    | RGBAValue
    // rgb("#ffffff")
    | [string]
    | [number[]]
    | []
    | [CSSColor & (string & {})];

export function rgb(...args: ColorArgs): Color {
    if (args.length === 0) {
        return new Color(255, 255, 255);
    }
    else if (args.length === 1) {
        const cl = args[0];

        if (cl instanceof Color) {
            // rgb(new Color(255, 255, 255))
            return cl.clone();
        }
        else if (typeof cl === "string") {
            if (cl[0] != "#" && CSS_COLOR_MAP[cl as CSSColor]) {
                return Color.fromCSS(cl as CSSColor);
            }

            return Color.fromHex(args[0]);
        }
        else if (Array.isArray(args[0]) && args[0].length === 3) {
            // rgb([255, 255, 255])
            return Color.fromArray(args[0] as [number, number, number]);
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

export const hsl2rgb = (h: number, s: number, l: number) =>
    Color.fromHSL(h, s, l);
