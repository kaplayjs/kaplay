import { expect, test } from "vitest";
import { Vec2, vec2 } from "../../src/math/math";

test("vec2(2, 1) should return Vec2(2, 1)", () => {
    const v = vec2(2, 1);
    expect(v.x).toEqual(2);
    expect(v.y).toEqual(1);
});

test("vec2.fromAngle(90) should return Vec2(0, 1)", () => {
    const v = Vec2.fromAngle(90);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
});

test("Vec2.fromAngle(45) should return Vec2(Math.cos(Math.PI / 4))", () => {
    const v = Vec2.fromAngle(45);
    expect(v.x).toBeCloseTo(Math.cos(Math.PI / 4));
    expect(v.y).toBeCloseTo(Math.cos(Math.PI / 4));
});

test("Vec2.sdist(vec2(2, 4), vec2(4, 4)) should return 4", () => {
    const d = Vec2.sdist(vec2(2, 4), vec2(4, 4));
    expect(d).toBeCloseTo(4);
});

test("Vec2.dot(vec2(1, 0), vec2(0, 1)) should return 0", () => {
    const d = Vec2.dot(vec2(1, 0), vec2(0, 1));
    expect(d).toBeCloseTo(0);
});

test("Vec2.dot(vec2(1, 0), vec2(1, 1)) should return 1", () => {
    const d = Vec2.dot(vec2(1, 0), vec2(1, 1));
    expect(d).toBeCloseTo(1);
});
