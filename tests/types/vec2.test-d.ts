import { describe, test } from "vitest";
import { kaplay } from "../../src/kaplay";

describe("Type Allowance on Vec2 and Vec2Like", () => {
    const k = kaplay();

    const Vec2 = k.Vec2;
    const vec2 = k.vec2;

    const vec = {
        x: 1,
        y: 2,
    };

    const vertex = {
        x: 1,
        y: 2,
        r: 3,
        g: 4,
        b: 5,
        u: 6,
        v: 7,
        a: 8,
    };

    test("Vec2 noninstance allows object with x and y and nothing else", () => {
        Vec2.addc(vec, 1, 1, vec2());
        // @ts-expect-error
        Vec2.addc(vertex, 1, 1, vec2());
    });
});
