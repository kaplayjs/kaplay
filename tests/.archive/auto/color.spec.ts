import { describe, expect, test } from "vitest";
import { Color, rgb } from "../../src/math/color";

describe("Color creation using class", () => {
    test("new Color(44, 44, 44) should return Color(44, 44, 44)", () => {
        const color = new Color(44, 44, 44);
        expect(color).toEqual({ r: 44, g: 44, b: 44 });
    });

    test("Color().fromArray([22, 43, 79]) should return Color(22, 43, 79)", () => {
        const color = Color.fromArray([22, 43, 79]);
        expect(color).toEqual({ r: 22, g: 43, b: 79 });
    });

    test("Color().fromHex(0x123456) should return Color(0x12, 0x34, 0x56)", () => {
        const color = Color.fromHex(0x123456);
        expect(color).toEqual({ r: 0x12, g: 0x34, b: 0x56 });
    });

    test("Color().fromHex('#234567') should return Color(0x23, 0x45, 0x67)", () => {
        const color = Color.fromHex("#234567");
        expect(color).toEqual({ r: 0x23, g: 0x45, b: 0x67 });
    });
});

describe("Color creation using rbg() utility", () => {
    test("rgb(255, 255, 255) should return Color(255, 255, 255)", () => {
        const color = rgb(255, 255, 255);
        expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });

    test("rgb(11, 25, 6) should return Color(11, 25, 6)", () => {
        const color = rgb(11, 25, 6);
        expect(color).toEqual({ r: 11, g: 25, b: 6 });
    });
});
