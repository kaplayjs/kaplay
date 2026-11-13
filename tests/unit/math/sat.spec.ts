import { expect, test } from "@playwright/test";
import { Polygon, Rect, vec2 } from "../../../src/math/math";
import { sat } from "../../../src/math/sat";

function rectPoly(x: number, y: number, w: number, h: number) {
    return new Polygon(new Rect(vec2(x, y), w, h).points());
}

function displacement(p1: Polygon, p2: Polygon) {
    const r = sat(p1, p2);
    expect(r).not.toBeNull();
    const d = r!.normal.scale(r!.distance);
    // avoid -0 in comparisons
    return { x: d.x + 0, y: d.y + 0, distance: r!.distance };
}

test.describe("sat()", () => {
    test("returns null for separated shapes", () => {
        expect(sat(rectPoly(0, 0, 10, 10), rectPoly(20, 0, 10, 10)))
            .toBeNull();
    });

    test("pushes along the axis with the smallest penetration", () => {
        // 4px overlap on x, 10px overlap on y
        expect(displacement(rectPoly(6, 0, 10, 10), rectPoly(0, 0, 10, 10)))
            .toEqual({ x: 4, y: 0, distance: 4 });
    });

    test("small box sunk into the top of a wide platform is pushed up", () => {
        // a 16x16 player that penetrated 20px into the top of a 160x32
        // platform: on x the player projection [72, 88] lies inside [0, 160]
        const player = rectPoly(72, 104, 16, 16);
        const platform = rectPoly(0, 100, 160, 32);
        expect(displacement(player, platform))
            .toEqual({ x: 0, y: -20, distance: 20 });
    });

    test("wide platform sunk into a small box is pushed the other way", () => {
        const player = rectPoly(72, 104, 16, 16);
        const platform = rectPoly(0, 100, 160, 32);
        expect(displacement(platform, player))
            .toEqual({ x: 0, y: 20, distance: 20 });
    });

    test("box contained on both axes is pushed out the nearest side", () => {
        // inner [40, 50] x [12, 22] inside outer [0, 100] x [0, 30]
        // exits: left 50, right 60, top 22, bottom 18 -> bottom
        expect(displacement(rectPoly(40, 12, 10, 10), rectPoly(0, 0, 100, 30)))
            .toEqual({ x: 0, y: 18, distance: 18 });
    });
});
