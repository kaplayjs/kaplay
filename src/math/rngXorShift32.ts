import type { RandomGenerator } from "./random";

/**
 * A random number generator using the xorshift32 algorithm.
 *
 * @group Math
 * @subgroup Random
 */

export class XorShift32 implements RandomGenerator {
    /**
     * The current seed value used by the random number generator.
     */
    seed: number;

    constructor(seed?: number) {
        this.seed = seed || (Math.random() + 0.001); // Note: Adding a small value as 0 is forbidden
    }

    save() {
        return JSON.stringify({ seed: this.seed });
    }

    load(data: string) {
        const seedData = JSON.parse(data);
        if (seedData?.seed) {
            this.seed = seedData.seed;
            return true;
        }

        return false;
    }

    gen(): number {
        let x = this.seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;

        this.seed = x >>> 0;
        return this.seed / 0xffffffff;
    }
}
