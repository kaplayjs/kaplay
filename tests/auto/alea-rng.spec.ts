import { expect, test } from "vitest";
import Alea from "../../src/math/alea-rng";

// Values used for testing are generated using https://github.com/coverslide/node-alea
// on which this implementation is based

test("should return a specific sequence of number for known seeds", () => {
    // Single seed
    const rngSingle = Alea("seed");

    expect(rngSingle()).toBeCloseTo(0.03475257847458124);
    expect(rngSingle()).toBeCloseTo(0.5790662220679224);
    expect(rngSingle()).toBeCloseTo(0.605906231328845);

    // Multiple seeds
    const rngMulti = Alea("seed-1", "seed-2");

    expect(rngMulti()).toBeCloseTo(0.7575195648241788);
    expect(rngMulti()).toBeCloseTo(0.3492090874351561);
    expect(rngMulti()).toBeCloseTo(0.8786840010434389);
});

test("should be deterministic - same seed produces same sequence", () => {
    // Single seed
    const rngSingle1 = Alea("seed");
    const rngSingle2 = Alea("seed");

    const seqSingle1 = Array(10)
        .fill(0)
        .map(() => rngSingle1());
    const seqSingle2 = Array(10)
        .fill(0)
        .map(() => rngSingle2());

    expect(seqSingle1).toEqual(seqSingle2);

    // Multiple seeds
    const rngMulti1 = Alea("seed-1", "seed-2");
    const rngMulti2 = Alea("seed-1", "seed-2");

    const seqMulti1 = Array(10)
        .fill(0)
        .map(() => rngMulti1());
    const seqMulti2 = Array(10)
        .fill(0)
        .map(() => rngMulti2());

    expect(seqMulti1).toEqual(seqMulti2);
});

test("should produce different sequences for different seeds", () => {
    const rng1 = Alea("seed-1");
    const rng2 = Alea("seed-2");

    const seq1 = Array(10)
        .fill(0)
        .map(() => rng1());
    const seq2 = Array(10)
        .fill(0)
        .map(() => rng2());

    expect(seq1).not.toEqual(seq2);
});

test("should produce values in the range [0, 1)", () => {
    const rng = Alea("test-range-seed");

    for (let i = 0; i < 1000; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
    }
});

test("should run when no seed is not provided", () => {
    const rng = Alea();
    const val = rng();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
});
