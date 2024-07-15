import type { GameObj } from "../types";

export function isFixed(obj: GameObj): boolean {
    if (obj.fixed) return true;
    return obj.parent ? isFixed(obj.parent) : false;
}

export function getRenderProps(obj: GameObj<any>) {
    return {
        color: obj.color,
        opacity: obj.opacity,
        anchor: obj.anchor,
        outline: obj.outline,
        shader: obj.shader,
        uniform: obj.uniform,
    };
}
