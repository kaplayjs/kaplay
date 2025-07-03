import { Color } from "../math/color.js";
import { Vec2 } from "../math/Vec2.js";

export function arrayIsColor(arr: unknown[]): arr is Color[] {
    return arr[0] instanceof Color;
}

export function arrayIsVec2(arr: unknown[]): arr is Vec2[] {
    return arr[0] instanceof Vec2;
}

export function arrayIsNumber(arr: unknown[]): arr is number[] {
    return typeof arr[0] === "number";
}
