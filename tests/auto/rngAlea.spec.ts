import { describe, expect, test } from "vitest";
import { Alea } from "../../src/math/rngAlea";

// Values used for testing are generated using https://github.com/coverslide/node-alea
// on which this implementation is based

describe("rng alea", () => {
    test("should return a specific sequence of number for known seeds", () => {
        // Single seed
        const rngSingle = new Alea("seed");

        expect(rngSingle.gen()).toBeCloseTo(0.03475257847458124);
        expect(rngSingle.gen()).toBeCloseTo(0.5790662220679224);
        expect(rngSingle.gen()).toBeCloseTo(0.605906231328845);

        // Multiple seeds
        const rngMulti = new Alea(["seed-1", "seed-2"]);

        expect(rngMulti.gen()).toBeCloseTo(0.7575195648241788);
        expect(rngMulti.gen()).toBeCloseTo(0.3492090874351561);
        expect(rngMulti.gen()).toBeCloseTo(0.8786840010434389);
    });

    test("should be deterministic - same seed produces same sequence", () => {
        // Single seed
        const rngSingle1 = new Alea("seed");
        const rngSingle2 = new Alea("seed");

        const seqSingle1 = Array(10)
            .fill(0)
            .map(() => rngSingle1.gen());
        const seqSingle2 = Array(10)
            .fill(0)
            .map(() => rngSingle2.gen());

        expect(seqSingle1).toEqual(seqSingle2);

        // Multiple seeds
        const rngMulti1 = new Alea(["seed-1", "seed-2"]);
        const rngMulti2 = new Alea(["seed-1", "seed-2"]);

        const seqMulti1 = Array(10)
            .fill(0)
            .map(() => rngMulti1.gen());
        const seqMulti2 = Array(10)
            .fill(0)
            .map(() => rngMulti2.gen());

        expect(seqMulti1).toEqual(seqMulti2);
    });

    test("should produce different sequences for different seeds", () => {
        const rng1 = new Alea("seed-1");
        const rng2 = new Alea("seed-2");

        const seq1 = Array(10)
            .fill(0)
            .map(() => rng1.gen());
        const seq2 = Array(10)
            .fill(0)
            .map(() => rng2.gen());

        expect(seq1).not.toEqual(seq2);
    });

    test("should produce values in the range [0, 1)", () => {
        const rng = new Alea("test-range-seed");

        for (let i = 0; i < 1000; i++) {
            const val = rng.gen();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    test("should run when no seed is not provided", () => {
        const rng = new Alea();
        const val = rng.gen();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
    });

    test("should save and load the current state", () => {
        const rng = new Alea("seed");

        // Generate some values to advance the make sure internal state is changed
        for (let i = 0; i < 5; i++) {
            rng.gen();
        }

        // Save internal state
        const state = rng.save();

        // Generate expected values using the current state
        const expected = Array(5)
            .fill(0)
            .map(() => rng.gen());

        // Create a new RNG with a different seed and load the saved state
        const restored = new Alea("different-seed");

        expect(restored.load(state)).toBe(true);

        // Generate values using the restored RNG and compare with expected
        const actual = Array(5)
            .fill(0)
            .map(() => restored.gen());

        expect(actual).toEqual(expected);
    });

    test("should load a saved state with zero carry", () => {
        const rng = new Alea("different-seed");
        const state = JSON.stringify({
            seeds: ["seed"],
            state: {
                s: [0.1, 0.2, 0.3],
                c: 0,
            },
        });

        expect(rng.load(state)).toBe(true);
        expect(rng.save()).toBe(state);
    });
});
