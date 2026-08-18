import { describe, expect, test } from "vitest";
import { roulette } from "../../src/math/math";
import { RNG } from "../../src/math/random";
import { Alea } from "../../src/math/rngAlea";
import { LinearCongruentialEngine } from "../../src/math/rngLce";
import { XorShift32 } from "../../src/math/rngXorShift32";

describe("random", () => {
    test("random is in domain [0,1)", () => {
        const rng = new RNG({ type: "xorshift32" });
        for (let i = 0; i < 1000; i++) {
            let index = rng.gen();
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(1);
        }
    });
    test("random integer is in domain [0,max)", () => {
        const rng = new RNG({ type: "xorshift32" });
        for (let i = 0; i < 1000; i++) {
            let index = rng.genInteger(10);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(10);
        }
    });
    test("roulette gives a valid index", () => {
        const rng = new RNG({ type: "xorshift32" });
        for (let i = 0; i < 1000; i++) {
            let index = roulette([1, 3, 6], rng);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(3);
        }
    });

    test("should create a LinearCongruentialEngine RNG when using 'lce' as the type", () => {
        const rng = new RNG({ type: "lce" });
        expect(rng.rng).toBeInstanceOf(LinearCongruentialEngine);
    });

    test("should create an XorShift32 RNG when using 'xorshift32' as the type", () => {
        const rng = new RNG({ type: "xorshift32" });
        expect(rng.rng).toBeInstanceOf(XorShift32);
    });

    test("should create an Alea RNG when using 'alea' as the type", () => {
        const rng = new RNG({ type: "alea" });
        expect(rng.rng).toBeInstanceOf(Alea);
    });

    test("should create seeded RNGs from config objects", () => {
        const lce = new RNG({ type: "lce", seed: 123 });
        expect(lce.rng).toBeInstanceOf(LinearCongruentialEngine);
        expect(lce.rng.seed).toBe(123);

        const xorshift = new RNG({ type: "xorshift32", seed: 456 });
        expect(xorshift.rng).toBeInstanceOf(XorShift32);
        expect(xorshift.rng.seed).toBe(456);

        const alea = new RNG({ type: "alea", seed: ["seed-1", "seed-2"] });
        expect(alea.rng).toBeInstanceOf(Alea);
        expect(alea.rng.seed).toEqual(["seed-1", "seed-2"]);
    });
});
