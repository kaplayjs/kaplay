import { deg2rad, vec2 } from "./math";
import type { Vec2 } from "./Vec2";

export function createRegularPolygon(
    radius: number,
    sides: number,
    startAngle: number = 0,
): Vec2[] {
    startAngle = deg2rad(startAngle);
    let x = radius * Math.cos(startAngle);
    let y = radius * Math.sin(startAngle);
    const angle = 2 * Math.PI / sides;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const poly: Vec2[] = [];
    for (let i = 0; i < sides; i++) {
        poly.push(vec2(x, y));
        [x, y] = [x * c - y * s, x * s + y * c];
    }
    return poly;
}

export function createStarPolygon(
    radius1: number,
    radius2: number,
    sides: number,
    startAngle: number = 0,
): Vec2[] {
    startAngle = deg2rad(startAngle);
    let x = Math.cos(startAngle);
    let y = Math.sin(startAngle);
    const angle = 2 * Math.PI / sides;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const poly: Vec2[] = [vec2(0)];
    for (let i = 0; i < sides + 1; i++) {
        const radius = i & 1 ? radius2 : radius1;
        poly.push(vec2(x * radius, y * radius));
        [x, y] = [x * c - y * s, x * s + y * c];
    }
    return poly;
}
