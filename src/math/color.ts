import { clamp, lerp } from "./math";

export type RGBValue = [number, number, number];
export type RGBAValue = [number, number, number, number];

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

    // TODO: Type arr as tuple (no in ts-strict branch yet)
    static fromArray(arr: number[]) {
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
    | [];

export function rgb(...args: ColorArgs): Color {
    if (args.length === 0) {
        return new Color(255, 255, 255);
    }
    else if (args.length === 1) {
        if (args[0] instanceof Color) {
            // rgb(new Color(255, 255, 255))
            return args[0].clone();
        }
        else if (typeof args[0] === "string") {
            // rgb("#ffffff")
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

export const hsl2rgb = (h: number, s: number, l: number) =>
    Color.fromHSL(h, s, l);
