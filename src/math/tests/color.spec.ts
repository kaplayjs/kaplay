import { expect, test } from "vitest";
import { Color, rgb } from "../color";

test("new Color(44, 44, 44) should return Color(44, 44, 44)", () => {
    const color = new Color(44, 44, 44);
    expect(color).toEqual({ r: 44, g: 44, b: 44 });
});

test("Color().fromArray([22, 43, 79]) should return Color(22, 43, 79)", () => {
    const color = Color.fromArray([22, 43, 79]);
    expect(color).toEqual({ r: 22, g: 43, b: 79 });
});

test("Color().fromHex(0x123456) should return Color(18, 52, 86)", () => {
    const color = Color.fromHex(0x123456);
    expect(color).toEqual({ r: 18, g: 52, b: 86 });
});

test("Color().fromHex('#234567') should return Color(35, 69, 103)", () => {
    const color = Color.fromHex("#234567");
    expect(color).toEqual({ r: 35, g: 69, b: 103 });
});

test("rgb(255, 255, 255) should return Color(255, 255, 255)", () => {
    const color = rgb(255, 255, 255);
    expect(color).toEqual({ r: 255, g: 255, b: 255 });
});

test("rgb(11, 25, 6) should return Color(11, 25, 6)", () => {
    const color = rgb(11, 25, 6);
    expect(color).toEqual({ r: 11, g: 25, b: 6 });
});
