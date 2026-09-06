import { expect, test } from "vitest";
import { deg2rad, Mat23, vec2 } from "../../src/math/math";

test("Mat23.fromTranslation(45).getTranslation() should return 2, 3", () => {
    const m = Mat23.fromTranslation(vec2(2, 3));
    const t = m.getTranslation();
    expect(t.x).toEqual(2);
    expect(t.y).toEqual(3);
});

test("Mat23.fromRotation(45).getRotation() should return 45", () => {
    const m = Mat23.fromRotation(deg2rad(45));
    expect(m.getRotation()).toEqual(45);
});

test("Mat23.fromScale(2, 3).getScale() should return 2, 3", () => {
    const m = Mat23.fromScale(vec2(2, 3));
    const t = m.getScale();
    expect(t.x).toEqual(2);
    expect(t.y).toEqual(3);
});

test("new Mat23().scaleSelf(2, 3).getScale() should return 2, 3", () => {
    const m = new Mat23().scaleSelf(2, 3);
    const t = m.getScale();
    expect(t.x).toEqual(2);
    expect(t.y).toEqual(3);
});

test("Mat23.fromSkew(45, 0) should return skew matrix", () => {
    const m = Mat23.fromSkew(vec2(deg2rad(45), 0));
    expect(m.a).toEqual(1);
    expect(m.b).toEqual(0);
    expect(m.c).toEqual(Math.tan(deg2rad(45)));
    expect(m.d).toEqual(1);
});

test("Mat23.fromSkew(0, 45) should return skew matrix", () => {
    const m = Mat23.fromSkew(vec2(0, deg2rad(45)));
    expect(m.a).toEqual(1);
    expect(m.b).toEqual(Math.tan(deg2rad(45)));
    expect(m.c).toEqual(0);
    expect(m.d).toEqual(1);
});

test("Mat23.fromSkew(45, 0).getSkew() should return 45", () => {
    const m = Mat23.fromSkew(vec2(deg2rad(45), 0));
    const t = m.getSkew();
    expect(t.x).toEqual(45);
    expect(t.y).toEqual(0);
});

test("new Mat23().skewSelf(45, 0) should return skew matrix", () => {
    const m = new Mat23().skewSelf(45, 0);
    expect(m.a).toEqual(1);
    expect(m.b).toEqual(0);
    expect(m.c).toEqual(Math.tan(deg2rad(45)));
    expect(m.d).toEqual(1);
});

test("new Mat23().skewSelf(0, 45) should return skew matrix", () => {
    const m = new Mat23().skewSelf(0, 45);
    expect(m.a).toEqual(1);
    expect(m.b).toEqual(Math.tan(deg2rad(45)));
    expect(m.c).toEqual(0);
    expect(m.d).toEqual(1);
});

test("new Mat23().skewSelf(45, 0).getSkew() should return 45", () => {
    const m = new Mat23().skewSelf(45, 0);
    const t = m.getSkew();
    expect(t.x).toEqual(45);
    expect(t.y).toEqual(0);
});

test("new Mat23().skewSelf(45, 0).transform(1, 0) should not skew", () => {
    const m = new Mat23().skewSelf(45, 0);
    const t = m.transform(vec2(1, 0));
    expect(t.x).toEqual(1);
    expect(t.y).toEqual(0);
});

test("new Mat23().skewSelf(45, 0).transform(1, 1) should skew right", () => {
    const m = new Mat23().skewSelf(45, 0);
    const t = m.transform(vec2(1, 1));
    expect(t.x).toEqual(2);
    expect(t.y).toEqual(1);
});

test("new Mat23().skewSelf(0, 45).transform(0, 1) should not skew", () => {
    const m = new Mat23().skewSelf(0, 45);
    const t = m.transform(vec2(0, 1));
    expect(t.x).toEqual(0);
    expect(t.y).toEqual(1);
});

test("new Mat23().skewSelf(0, 45).transform(1, 1) should skew down", () => {
    const m = new Mat23().skewSelf(0, 45);
    const t = m.transform(vec2(1, 1));
    expect(t.x).toEqual(1);
    expect(t.y).toEqual(2);
});
