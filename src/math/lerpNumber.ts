export function lerpNumber(
    a: number,
    b: number,
    t: number,
) {
    return a + (b - a) * t;
}
