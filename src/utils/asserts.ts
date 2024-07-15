import { Color } from "../math/color";
import { Vec2 } from "../math/math";

export const arrayIsColor = (arr: unknown[]): arr is Color[] => {
    return arr[0] instanceof Color;
};

export const arrayIsVec2 = (arr: unknown[]): arr is Vec2[] => {
    return arr[0] instanceof Vec2;
};

export const arrayIsNumber = (arr: unknown[]): arr is number[] => {
    return typeof arr[0] === "number";
};

export function isClass(obj: any): obj is Function {
    return obj?.prototype
        && Object.getOwnPropertyDescriptor(obj.prototype, "constructor")
            !== undefined;
}
