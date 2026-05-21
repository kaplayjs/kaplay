import { describe, expect, test } from "vitest";
import { RNG, roulette } from "../../src/math/math";

describe("random", () => {
    test("random is in domain [0,1)", () => {
        const rng = new RNG("xorshift32");
        for (let i = 0; i < 1000; i++) {
            let index = rng.gen();
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(1);
        }
    });
    test("random integer is in domain [0,max)", () => {
        const rng = new RNG("xorshift32");
        for (let i = 0; i < 1000; i++) {
            let index = rng.genInteger(10);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(10);
        }
    });
    test("roulette gives a valid index", () => {
        const rng = new RNG("xorshift32");
        for (let i = 0; i < 1000; i++) {
            let index = roulette([1, 3, 6], rng);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(3);
        }
    });
});
