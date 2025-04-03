export const clamp = (
    val: number,
    min: number,
    max: number,
): number => {
    if (min > max) {
        return clamp(val, max, min);
    }
    return Math.min(Math.max(val, min), max);
};
