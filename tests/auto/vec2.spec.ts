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

test("Vec2.addScaled(vec2(2, 4), vec2(3, 5)) should return Vec2(8, 14)", () => {
    const v = vec2();
    Vec2.addScaled(vec2(2, 4), vec2(3, 5), 2, v);
    expect(v.x).toBeCloseTo(8);
    expect(v.y).toBeCloseTo(14);
});

test("Vec2.addc(vec2(2, 4), 3, 5) should return Vec2(5, 9)", () => {
    const v = vec2();
    Vec2.addc(vec2(2, 4), 3, 5, v);
    expect(v.x).toBeCloseTo(5);
    expect(v.y).toBeCloseTo(9);
});

test("Vec2.add(vec2(2, 4), vec2(3, 5)) should return Vec2(5, 9)", () => {
    const v = vec2();
    Vec2.add(vec2(2, 4), vec2(3, 5), v);
    expect(v.x).toBeCloseTo(5);
    expect(v.y).toBeCloseTo(9);
});

test("Vec2.subc(vec2(2, 4), 3, 5) should return Vec2(-1, -1)", () => {
    const v = vec2();
    Vec2.subc(vec2(2, 4), 3, 5, v);
    expect(v.x).toBeCloseTo(-1);
    expect(v.y).toBeCloseTo(-1);
});

test("Vec2.sub(vec2(2, 4), vec2(3, 5)) should return Vec2(-1, -1)", () => {
    const v = vec2();
    Vec2.sub(vec2(2, 4), vec2(3, 5), v);
    expect(v.x).toBeCloseTo(-1);
    expect(v.y).toBeCloseTo(-1);
});

test("Vec2.scale(vec2(2, 4), 3) should return Vec2(6, 12)", () => {
    const v = vec2();
    Vec2.scale(vec2(2, 4), 3, v);
    expect(v.x).toBeCloseTo(6);
    expect(v.y).toBeCloseTo(12);
});

test("Vec2.scalec(vec2(2, 4), 3, 5) should return Vec2(6, 20)", () => {
    const v = vec2();
    Vec2.scalec(vec2(2, 4), 3, 5, v);
    expect(v.x).toBeCloseTo(6);
    expect(v.y).toBeCloseTo(20);
});

test("Vec2.scalev(vec2(2, 4), vec2(3, 5)) should return Vec2(6, 20)", () => {
    const v = vec2();
    Vec2.scalev(vec2(2, 4), vec2(3, 5), v);
    expect(v.x).toBeCloseTo(6);
    expect(v.y).toBeCloseTo(20);
});

test("Vec2.dist(vec2(2, 4), vec2(4, 4)) should return 2", () => {
    const d = Vec2.dist(vec2(2, 4), vec2(4, 4));
    expect(d).toBeCloseTo(2);
});

test("Vec2.sdist(vec2(2, 4), vec2(4, 4)) should return 4", () => {
    const d = Vec2.sdist(vec2(2, 4), vec2(4, 4));
    expect(d).toBeCloseTo(4);
});

test("Vec2.len(vec2(0, 4)) should return 4", () => {
    const d = Vec2.len(vec2(0, 4));
    expect(d).toBeCloseTo(4);
});

test("Vec2.slen(vec2(0, 4)) should return 16", () => {
    const d = Vec2.slen(vec2(0, 4));
    expect(d).toBeCloseTo(16);
});

test("Vec2.unit(vec2(0, 4)) should return Vec2(0, 1)", () => {
    const v = vec2();
    Vec2.unit(vec2(0, 4), v);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
});

test("Vec2.normal(vec2(1, 0)) should return Vec2(0, -1)", () => {
    const v = vec2();
    Vec2.normal(vec2(1, 0), v);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(-1);
});

test("Vec2.rotateByAngle(vec2(1, 0), 90) should return Vec2(0, -1)", () => {
    const v = vec2();
    Vec2.rotateByAngle(vec2(1, 0), Math.PI / 2, v);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
});

test("Vec2.dot(vec2(1, 0), vec2(0, 1)) should return 0", () => {
    const d = Vec2.dot(vec2(1, 0), vec2(0, 1));
    expect(d).toBeCloseTo(0);
});

test("Vec2.dot(vec2(1, 0), vec2(1, 1)) should return 1", () => {
    const d = Vec2.dot(vec2(1, 0), vec2(1, 1));
    expect(d).toBeCloseTo(1);
});
