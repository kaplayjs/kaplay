// Algorithm by Johannes Baagøe
// The original article isn't online anymore, but there is a snapshot on internet archive:
// http://web.archive.org/web/20101106000458/http://baagoe.com/en/RandomMusings/javascript/
// This is the slim TypeScript variant of this implementation:
// https://github.com/coverslide/node-alea

import type { RandomGenerator } from "./random";

type AleaInternalState = {
    s: [number, number, number];
    c: number;
};

// Three string seeds to ensure good entropy
export const getRandomSeeds = () => {
    return [
        Math.random().toString(36).slice(2),
        Math.random().toString(36).slice(2),
        Math.random().toString(36).slice(2),
    ];
};

const getMash = () => {
    let n = 0xefc8249d;

    const mash = (seed: string): number => {
        for (let i = 0; i < seed.length; i++) {
            n += seed.charCodeAt(i);
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };

    return mash;
};

const createState = (seeds: string[]): AleaInternalState => {
    const mash = getMash();
    const state: AleaInternalState = {
        s: [mash(" "), mash(" "), mash(" ")],
        c: 1,
    };

    seeds.forEach((seed) => {
        state.s.forEach((_, i) => {
            state.s[i] -= mash(seed);

            if (state.s[i] < 0) {
                state.s[i] += 1;
            }
        });
    });

    return state;
};

const genFromState = (state: AleaInternalState) => {
    const t = 2091639 * state.s[0] + state.c * 2.3283064365386963e-10; // 2^-32
    state.c = t | 0; // quicker floor
    state.s[0] = state.s[1];
    state.s[1] = state.s[2];
    state.s[2] = t - state.c;
    return state.s[2];
};

/**
 * A random number generator using Alea algorithm by Johannes Baagøe.
 *
 * @group Math
 * @subgroup Random
 */
export class Alea implements RandomGenerator {
    /**
     * List of string seeds used to initialize the Alea random number generator.
     */
    private _seeds: string[];

    /**
     * Generate a random number in [0-1).
     *
     * @returns A number between 0 and 1.
     */
    gen: () => number;
    /**
     * Internal state of the Alea random number generator.
     */
    state: AleaInternalState;

    /**
     * To ensure good entropy, use three string seeds.
     * If not provided, three random strings will be generated.
     */
    constructor(seed?: string | string[]) {
        const seeds = seed !== undefined ? [seed].flat() : [];
        // Convert all seeds to strings in case they slip when people are not using typescript
        this._seeds = seeds.length > 0
            ? seeds.map((seed) => seed.toString())
            : getRandomSeeds();
        this.state = createState(this._seeds);
        this.gen = () => genFromState(this.state);
    }

    /**
     * List of string seeds used to initialize the Alea random number generator.
     */
    get seed(): string[] {
        return this._seeds;
    }

    set seed(value: string | string[]) {
        const seeds = [value].flat();
        // Convert all seeds to strings in case they slip when people are not using typescript
        this._seeds = seeds.map((seed) => seed.toString());
        this.state = createState(this._seeds);
        this.gen = () => genFromState(this.state);
    }

    save() {
        return JSON.stringify({ seeds: this.seed, state: this.state });
    }

    load(data: string) {
        const seedData = JSON.parse(data);

        if (
            // Seeds have to be an array of strings
            Array.isArray(seedData?.seeds)
            && seedData.seeds.every((item: unknown) => typeof item === "string")
            // State has to be an object with 's' and 'c' properties
            && Array.isArray(seedData?.state?.s)
            && seedData.state.s.length === 3
            && seedData.state.s.every((item: unknown) => Number.isFinite(item))
            && Number.isFinite(seedData?.state?.c)
        ) {
            this.seed = seedData.seeds;
            this.state = seedData.state;
            return true;
        }

        return false;
    }
}
