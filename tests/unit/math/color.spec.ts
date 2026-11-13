import { expect, test } from "@playwright/test";
import { Color, rgb } from "../../../src/math/color";

test.describe("Color creation using class", () => {
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

test.describe("Color creation using rgb function", () => {
    test("rgb(255, 255, 255) should return Color(255, 255, 255)", () => {
        const color = rgb(255, 255, 255);
        expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });

    test("rgb(11, 25, 6) should return Color(11, 25, 6)", () => {
        const color = rgb(11, 25, 6);
        expect(color).toEqual({ r: 11, g: 25, b: 6 });
    });
});

test.describe("Color to hex", () => {
    test("rgb(18, 52, 86).toHex() should return #123456", () => {
        expect(rgb(18, 52, 86).toHex()).toBe("#123456");
    });

    test("rgb(0, 0, 0).toHex() should return #000000", () => {
        expect(rgb(0, 0, 0).toHex()).toBe("#000000");
    });

    test("toHex() should truncate fractional channels", () => {
        expect(new Color(254.6, 127.5, 0.4).toHex()).toBe("#fe7f00");
    });

    test("toHex() of a lerped color should be a valid hex color", () => {
        const color = rgb(255, 128, 0).lerp(rgb(255, 128, 1), 0.5);
        expect(color.toHex()).toMatch(/^#[0-9a-f]{6}$/);
        expect(Color.fromHex(color.toHex())).toEqual(rgb(255, 128, 0));
    });
});
